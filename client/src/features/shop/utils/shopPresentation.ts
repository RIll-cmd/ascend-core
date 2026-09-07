import type { ShopItem } from "../types/shop";

export type ShopCategory =
  | "provisions"
  | "arms"
  | "curios"
  | "black-market";

const EQUIPMENT_TYPES = new Set([
  "WEAPON",
  "ARMOR",
  "EQUIPMENT",
  "ACCESSORY",
  "HELM",
  "HELMET",
  "BOOTS",
  "RING",
  "SHIELD",
  "GLOVES",
  "NECKLACE",
]);

const MAX_PURCHASE_QUANTITY = 99;

export const rarityColors = {
  COMMON: "#a8987c", RARE: "#789b88", EPIC: "#b77762",
  LEGENDARY: "#d9a441", MYTHIC: "#c68545",
};

interface SequentialPurchaseResult {
  purchased: number;
  lastMessage: string | null;
  error: string | null;
}

export function getShopCategory(item: ShopItem): ShopCategory {
  if (item.currencyType === "TOWER_TOKENS") return "black-market";

  const itemType = item.type.toUpperCase();
  if (EQUIPMENT_TYPES.has(itemType)) return "arms";
  if (itemType === "CONSUMABLE") return "provisions";
  return "curios";
}

export function getMaxPurchasableQuantity(
  item: ShopItem,
  currentBalance: number,
): number {
  if (!item.inStock || !item.meetsRequirements || !Number.isFinite(item.price) ||
      !Number.isFinite(currentBalance) || item.price <= 0 || currentBalance < item.price ||
      (item.stock !== null && (!Number.isInteger(item.stock) || item.stock < 0))) return 0;

  const affordableQuantity = Math.floor(currentBalance / item.price);
  const stockQuantity = item.stock === null ? MAX_PURCHASE_QUANTITY : item.stock;
  const typeQuantity = EQUIPMENT_TYPES.has(item.type.toUpperCase())
    ? 1
    : MAX_PURCHASE_QUANTITY;

  return Math.max(
    0,
    Math.min(
      affordableQuantity,
      stockQuantity,
      typeQuantity,
      MAX_PURCHASE_QUANTITY,
    ),
  );
}

export async function executeSequentialPurchase(
  quantity: number,
  purchaseOne: () => Promise<string>,
): Promise<SequentialPurchaseResult> {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_PURCHASE_QUANTITY) {
    return { purchased: 0, lastMessage: null, error: "Invalid purchase quantity" };
  }
  let purchased = 0;
  let lastMessage: string | null = null;

  for (let unit = 0; unit < quantity; unit += 1) {
    try {
      lastMessage = await purchaseOne();
      purchased += 1;
    } catch (error) {
      return {
        purchased,
        lastMessage,
        error: error instanceof Error ? error.message : "Purchase failed",
      };
    }
  }

  return { purchased, lastMessage, error: null };
}
