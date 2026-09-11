import React, { type CSSProperties, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { PlayerItem } from '../types/inventory';
import Image from 'next/image';
import { X, Lock, Star, Sword, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { playUISound, playBuffSFX, playUIMenuSFX } from '@/utils/audio';
import { getItemIconPath } from '@/utils/itemIcons';
import { getItemUsageDetails } from '@/utils/itemUsageUtils';
import smithy from '@/features/armory/styles/RoyalSmithy.module.css';
import { royalRarityColors } from '@/features/armory/styles/royalRarityColors';
import { CoolMode } from '@/components/ui/cool-mode';
import { NumberTicker } from '@/components/ui/number-ticker';

interface ItemDetailModalProps {
  item: PlayerItem | null;
  onClose: () => void;
  onEquip: (id: string) => void;
  onUse?: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onEquip,
  onUse,
  onToggleLock,
  onToggleFavorite
}) => {
  const [isConsuming, setIsConsuming] = React.useState(false);
  const returnFocusRef = React.useRef<HTMLElement | null>(null);
  const itemId = item?.id;

  useEffect(() => {
    if (itemId) {
      playUISound("/sounds/System UI & Navigation/SYSTEM--OPEN.mp3");
    }
  }, [itemId]);

  if (!item) return null;

  const { itemDefinition } = item;
  const rarityTone = royalRarityColors[itemDefinition.rarity] || royalRarityColors.COMMON;
  const usageDetails = getItemUsageDetails(itemDefinition);

  const canEquip = usageDetails.isEquipment;
  const isConsumable = itemDefinition.type === "CONSUMABLE" || usageDetails.categoryLabel === "Consumable";

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={smithy.modalBackdrop} />
        <DialogPrimitive.Content
          className={smithy.modalRoot}
          onOpenAutoFocus={() => {
            returnFocusRef.current = document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current?.focus();
          }}
        >
          <section
            className={smithy.modal}
            style={{
              '--rarity-color': rarityTone.border,
              '--rarity-text': rarityTone.text,
            } as CSSProperties}
          >
            <DialogPrimitive.Close asChild>
              <button type="button" className={smithy.modalClose} aria-label="Close item details">
                <X className="h-5 w-5" />
              </button>
            </DialogPrimitive.Close>

        <header className={smithy.modalHeader}>
          <div className={smithy.modalIconFrame}>
            <Image
              src={getItemIconPath(itemDefinition.name)}
              alt=""
              fill
              sizes="88px"
              className="object-contain p-2"
            />
          </div>
          <div>
            <DialogPrimitive.Title asChild>
              <h2 className={smithy.modalTitle}>{itemDefinition.name}</h2>
            </DialogPrimitive.Title>
            <div className={smithy.badgeRow}>
              <span className={smithy.smallBadge}>{itemDefinition.rarity}</span>
              <span className={smithy.smallBadge}>{itemDefinition.type.replace('_', ' ')}</span>
              {usageDetails.isEquipment ? (
                <span className={smithy.smallBadge}><ShieldCheck className="inline h-3 w-3" /> Equippable</span>
              ) : null}
              {isConsumable ? (
                <span className={smithy.smallBadge}><Sparkles className="inline h-3 w-3" /> Usable</span>
              ) : null}
            </div>
            <div className={smithy.forgeFee}>
              <span>Sell value: <NumberTicker value={itemDefinition.sellValue || 0} />g</span>
              <strong>Qty <NumberTicker value={item.quantity} /></strong>
            </div>
          </div>
        </header>

        <div className={smithy.modalScroll}>
          <DialogPrimitive.Description asChild>
            <p className={smithy.loreBlock}>
              &quot;{itemDefinition.description || "A mysterious item recovered from beyond the gate."}&quot;
            </p>
          </DialogPrimitive.Description>

          <div className={smithy.usageBlock}>
            <span className={smithy.brassBadge}>
              <BookOpen className="h-3.5 w-3.5" /> Field use
            </span>
            <p className="mt-2">{usageDetails.usageGuide}</p>
            <p className="mt-1 font-mono text-[11px]">Slot: <strong>{usageDetails.slotLabel}</strong></p>
          </div>

          {usageDetails.hasBonuses ? (
            <div>
              <h3 className={smithy.panelHeading}>Forged attributes</h3>
              <div className={smithy.statsGrid}>
                {usageDetails.statBonuses.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className={smithy.statChip}>
                      <span className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-amber-500" />
                        {stat.label}
                      </span>
                      <strong>+<NumberTicker value={stat.value} />{stat.isPercentage ? '%' : ''}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {itemDefinition.passive ? (
            <div className={smithy.usageBlock}>
              <strong className="text-amber-300">Passive effect</strong>
              <p className="mt-1">{itemDefinition.passive}</p>
            </div>
          ) : null}
        </div>

        <div className={smithy.modalActions}>
          {canEquip ? (
            <CoolMode options={{ particle: item.isEquipped ? "🛡️" : "⚔️" }}>
              <button
                type="button"
                onClick={() => {
                  if (item.isEquipped) {
                    playUIMenuSFX("confirm");
                  } else {
                    playBuffSFX("buff");
                    playUIMenuSFX("equip");
                  }
                  onEquip(item.id);
                }}
                className={item.isEquipped ? smithy.dangerButton : smithy.primaryButton}
              >
                <Sword className="h-4 w-4" />
                {item.isEquipped ? "Unequip item" : "Equip item"}
              </button>
            </CoolMode>
          ) : null}

          {isConsumable ? (
            <CoolMode options={{ particle: "✨" }}>
              <button
                type="button"
                disabled={isConsuming}
                onClick={async () => {
                  if (!onUse) return;
                  setIsConsuming(true);
                  playBuffSFX("buff");
                  playUISound("/sounds/Combat & Actions/SKILL--ACTIVATE.mp3");
                  try {
                    await onUse(item.id);
                    onClose();
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setIsConsuming(false);
                  }
                }}
                className={smithy.primaryButton}
              >
                <Sparkles className="h-4 w-4" />
                {isConsuming ? "Using item…" : "Use item now"}
              </button>
            </CoolMode>
          ) : null}

          <div className={smithy.splitActions}>
            <CoolMode options={{ particle: "⭐" }}>
              <button type="button" onClick={() => onToggleFavorite(item.id)} className={smithy.secondaryButton}>
                <Star className={`h-3.5 w-3.5 ${item.isFavorite ? 'fill-current text-amber-300' : ''}`} />
                {item.isFavorite ? 'Favorited' : 'Favorite'}
              </button>
            </CoolMode>
            <CoolMode options={{ particle: "🔒" }}>
              <button type="button" onClick={() => onToggleLock(item.id)} className={smithy.secondaryButton}>
                <Lock className="h-3.5 w-3.5" />
                {item.isLocked ? "Unlock" : "Lock"}
              </button>
            </CoolMode>
          </div>
        </div>
          </section>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
