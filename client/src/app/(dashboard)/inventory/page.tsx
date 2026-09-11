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
import Link from 'next/link';
import { MagicCard } from '@/components/ui/magic-card';
import { NumberTicker } from '@/components/ui/number-ticker';
import { CoolMode } from '@/components/ui/cool-mode';
import { Particles } from '@/components/ui/particles';
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
        {/* VAULT BANNER CARD WITH AMBIENT FORGE EMBERS */}
        <MagicCard
          className="w-full mb-4 rounded-2xl border-2 border-[#6f471f]/80 overflow-hidden shadow-[0_10px_26px_rgba(0,0,0,0.55)]"
          innerClassName="bg-gradient-to-r from-[#2a170d]/95 via-[#1a0e07]/95 to-[#24130b]/95"
          backgroundColor="transparent"
          gradientFrom="#d97706"
          gradientTo="#f59e0b"
          gradientColor="rgba(245, 158, 11, 0.14)"
          gradientSize={320}
          gradientOpacity={0.7}
        >
          <div className="relative p-3.5 sm:p-4 md:p-5">
            {/* Subtle Ambient Forge Embers */}
            <Particles
              color="#f59e0b"
              quantity={22}
              ease={80}
              refresh={false}
              className="absolute inset-0 pointer-events-none z-0"
            />

            <header className={`${smithy.header} relative z-10 !mb-0`}>
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
                    <NumberTicker value={inventoryLoad.occupiedSlots} /> / {inventoryLoad.capacity}
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
                    <strong className={smithy.beltValue}>
                      <NumberTicker value={inventoryLoad.stackUnits} /> units
                    </strong>
                  </div>
                </div>
              </section>
            </header>
          </div>
        </MagicCard>

        <div className={smithy.inventoryLayout}>
          {/* KNIGHT'S RACK PAPERDOLL */}
          <MagicCard
            className="rounded-[14px] border-0 p-0 overflow-hidden"
            innerClassName="bg-transparent"
            backgroundColor="transparent"
            gradientFrom="#d97706"
            gradientTo="#78350f"
            gradientColor="rgba(217, 119, 6, 0.16)"
            gradientSize={240}
            gradientOpacity={0.5}
          >
            <section className={`${smithy.oakPanel} ${smithy.rivets} ${smithy.armoryPanel}`}>
              <h2 className={smithy.panelHeading}>
                Knight&apos;s Rack
                <span className={smithy.panelHint}>
                  <NumberTicker value={equippedItems.length} /> socketed
                </span>
              </h2>
              <PaperDoll equippedItems={equippedItems} />
              <div className={smithy.armoryFooter}>
                <div className={smithy.armoryStat}>
                  Armaments
                  <strong><NumberTicker value={inventoryLoad.equipmentCount} /></strong>
                </div>
                <div className={smithy.armoryStat}>
                  Active loadout
                  <strong><NumberTicker value={equippedItems.length} /> / 9</strong>
                </div>
              </div>
            </section>
          </MagicCard>

          {/* OAK TRUNK PANEL */}
          <MagicCard
            className="rounded-[14px] border-0 p-0 overflow-hidden"
            innerClassName="bg-transparent"
            backgroundColor="transparent"
            gradientFrom="#f59e0b"
            gradientTo="#78350f"
            gradientColor="rgba(245, 158, 11, 0.14)"
            gradientSize={300}
            gradientOpacity={0.5}
          >
            <section className={`${smithy.oakPanel} ${smithy.rivets} ${smithy.trunkPanel}`}>
              <div className={smithy.controls}>
                <div className={smithy.tabs} role="group" aria-label="Inventory categories">
                  {(['All', 'Equipment', 'Consumables', 'Materials'] as InventoryFilterTab[]).map((tab) => (
                    <CoolMode key={tab} options={{ particle: "🪙" }}>
                      <button
                        type="button"
                        aria-pressed={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${smithy.tab} ${activeTab === tab ? smithy.activeTab : ''}`}
                      >
                        {tab}
                      </button>
                    </CoolMode>
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
                  <CoolMode options={{ particle: "🔄" }}>
                    <button type="button" className={smithy.secondaryButton} onClick={() => void fetchInventory(charId)}>
                      <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                      Retry
                    </button>
                  </CoolMode>
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
                    <Filter className="h-10 w-10 text-[#d97706]" aria-hidden="true" />
                    <h2 className={smithy.recipeTitle}>
                      {items.length === 0 ? 'The trunk is empty' : 'No matching stores'}
                    </h2>
                    <p className={smithy.subtitle}>
                      {items.length === 0
                        ? 'Complete your daily habit missions and gate expeditions to forge weapons, armor, and field supplies.'
                        : 'Try another chest compartment or clear the search inscription.'}
                    </p>

                    {items.length === 0 && (
                      <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
                        <CoolMode options={{ particle: "📜" }}>
                          <Link
                            href="/habits"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-b from-[#b45309] to-[#78350f] hover:from-[#d97706] hover:to-[#92400e] text-[#fff8e6] text-[10px] font-['Press_Start_2P',monospace] border border-[#ffd58a]/40 shadow-md transition-all"
                          >
                            Habit Missions
                          </Link>
                        </CoolMode>
                        <CoolMode options={{ particle: "⚔️" }}>
                          <Link
                            href="/shop"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#292524] hover:bg-[#3f2c1d] text-[#dfcea7] text-[10px] font-['Press_Start_2P',monospace] border border-[#6f471f] shadow-md transition-all"
                          >
                            Armory Shop
                          </Link>
                        </CoolMode>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </MagicCard>
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
