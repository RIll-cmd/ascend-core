"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Loader2,
  PackageOpen,
  RefreshCcw,
} from "lucide-react";
import {
  ShopProvisionsIcon,
  ShopArmsArmorIcon,
  ShopCuriosRelicsIcon,
  ShopBlackMarketIcon,
} from "@/features/shop/components/ShopCategoryIcons";
import { CurrencyIcon, type CurrencyType } from "@/components/CurrencyDisplay";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { ShopHeader } from "@/features/shop/components/ShopHeader";
import { CielShopCoaching } from "@/features/shop/components/CielShopCoaching";
import { ShopItemCard } from "@/features/shop/components/ShopItemCard";
import { CURRENCY_LORE } from "@/features/lore/loreData";
import { useShopStore } from "@/features/shop/store/useShopStore";
import {
  getShopCategory,
  type ShopCategory,
} from "@/features/shop/utils/shopPresentation";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useDailyBonusStore } from "@/store/useDailyBonusStore";
import { playUIMenuSFX } from "@/utils/audio";
import { PixelShopTavernBackground } from "@/components/ui/pixel";
import styles from "@/features/shop/shop.module.css";

interface ShopTab {
  id: ShopCategory;
  title: string;
  subtitle: string;
  shelfCopy: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  special?: boolean;
}

const SHOP_TABS: ShopTab[] = [
  {
    id: "provisions",
    title: "Provisions & Tonics",
    subtitle: "Potions, food, and field aids",
    shelfCopy: "Fresh brews, travel rations, and practical remedies for the road ahead.",
    icon: ShopProvisionsIcon,
  },
  {
    id: "arms",
    title: "Arms & Armor",
    subtitle: "Weapons, shields, and apparel",
    shelfCopy: "Battle-tested steel and fitted protection from the Royal Smithy's trusted makers.",
    icon: ShopArmsArmorIcon,
  },
  {
    id: "curios",
    title: "Curios & Relics",
    subtitle: "Books, stones, eggs, and oddities",
    shelfCopy: "Appraised wonders whose histories are often stranger than their powers.",
    icon: ShopCuriosRelicsIcon,
  },
  {
    id: "black-market",
    title: "Black Market",
    subtitle: "Dungeon-token special stock",
    shelfCopy: "Restricted wares exchanged only for marks earned beyond the dungeon gates.",
    icon: ShopBlackMarketIcon,
    special: true,
  },
];

const REFRESH_GOLD_COST = 100;

interface WalletBadgeProps {
  label: string;
  value: number;
  type: CurrencyType;
  lore: (typeof CURRENCY_LORE)[keyof typeof CURRENCY_LORE];
}

function WalletBadge({ label, value, type, lore }: WalletBadgeProps) {
  return (
    <SystemTooltip
      title={lore.name}
      category={lore.category}
      rarity={lore.rarity}
      description={lore.description}
      lore={lore.lore}
      mechanics={lore.mechanics}
      stats={[{ label: "Purse Balance", value: value.toLocaleString() }]}
      tags={lore.tags}
      delayMs={700}
    >
      <div className={styles.currencyBadge} tabIndex={0}>
        <span className={styles.currencyIconMount} aria-hidden="true">
          <CurrencyIcon type={type} size="lg" />
        </span>
        <span>
          <span className={styles.currencyLabel}>{label}</span>
          <span className={styles.currencyValue}>{value.toLocaleString()}</span>
        </span>
      </div>
    </SystemTooltip>
  );
}

