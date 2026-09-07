"use client";

import React, { type CSSProperties, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import { Check, Hammer, ShieldCheck, Sparkles, X } from "lucide-react";
import smithy from "@/features/armory/styles/RoyalSmithy.module.css";
import { royalRarityColors } from "@/features/armory/styles/royalRarityColors";
import { playBuffSFX, playUISound } from "@/utils/audio";
import { getItemIconPath } from "@/utils/itemIcons";
import { getItemUsageDetails } from "@/utils/itemUsageUtils";
import type { CraftResponse } from "../types/crafting";

interface CraftSuccessModalProps {
  result: CraftResponse | null;
  onClose: () => void;
}

export function CraftSuccessModal({ result, onClose }: CraftSuccessModalProps) {
  useEffect(() => {
    if (result) {
      playBuffSFX("buff");
      playUISound("/sounds/Combat & Actions/SKILL--ACTIVATE.mp3");
    }
  }, [result]);

  if (!result) return null;

  const { craftedItem } = result;
  const rarityTone =
    royalRarityColors[craftedItem.rarity] || royalRarityColors.COMMON;
  const usageDetails = getItemUsageDetails(craftedItem);

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={smithy.modalBackdrop} />
        <DialogPrimitive.Content
          className={smithy.modalRoot}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
          }}
        >
          <section
            className={`${smithy.modal} ${smithy.successModal}`}
            style={{
              "--rarity-color": rarityTone.border,
              "--rarity-text": rarityTone.text,
            } as CSSProperties}
          >
            <DialogPrimitive.Close asChild>
              <button type="button" className={smithy.modalClose} aria-label="Close forge result">
                <X className="h-5 w-5" />
              </button>
            </DialogPrimitive.Close>

        <div className={smithy.successSeal} aria-hidden="true">
          <Hammer className="h-5 w-5" />
        </div>
        <span className={smithy.successLabel}>Royal masterwork completed</span>

        <div
          className={smithy.successItemFrame}
          style={{
            "--rarity-color": rarityTone.border,
            "--rarity-text": rarityTone.text,
          } as CSSProperties}
        >
          <Image
            src={getItemIconPath(craftedItem.name, craftedItem.type)}
            alt={craftedItem.name}
            width={102}
            height={102}
            className={smithy.outputIcon}
          />
        </div>

        <DialogPrimitive.Title asChild>
          <h2 className={smithy.modalTitle}>{craftedItem.name}</h2>
        </DialogPrimitive.Title>
        <div className={smithy.badgeRow}>
          <span className={smithy.smallBadge}>{craftedItem.rarity}</span>
          <span className={smithy.smallBadge}>{craftedItem.type}</span>
          {usageDetails.isEquipment ? (
            <span className={smithy.smallBadge}>
              <ShieldCheck className="inline h-3 w-3" /> Equippable
            </span>
          ) : null}
        </div>

        <DialogPrimitive.Description asChild>
          <p className={smithy.loreBlock}>
            &quot;{craftedItem.description || "A masterwork drawn bright from the royal forge."}&quot;
          </p>
        </DialogPrimitive.Description>

        {usageDetails.hasBonuses ? (
          <div className="w-full">
            <h3 className={smithy.panelHeading}>
              Tempered attributes
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </h3>
            <div className={smithy.statsGrid}>
              {usageDetails.statBonuses.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={smithy.statChip}>
                    <span className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-amber-500" />
                      {stat.shortLabel}
                    </span>
                    <strong>+{stat.value}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <button type="button" onClick={onClose} className={smithy.primaryButton}>
          <Check className="h-4 w-4" />
          Stow in the Oak Vault
        </button>
          </section>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
