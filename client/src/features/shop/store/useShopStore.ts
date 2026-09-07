import { create } from "zustand";
import { ShopItem } from "../types/shop";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useInventoryStore } from "@/features/inventory/store/useInventoryStore";
import { useDailyBonusStore } from "@/store/useDailyBonusStore";
import { playUISound } from "@/utils/audio";
import { toast } from "sonner";
import { API_BASE_URL } from "@/constants";
import { executeSequentialPurchase, getMaxPurchasableQuantity } from "../utils/shopPresentation";

interface ShopStore {
  items: ShopItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  isBuying: boolean;
  error: string | null;
  fetchShopItems: (characterId: string) => Promise<void>;
  refreshShopItems: (characterId: string, isFree?: boolean, goldCost?: number) => Promise<boolean>;
  buyItem: (characterId: string, shopItemId: string, quantity?: number) => Promise<boolean>;
}

export const useShopStore = create<ShopStore>((set, get) => ({
  items: [],
  isLoading: false,
  isRefreshing: false,
  isBuying: false,
  error: null,
  
  fetchShopItems: async (characterId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/shop/${characterId}`);
      if (!res.ok) throw new Error("Failed to fetch shop items");
      const data = await res.json();
      set({ items: data, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch shop items";
      set({ error: message, isLoading: false });
    }
  },

  refreshShopItems: async (characterId, isFree = true, goldCost = 100) => {
    if (get().isBuying || get().isRefreshing) return false;
    set({ isRefreshing: true, error: null });
    playUISound("/sounds/General/10_UI_Menu_SFX/079_Buy_sell_01.wav");

    const effectiveCost = isFree ? 0 : goldCost;
    const charStore = useCharacterStore.getState();
    const curGold = charStore.character?.gold || 0;

    if (!isFree && curGold < effectiveCost) {
      toast.error(`Insufficient Gold! Requires ${effectiveCost} Gold to rotate shop inventory.`);
      set({ isRefreshing: false });
      return false;
    }

    if (isFree) {
      useDailyBonusStore.getState().consumeShopRefresh();
    } else {
      charStore.updateIdentity({ gold: Math.max(0, curGold - effectiveCost) });
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/shop/${characterId}/refresh?cost=${effectiveCost}`, {
        method: "POST"
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Failed to rotate shop stock" }));
        throw new Error(err.detail || "Failed to rotate shop stock");
      }
      const data = await res.json();
      set({ items: data, isRefreshing: false });
      if (isFree) {
        toast.success("Shop stock rotated with new items (Free Reroll Used)!");
      } else {
        toast.success(`Shop stock rotated (-${effectiveCost} Gold)!`);
      }
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to rotate shop stock.";
      toast.error(message);
      set({ error: message, isRefreshing: false });
      return false;
    }
  },
  
  buyItem: async (characterId, shopItemId, quantity = 1) => {
    const item = get().items.find((candidate) => candidate.id === shopItemId);
    const requestedQuantity = quantity;
    if (get().isBuying || get().isRefreshing) return false;

    if (!item) {
      toast.error("That ware is no longer on the merchant's shelf.");
      return false;
    }

    const wallet = useCharacterStore.getState().character;
    const balance = item.currencyType === "GOLD" ? wallet?.gold : item.currencyType === "GEMS" ? wallet?.gems : wallet?.towerTokens;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > getMaxPurchasableQuantity(item, balance ?? 0)) {
      toast.error("Check the quantity, requirements, stock, and your purse before purchasing.");
      return false;
    }
    set({ isBuying: true });
    const result = await executeSequentialPurchase(requestedQuantity, async () => {
      const res = await fetch(`${API_BASE_URL}/api/shop/${characterId}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop_item_id: shopItemId }),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ detail: "Failed to purchase item" }));
        throw new Error(errorData.detail || "Failed to purchase item");
      }

      const data = await res.json();
      return data.message || "Purchase successful";
    });

    if (result.purchased === 0) {
      set({ isBuying: false });
      toast.error(result.error || "Failed to purchase item.");
      return false;
    }

    const totalCost = item.price * result.purchased;
    const charStore = useCharacterStore.getState();
    const character = charStore.character;

    if (item.currencyType === "GOLD") {
      charStore.updateIdentity({
        gold: Math.max(0, (character?.gold || 0) - totalCost),
      });
    } else if (item.currencyType === "GEMS") {
      charStore.updateIdentity({
        gems: Math.max(0, (character?.gems || 0) - totalCost),
      });
    } else if (item.currencyType === "TOWER_TOKENS") {
      charStore.updateIdentity({
        towerTokens: Math.max(0, (character?.towerTokens || 0) - totalCost),
      });
    }

    if (item.stock !== null) {
      set((state) => ({
        items: state.items.map((candidate) => {
          if (candidate.id !== shopItemId || candidate.stock === null) {
            return candidate;
          }

          const nextStock = Math.max(0, candidate.stock - result.purchased);
          return { ...candidate, stock: nextStock, inStock: nextStock > 0 };
        }),
      }));
    }

    playUISound("/sounds/General/10_UI_Menu_SFX/079_Buy_sell_01.wav");

    if (result.error) {
      toast.warning(
        `${result.purchased} of ${requestedQuantity} acquired. ${result.error}`,
      );
    } else {
      toast.success(
        result.purchased > 1
          ? `${result.purchased} × ${item.name} added to your vault.`
          : result.lastMessage || `${item.name} added to your vault.`,
      );
    }

    await Promise.allSettled([
      get().fetchShopItems(characterId),
      useInventoryStore.getState().fetchInventory(characterId),
    ]);
    set({ isBuying: false });

    return true;
  }
}));
