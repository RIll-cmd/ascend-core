"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { BookOpen, Loader2, ScrollText, ShieldCheck, Sparkles } from "lucide-react";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { rarityColors } from "../utils/shopPresentation";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useInventoryStore } from "@/features/inventory/store/useInventoryStore";
import { getItemIconPath } from "@/utils/itemIcons";
import { getItemUsageDetails } from "@/utils/itemUsageUtils";
import { NumberTicker } from "@/components/ui/number-ticker";
import { playUISound } from "@/utils/audio";
import type { ShopItem } from "../types/shop";
import { getMaxPurchasableQuantity } from "../utils/shopPresentation";
import styles from "../shop.module.css";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void | Promise<void>;
  item: ShopItem | null;
  isPurchasing: boolean;
}

export function PurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  isPurchasing,
}: PurchaseModalProps) {
  const character = useCharacterStore((state) => state.character);
  const inventory = useInventoryStore((state) => state.items);
  const inventoryLoading = useInventoryStore((state) => state.isLoading);
  const inventoryError = useInventoryStore((state) => state.error);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    playUISound("/sounds/System UI & Navigation/SYSTEM--OPEN.mp3");
  }, [isOpen, item?.id]);

  useEffect(() => {
    if (isOpen && character?.id) {
      void useInventoryStore.getState().fetchInventory(character.id);
    }
  }, [isOpen, character?.id]);

  if (!item || !character) return null;

  const currentBalance =
    item.currencyType === "GOLD"
      ? character.gold
      : item.currencyType === "GEMS"
        ? character.gems || 0
        : character.towerTokens || 0;
  const maxQuantity = getMaxPurchasableQuantity(item, currentBalance);
  const safeQuantity = Math.min(quantity, Math.max(maxQuantity, 1));
  const totalCost = item.price * safeQuantity;
  const remainingBalance = currentBalance - totalCost;
  const canAfford = maxQuantity > 0 && remainingBalance >= 0;
  const rarityColor =
    rarityColors[item.rarity as keyof typeof rarityColors] ?? rarityColors.COMMON;
  const rarityStyle = { "--rarity": rarityColor } as CSSProperties;
  const usageDetails = getItemUsageDetails(item);
  const equipped = inventory.find((owned) => owned.isEquipped && owned.itemDefinition.type === item.type);
  const comparisonStats = ["attack", "defense", "strength", "knowledge", "discipline", "focus", "endurance", "recovery"] as const;
  const itemIcon =
    item.icon && item.icon.includes("/icons/Icon")
      ? item.icon
      : getItemIconPath(item.name, item.type);

  const setSafeQuantity = (nextQuantity: number) => {
    setQuantity(Math.min(Math.max(1, nextQuantity), Math.max(1, maxQuantity)));
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirm(safeQuantity);
    setQuantity(1);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPurchasing) handleClose();
      }}
    >
      <DialogContent className={styles.ledgerDialog} style={rarityStyle}>
        <DialogHeader className={styles.ledgerHeader}>
          <DialogTitle className={styles.ledgerTitle}>
            Bramblewick&apos;s Bill of Sale
          </DialogTitle>
          <DialogDescription className={styles.ledgerDescription}>
            Review the appraisal, choose your quantity, and seal the transaction.
          </DialogDescription>
        </DialogHeader>

        <div className={styles.ledgerBody}>
          <div className={styles.ledgerItemColumn}>
            <div className={styles.ledgerIconFrame}>
              <Image
                src={itemIcon}
                alt={item.name}
                width={112}
                height={112}
                unoptimized
              />
            </div>
            <h2 className={styles.ledgerItemName}>{item.name}</h2>
            <p className={styles.ledgerMeta}>
              {item.rarity} · {item.type.replaceAll("_", " ")}
            </p>
          </div>

          <div className={styles.ledgerDetails}>
            {usageDetails.isEquipment && (
              <section className={styles.ledgerSection}>
                <h3>Equipped comparison</h3>
                <p>{inventoryLoading ? "Checking your equipment…" : inventoryError ? "Equipment comparison unavailable. Reopen the ledger to retry." : equipped ? `Compared with ${equipped.itemDefinition.name}` : "Nothing equipped in this slot."}</p>
                {!inventoryLoading && !inventoryError && equipped && (
                  <div className={styles.statLedger}>
                    {comparisonStats.filter((stat) => item[stat] || equipped.itemDefinition[stat]).map((stat) => {
                      const delta = (item[stat] ?? 0) - equipped.itemDefinition[stat];
                      return <div key={stat} className={styles.statEntry}><span>{stat}</span><strong>{delta > 0 ? "+" : ""}{delta}</strong></div>;
                    })}
                  </div>
                )}
              </section>
            )}
            <section className={styles.ledgerSection}>
              <h3>
                <ScrollText size={14} aria-hidden="true" /> Appraiser&apos;s note
              </h3>
              <p>
                &ldquo;{item.description || "A road-worn ware with a history yet untold."}&rdquo;
              </p>
            </section>

            {usageDetails.hasBonuses ? (
              <section className={styles.ledgerSection}>
                <h3>
                  <Sparkles size={14} aria-hidden="true" /> Recorded attributes
                </h3>
                <div className={styles.statLedger}>
                  {usageDetails.statBonuses.map((stat) => (
                    <div key={stat.label} className={styles.statEntry}>
                      <span>{stat.shortLabel}</span>
                      <strong>+{stat.value}</strong>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className={styles.ledgerSection}>
              <h3>
                {usageDetails.isEquipment ? (
                  <ShieldCheck size={14} aria-hidden="true" />
                ) : (
                  <BookOpen size={14} aria-hidden="true" />
                )}
                Use &amp; equip notes
              </h3>
              <p>{usageDetails.usageGuide}</p>
              <p>
                <strong>Destination:</strong> {usageDetails.slotLabel}
              </p>
            </section>
          </div>
        </div>

        <div className={styles.balanceLedger} aria-label="Purchase balance calculation">
          <div className={styles.balanceCell}>
            <span>Purse</span>
            <span className={styles.balanceValue}>
              <NumberTicker value={currentBalance} />
              <CurrencyIcon type={item.currencyType} size="xs" />
            </span>
          </div>
          <div className={styles.balanceCell}>
            <span>Total cost</span>
            <span className={styles.balanceValue}>
              −<NumberTicker value={totalCost} />
              <CurrencyIcon type={item.currencyType} size="xs" />
            </span>
          </div>
          <div className={styles.balanceCell}>
            <span>After sale</span>
            <span
              className={`${styles.balanceValue} ${
                canAfford ? "" : styles.balanceDanger
              }`}
            >
              <NumberTicker value={Math.max(0, remainingBalance)} />
              <CurrencyIcon type={item.currencyType} size="xs" />
            </span>
          </div>
        </div>

        <div className={styles.quantityRow}>
          {!canAfford && <p role="status">{!item.inStock ? "This ware is out of stock." : !item.meetsRequirements ? `Requires level ${item.requiredLevel ?? 1} and power ${item.requiredPower ?? 0}.` : "Your purse cannot cover this purchase."}</p>}
          <span className={styles.quantityLabel}>
            Quantity · {item.stock === null ? "open stock" : `${item.stock} on shelf`}
          </span>
          <div className={styles.quantityControls} aria-label="Purchase quantity">
            <button
              type="button"
              className={styles.quantityButton}
              onClick={() => setSafeQuantity(safeQuantity - 1)}
              disabled={safeQuantity <= 1 || isPurchasing}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <output className={styles.quantityValue} aria-live="polite">
              <NumberTicker value={safeQuantity} />
            </output>
            <button
              type="button"
              className={styles.quantityButton}
              onClick={() => setSafeQuantity(safeQuantity + 1)}
              disabled={safeQuantity >= maxQuantity || isPurchasing}
              aria-label="Increase quantity"
            >
              +
            </button>
            <button
              type="button"
              className={styles.quantityButton}
              onClick={() => setSafeQuantity(maxQuantity)}
              disabled={maxQuantity <= 1 || safeQuantity === maxQuantity || isPurchasing}
              aria-label={`Set maximum quantity of ${maxQuantity}`}
            >
              MAX
            </button>
          </div>
        </div>

        <DialogFooter className={styles.ledgerFooter}>
          <button
            type="button"
            className={styles.ledgerCancel}
            onClick={handleClose}
            disabled={isPurchasing}
          >
            Return to shelf
          </button>
          <button
            type="button"
            className={styles.ledgerPurchase}
            onClick={() => void handleConfirm()}
            disabled={!canAfford || isPurchasing}
          >
            {isPurchasing ? (
              <>
                <Loader2 size={15} className={styles.spinner} aria-hidden="true" />
                Counting coin…
              </>
            ) : (
              `Purchase ${safeQuantity > 1 ? `${safeQuantity} items` : "item"}`
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
