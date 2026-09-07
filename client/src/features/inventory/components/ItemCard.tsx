import React, { type CSSProperties } from 'react';
import { PlayerItem } from '../types/inventory';
import Image from 'next/image';
import { Lock, Star, Shield, Sword, Heart } from 'lucide-react';
import { getItemIconPath } from '@/utils/itemIcons';
import { SystemTooltip, SystemTooltipStat } from '@/components/ui/SystemTooltip';
import smithy from '@/features/armory/styles/RoyalSmithy.module.css';
import { royalRarityColors } from '@/features/armory/styles/royalRarityColors';

interface ItemCardProps {
  item: PlayerItem;
  onClick: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const { itemDefinition, isEquipped, isLocked, isFavorite, quantity } = item;
  
  const rarityTone = royalRarityColors[itemDefinition.rarity] || royalRarityColors.COMMON;

  // Build Tooltip Stats
  const tooltipStats: SystemTooltipStat[] = [];
  if (itemDefinition.attack && itemDefinition.attack > 0) {
    tooltipStats.push({ label: "Attack Power", value: `+${itemDefinition.attack} ATK`, color: "text-rose-400", icon: Sword });
  }
  if (itemDefinition.defense && itemDefinition.defense > 0) {
    tooltipStats.push({ label: "Defense Armor", value: `+${itemDefinition.defense} DEF`, color: "text-blue-400", icon: Shield });
  }
  if (itemDefinition.strength && itemDefinition.strength > 0) {
    tooltipStats.push({ label: "Strength Boost", value: `+${itemDefinition.strength}% (IRL Scaling)`, color: "text-rose-300" });
  }
  if (itemDefinition.knowledge && itemDefinition.knowledge > 0) {
    tooltipStats.push({ label: "Knowledge Boost", value: `+${itemDefinition.knowledge}% (IRL Scaling)`, color: "text-[#f59e0b]" });
  }
  if (itemDefinition.discipline && itemDefinition.discipline > 0) {
    tooltipStats.push({ label: "Discipline Boost", value: `+${itemDefinition.discipline}% (IRL Scaling)`, color: "text-amber-300" });
  }
  if (itemDefinition.focus && itemDefinition.focus > 0) {
    tooltipStats.push({ label: "Focus Boost", value: `+${itemDefinition.focus}% (IRL Scaling)`, color: "text-[#d97706]" });
  }
  if (itemDefinition.endurance && itemDefinition.endurance > 0) {
    tooltipStats.push({ label: "Endurance Boost", value: `+${itemDefinition.endurance}% (IRL Scaling)`, color: "text-emerald-300" });
  }
  if (itemDefinition.recovery && itemDefinition.recovery > 0) {
    tooltipStats.push({ label: "Recovery Boost", value: `+${itemDefinition.recovery}% (IRL Scaling)`, color: "text-pink-300", icon: Heart });
  }

  return (
    <SystemTooltip
      title={itemDefinition.name}
      subtitle={`${itemDefinition.type} Tier • ${itemDefinition.rarity}`}
      category={itemDefinition.type}
      rarity={itemDefinition.rarity}
      description={itemDefinition.description || "A crafted armament forged from gate materials."}
      lore={itemDefinition.lore || `Forged in the ascension armory to amplify the hunter's kinetic prowess.`}
      mechanics="Attribute bonuses scale as percentage multipliers (% Multipliers) of your real-world base stats. Flat values provide raw attack and defense."
      stats={tooltipStats}
      tags={[itemDefinition.type, itemDefinition.rarity, "Gear"]}
      delayMs={1000}
      className="w-full h-full"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`Inspect ${itemDefinition.name}`}
        className={smithy.itemCard}
        style={{
          '--rarity-color': rarityTone.border,
          '--rarity-text': rarityTone.text,
        } as CSSProperties}
      >
        <div className={smithy.itemIndicators}>
          {isFavorite ? <Star className="h-3.5 w-3.5 fill-current" aria-label="Favorite" /> : null}
          {isLocked ? <Lock className="h-3.5 w-3.5" aria-label="Locked" /> : null}
        </div>

        {isEquipped ? <span className={smithy.equippedBadge}>Equipped</span> : null}

        <span className={smithy.itemIcon}>
          <Image
            src={getItemIconPath(itemDefinition.name)}
            alt=""
            fill
            sizes="72px"
            className="object-contain"
          />
        </span>

        <span>
          <span className={smithy.itemName} title={itemDefinition.name}>
            {itemDefinition.name}
          </span>
          <span className={smithy.itemMeta}>
            <span>{itemDefinition.rarity}</span>
            <span>{quantity > 1 ? `×${quantity}` : itemDefinition.type.replace('_', ' ')}</span>
          </span>
        </span>
      </button>
    </SystemTooltip>
  );
};
