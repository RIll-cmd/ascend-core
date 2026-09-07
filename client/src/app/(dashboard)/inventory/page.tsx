"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';
import { ItemCard } from '@/features/inventory/components/ItemCard';
import { ItemDetailModal } from '@/features/inventory/components/ItemDetailModal';
import { PaperDoll } from '@/features/inventory/components/PaperDoll';
import { PlayerItem } from '@/features/inventory/types/inventory';
import {
  filterInventoryItems,
  getInventoryLoad,
  type InventoryFilterTab,
} from '@/features/inventory/utils/inventoryPresentation';
import smithy from '@/features/armory/styles/RoyalSmithy.module.css';
import { useCharacterStore } from '@/store/useCharacterStore';
import { AlertTriangle, Search, Filter, Scale, PackageOpen, RefreshCcw } from 'lucide-react';
import { InventoryBadgeButton, PixelAdventurerPackIcon } from '@/features/inventory/components/InventoryBadgeButton';

export default function InventoryPage() {
  const {
    items,
    isLoading,
    error: inventoryError,
    fetchInventory,
    equipItem,
    toggleLock,
    toggleFavorite,
    useItem: consumeItem,
  } = useInventoryStore();
  const { character } = useCharacterStore();
  
  const [activeTab, setActiveTab] = useState<InventoryFilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<PlayerItem | null>(null);

  const charId = character?.id;

  useEffect(() => {
    if (charId) {
      void fetchInventory(charId);
    }
  }, [charId, fetchInventory]);

  const filteredItems = useMemo(() => {
    return filterInventoryItems(items, activeTab, searchQuery);
  }, [items, activeTab, searchQuery]);

  const inventoryLoad = useMemo(() => getInventoryLoad(items, 500), [items]);
  const equippedItems = useMemo(() => items.filter((item) => item.isEquipped), [items]);

  return (
    <div className={`${smithy.surface} ${smithy.inventorySurface}`}>
      {/* FULL-BLEED FIXED OAK VAULT BASE BACKGROUND */}
      <div
        className="fixed inset-0 -z-10 w-full h-full bg-[#0d0b09] pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-top bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('/backgrounds/royal-oak-vault.png')",
            imageRendering: "pixelated",
            opacity: 0.72,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(13, 11, 9, 0.58) 0%, rgba(13, 11, 9, 0.82) 58%, #0d0b09 100%), radial-gradient(circle at 16% 2%, rgba(234, 88, 12, 0.22), transparent 34%), radial-gradient(circle at 88% 16%, rgba(217, 119, 6, 0.12), transparent 28%)",
          }}
        />
      </div>

      <div className={smithy.content}>
        <header className={smithy.header}>
          <div className={smithy.titleGroup}>
            <InventoryBadgeButton
              size="lg"
              capacity={{
                occupied: inventoryLoad.occupiedSlots,
                total: inventoryLoad.capacity,
              }}
              onClick={() => {
                if (charId) {
                  void fetchInventory(charId);
                }
              }}
              ariaLabel="The Oak Vault Adventurer Rucksack. Click to refresh inventory."
            />
            <div>
              <h1 className={smithy.title}>The Oak Vault</h1>
              <p className={smithy.subtitle}>
                Quartermaster&apos;s armory for equipped relics, field supplies, and hard-won materials.
              </p>
            </div>
          </div>

          <section className={smithy.loadBelt} aria-label="Rucksack capacity and load">
            <div className={smithy.beltMetric}>
              <span className={smithy.beltLabel}>Capacity</span>
              <strong className={smithy.beltValue}>
                {inventoryLoad.occupiedSlots} / {inventoryLoad.capacity}
              </strong>
            </div>
            <div
              className={smithy.beltTrack}
              role="progressbar"
              aria-label="Occupied inventory slots"
              aria-valuemin={0}
              aria-valuemax={inventoryLoad.capacity}
              aria-valuenow={inventoryLoad.occupiedSlots}
            >
              <span
                className={smithy.beltFill}
                style={{ width: `${inventoryLoad.fillPercentage}%` }}
              />
              <span className={smithy.beltNotches} aria-hidden="true" />
            </div>
            <div className={smithy.beltBuckle} aria-hidden="true">
              <Scale className="h-4 w-4" />
            </div>
            <div
              className={smithy.coinPouch}
              title="Stored stack units are shown because individual item weights are not part of the inventory schema."
            >
              <PackageOpen className="h-5 w-5" aria-hidden="true" />
              <div className={smithy.beltMetric}>
                <span className={smithy.beltLabel}>Stored stacks</span>
                <strong className={smithy.beltValue}>{inventoryLoad.stackUnits} units</strong>
              </div>
            </div>
          </section>
        </header>

        <div className={smithy.inventoryLayout}>
          <section className={`${smithy.oakPanel} ${smithy.rivets} ${smithy.armoryPanel}`}>
            <h2 className={smithy.panelHeading}>
              Knight&apos;s Rack
              <span className={smithy.panelHint}>{equippedItems.length} socketed</span>
            </h2>
            <PaperDoll equippedItems={equippedItems} />
            <div className={smithy.armoryFooter}>
              <div className={smithy.armoryStat}>
                Armaments
                <strong>{inventoryLoad.equipmentCount}</strong>
              </div>
              <div className={smithy.armoryStat}>
                Active loadout
                <strong>{equippedItems.length} / 9</strong>
              </div>
            </div>
          </section>

          <section className={`${smithy.oakPanel} ${smithy.rivets} ${smithy.trunkPanel}`}>
            <div className={smithy.controls}>
              <div className={smithy.tabs} role="group" aria-label="Inventory categories">
                {(['All', 'Equipment', 'Consumables', 'Materials'] as InventoryFilterTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    aria-pressed={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${smithy.tab} ${activeTab === tab ? smithy.activeTab : ''}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <label className={smithy.searchWrap}>
                <span className="sr-only">Search the oak vault</span>
                <Search className={smithy.searchIcon} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search the vault…"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className={smithy.searchInput}
                />
              </label>
            </div>

            {!charId ? (
              <div className={smithy.statePanel}>
                <div className={smithy.stateInner}>
                  <PixelAdventurerPackIcon className="h-12 w-12" />
                  <h2 className={smithy.recipeTitle}>Awaiting the quartermaster&apos;s ledger</h2>
                  <p className={smithy.subtitle}>Select or load a character to open their Oak Vault.</p>
                </div>
              </div>
            ) : inventoryError ? (
              <div className={smithy.errorPanel} role="alert">
                <div className={smithy.errorCopy}>
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                  <div>
                    <strong>The vault ledger could not be opened.</strong>
                    <span>{inventoryError}</span>
                  </div>
                </div>
                <button type="button" className={smithy.secondaryButton} onClick={() => void fetchInventory(charId)}>
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  Retry
                </button>
              </div>
            ) : isLoading ? (
              <div className={smithy.statePanel}>
                <div className={smithy.stateInner}>
                  <span className={smithy.spinner} aria-hidden="true" />
                  <span className={smithy.brassBadge}>Unlatching the armory trunk</span>
                </div>
              </div>
            ) : filteredItems.length > 0 ? (
              <div className={smithy.itemGrid}>
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                ))}
              </div>
            ) : (
              <div className={smithy.statePanel}>
                <div className={smithy.stateInner}>
                  <Filter className="h-10 w-10" aria-hidden="true" />
                  <h2 className={smithy.recipeTitle}>
                    {items.length === 0 ? 'The trunk is empty' : 'No matching stores'}
                  </h2>
                  <p className={smithy.subtitle}>
                    {items.length === 0
                      ? 'Recovered equipment and supplies will be stowed here.'
                      : 'Try another chest compartment or clear the search inscription.'}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEquip={(id) => equipItem(id)}
        onUse={(id) => consumeItem(id)}
        onToggleFavorite={(id) => toggleFavorite(id)}
        onToggleLock={(id) => toggleLock(id)}
      />
    </div>
  );
}
