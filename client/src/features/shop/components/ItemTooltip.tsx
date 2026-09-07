"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { rarityColors } from "../utils/shopPresentation";
import { getItemIconPath } from "@/utils/itemIcons";
import { getItemUsageDetails } from "@/utils/itemUsageUtils";
import type { ShopItem } from "../types/shop";
import styles from "../shop.module.css";

interface ItemTooltipProps {
  item: ShopItem;
  children: ReactNode;
}

export function ItemTooltip({ item, children }: ItemTooltipProps) {
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDismissed(true);
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, []);
  if (!item.meetsRequirements) return <>{children}</>;

  const rarityColor =
    rarityColors[item.rarity as keyof typeof rarityColors] ?? rarityColors.COMMON;
  const rarityStyle = { "--rarity": rarityColor } as CSSProperties;
  const usageDetails = getItemUsageDetails(item);
  const itemIcon =
    item.icon && item.icon.includes("/icons/Icon")
      ? item.icon
      : getItemIconPath(item.name, item.type);

  return (
    <div className={styles.tooltipWrap} onMouseLeave={() => setDismissed(false)} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setDismissed(false);
    }}>
      {children}
      <aside className={styles.tooltip} style={{ ...rarityStyle, ...(dismissed ? { display: "none" } : {}) }} role="tooltip">
        <div className={styles.tooltipHeader}>
          <div className={styles.tooltipIcon}>
            <Image src={itemIcon} alt="" width={36} height={36} unoptimized />
          </div>
          <div>
            <h4>{item.name}</h4>
            <div className={styles.tooltipMeta}>
              {item.rarity} · {item.type.replaceAll("_", " ")}
            </div>
          </div>
        </div>

        <p className={styles.tooltipLore}>
          &ldquo;{item.description || "A road-worn ware with a history yet untold."}&rdquo;
        </p>

        {usageDetails.hasBonuses ? (
          <div className={styles.tooltipStats}>
            {usageDetails.statBonuses.map((stat) => (
              <div className={styles.tooltipStat} key={stat.label}>
                <span>{stat.shortLabel}</span>
                <strong>+{stat.value}</strong>
              </div>
            ))}
          </div>
        ) : null}

        <p className={styles.tooltipGuide}>
          <strong>{usageDetails.slotLabel}:</strong> {usageDetails.usageGuide}
        </p>

        <div className={styles.tooltipFooter}>
          <span>Stock: {item.stock === null ? "Plenty" : item.stock}</span>
          <span>
            {item.price.toLocaleString()} 
            <CurrencyIcon type={item.currencyType} size="xs" />
          </span>
        </div>
      </aside>
    </div>
  );
}