export default function ShopPage() {
  const {
    items,
    isLoading,
    isRefreshing,
    error,
    fetchShopItems,
    refreshShopItems,
  } = useShopStore();
  const { character, loadCharacter } = useCharacterStore();
  const {
    shopRefreshCharges,
    maxShopRefreshCharges,
    checkAndResetDaily,
  } = useDailyBonusStore();
  const [activeTab, setActiveTab] = useState<ShopCategory>("provisions");
  const characterId = character?.id;

  useEffect(() => {
    checkAndResetDaily();
    if (!characterId) {
      void loadCharacter();
      return;
    }
    void fetchShopItems(characterId);
  }, [characterId, fetchShopItems, loadCharacter, checkAndResetDaily]);

  if (!character) {
    return (
      <>
        <PixelShopTavernBackground />
        <div className={styles.emporium}>
          <div className={styles.statePanel} role="status" aria-live="polite">
            <Loader2 className={styles.spinner} aria-hidden="true" />
            <h3>Unbolting the shutters…</h3>
            <p>The merchant is preparing the counter and counting the morning till.</p>
          </div>
        </div>
      </>
    );
  }

  const categoryCounts = items.reduce<Record<ShopCategory, number>>(
    (counts, item) => {
      counts[getShopCategory(item)] += 1;
      return counts;
    },
    { provisions: 0, arms: 0, curios: 0, "black-market": 0 },
  );
  const filteredItems = items.filter(
    (item) => getShopCategory(item) === activeTab,
  );
  const activeShelf =
    SHOP_TABS.find((tab) => tab.id === activeTab) ?? SHOP_TABS[0];
  const hasFreeRefreshes = shopRefreshCharges > 0;
  const announcement = isRefreshing
    ? "Mind the counter—new crates are coming in from the wagon."
    : hasFreeRefreshes
      ? "Today's first stock rotations are on the house. Inspect a ware before you buy."
      : `Complimentary rotations are spent. A fresh manifest costs ${REFRESH_GOLD_COST} gold.`;

  const handleTabChange = (category: ShopCategory) => {
    setActiveTab(category);
    playUIMenuSFX("confirm");
  };

  const handleRefresh = () => {
    void refreshShopItems(
      character.id,
      hasFreeRefreshes,
      REFRESH_GOLD_COST,
    );
  };

  return (
    <>
      {/* === 16-BIT LIVING APOTHECARY & TAVERN BACKGROUND === */}
      <PixelShopTavernBackground />

      <section className={styles.emporium} aria-label="Adventurers' Emporium">
      <ShopHeader
        character={character}
        announcement={announcement}
        shopRefreshCharges={shopRefreshCharges}
        maxShopRefreshCharges={maxShopRefreshCharges}
      />

      <CielShopCoaching />

      <section className={styles.marketBoard} aria-labelledby="wares-heading">
        <nav className={styles.categoryNav} aria-label="Shop departments">
          {SHOP_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                className={`${styles.tabSign} ${
                  isActive ? styles.tabSignActive : ""
                } ${tab.special ? styles.tabSignSpecial : ""}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <span className={styles.tabIcon} aria-hidden="true">
                  <Icon size={17} strokeWidth={2.4} />
                </span>
                <span className={styles.tabCopy}>
                  <span className={styles.tabTitle}>{tab.title}</span>
                  <span className={styles.tabSubtitle}>{tab.subtitle}</span>
                </span>
                <span className={styles.tabCount}>{categoryCounts[tab.id]}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.shelfHeader}>
          <div>
            <h2 id="wares-heading">{activeShelf.title}</h2>
            <p>{activeShelf.shelfCopy}</p>
          </div>
          <button
            type="button"
            className={styles.woodButton}
            onClick={handleRefresh}
            disabled={
              isRefreshing ||
              isLoading ||
              (!hasFreeRefreshes && character.gold < REFRESH_GOLD_COST)
            }
          >
            <RefreshCcw
              size={16}
              className={isRefreshing ? styles.spinner : undefined}
              aria-hidden="true"
            />
            {isRefreshing
              ? "Restocking…"
              : hasFreeRefreshes
                ? `Rotate stock (${shopRefreshCharges} free)`
                : `Rotate stock (${REFRESH_GOLD_COST} gold)`}
          </button>
        </div>

        <div aria-busy={isLoading || isRefreshing}>
          {isLoading ? (
            <div className={styles.statePanel} role="status" aria-live="polite">
              <Loader2 className={styles.spinner} aria-hidden="true" />
              <h3>Opening the morning crates…</h3>
              <p>The manifest is being checked against the merchant&apos;s ledger.</p>
            </div>
          ) : error ? (
            <div className={styles.statePanel} role="alert">
              <PackageOpen size={34} aria-hidden="true" />
              <h3>The supply wagon is delayed</h3>
              <p>{error} Try the bell again to request a fresh manifest.</p>
              <button
                type="button"
                className={styles.woodButton}
                onClick={() => void fetchShopItems(character.id)}
              >
                Ring the merchant bell
              </button>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className={styles.shelfGrid}>
              {filteredItems.map((item) => (
                <ShopItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className={styles.statePanel}>
              <PackageOpen size={38} aria-hidden="true" />
              <h3>This shelf is bare—for now</h3>
              <p>
                Rotate the stock or inspect another hanging sign while the next caravan
                makes its way here.
              </p>
              <button
                type="button"
                className={styles.woodButton}
                onClick={handleRefresh}
                disabled={
                  isRefreshing ||
                  (!hasFreeRefreshes && character.gold < REFRESH_GOLD_COST)
                }
              >
                <RefreshCcw size={16} aria-hidden="true" />
                Check the next manifest
              </button>
            </div>
          )}
        </div>
      </section>
    </section>
  </>
);
}
