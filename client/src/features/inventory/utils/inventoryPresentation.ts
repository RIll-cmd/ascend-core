import type { PlayerItem } from "../types/inventory";

export type InventoryFilterTab = "All" | "Equipment" | "Consumables" | "Materials";

const NON_EQUIPMENT_TYPES = new Set(["MATERIAL", "CONSUMABLE"]);

export function filterInventoryItems(
  items: PlayerItem[],
  activeTab: InventoryFilterTab,
  searchQuery: string,
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    const { type, name } = item.itemDefinition;

    if (activeTab === "Equipment" && NON_EQUIPMENT_TYPES.has(type)) return false;
    if (activeTab === "Consumables" && type !== "CONSUMABLE") return false;
    if (activeTab === "Materials" && type !== "MATERIAL") return false;

    return normalizedQuery.length === 0 || name.toLowerCase().includes(normalizedQuery);
  });
}

export function getInventoryLoad(items: PlayerItem[], capacity: number) {
  const occupiedSlots = items.length;
  const stackUnits = items.reduce((total, item) => total + Math.max(0, item.quantity), 0);
  const equipmentCount = items.filter(
    (item) => !NON_EQUIPMENT_TYPES.has(item.itemDefinition.type),
  ).length;

  return {
    occupiedSlots,
    stackUnits,
    equipmentCount,
    capacity,
    fillPercentage: capacity > 0 ? Math.min(100, (occupiedSlots / capacity) * 100) : 0,
  };
}
