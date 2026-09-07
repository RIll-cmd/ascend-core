"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { LockKeyhole } from "lucide-react";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { rarityColors } from "../utils/shopPresentation";
import { getItemIconPath } from "@/utils/itemIcons";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useShopStore } from "../store/useShopStore";
import type { ShopItem } from "../types/shop";
import { ItemTooltip } from "./ItemTooltip";
import { PurchaseModal } from "./PurchaseModal";
import styles from "../shop.module.css";

interface ShopItemCardProps {
  item: ShopItem;
}

export function ShopItemCard({ item }: ShopItemCardProps) {
  const buyItem = useShopStore((state) => state.buyItem);
  const character = useCharacterStore((state) => state.character);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rarityColor =
    rarityColors[item.rarity as keyof typeof rarityColors] ?? rarityColors.COMMON;
  const itemIcon =
    item.icon && item.icon.includes("/icons/Icon")
      ? item.icon
      : getItemIconPath(item.name, item.type);
  const requirementCopy =
    item.requiredLevel && character && character.level < item.requiredLevel
      ? `Level ${item.requiredLevel} required`
      : item.requiredPower && character && character.power < item.requiredPower
        ? `${item.requiredPower.toLocaleString()} power required`
        : "Requirements not met";
  const actionCopy = !item.meetsRequirements
    ? "Sealed"
    : !item.inStock
      ? "Sold out"
      : !item.canAfford
        ? "Funds lacking"
        : "Inspect ware";
  const isAvailable = Boolean(item.meetsRequirements && item.inStock && item.canAfford);
  const rarityStyle = { "--rarity": rarityColor } as CSSProperties;

  const handleBuy = async (quantity: number) => {
    if (!character) return;
    setIsPurchasing(true);
    const success = await buyItem(character.id, item.id, quantity);
    setIsPurchasing(false);
    if (success) setIsModalOpen(false);
  };

  return (
    <ItemTooltip item={item}>
      <article
        className={`${styles.shelfSlot} ${
          !item.meetsRequirements ? styles.shelfSlotLocked : ""
        }`}
        style={rarityStyle}
      >
        {!item.inStock ? (
          <div className={styles.waxStamp} aria-label="Out of stock">
            Out of stock
          </div>
        ) : null}

        {!item.meetsRequirements ? (
          <div className={styles.lockSeal} title={requirementCopy}>
            <LockKeyhole size={18} aria-hidden="true" />
            <span className="sr-only">{requirementCopy}</span>
          </div>
        ) : null}

        <div className={styles.slotInterior}>
          <div className={styles.rarityRail}>
            <span>{item.rarity}</span>
            <span>{item.stock === null ? "Open crate" : `Lot ${item.stock}`}</span>
          </div>

          <div className={styles.itemDisplay}>
            <Image
              src={itemIcon}
              alt={item.name}
              width={76}
              height={76}
              unoptimized
              onError={(event) => {
                event.currentTarget.src = getItemIconPath(item.name, item.type);
              }}
            />
          </div>

          <h3 className={styles.itemName}>{item.name}</h3>
          <p className={styles.itemType}>{item.type.replaceAll("_", " ")}</p>
          <p className={styles.itemLore}>
            &ldquo;{item.description || "A road-worn ware with a history yet untold."}&rdquo;
          </p>

          <div className={styles.stockRow}>
            <span>{!item.meetsRequirements ? requirementCopy : "Stock on shelf"}</span>
            <span className={styles.stockValue}>
              {item.stock === null ? "Plenty" : item.stock}
            </span>
          </div>

          <div className={styles.priceTag}>
            <CurrencyIcon type={item.currencyType} size="sm" />
            <span>{item.price.toLocaleString()}</span>
          </div>

          <button
            type="button"
            className={`${styles.purchaseButton} ${
              !isAvailable ? styles.purchaseButtonUnavailable : ""
            }`}
            disabled={isPurchasing}
            onClick={() => setIsModalOpen(true)}
            aria-label={`${actionCopy}: ${item.name} for ${item.price.toLocaleString()} ${item.currencyType.toLowerCase().replaceAll("_", " ")}`}
          >
            {actionCopy}
          </button>
        </div>

        <PurchaseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleBuy}
          item={item}
          isPurchasing={isPurchasing}
        />
      </article>
    </ItemTooltip>
  );
}
