interface RoyalRarityTone {
  border: string;
  text: string;
}

export const royalRarityColors: Record<string, RoyalRarityTone> = {
  COMMON: { border: "#78716c", text: "#d6d3d1" },
  UNCOMMON: { border: "#b45309", text: "#fbbf24" },
  RARE: { border: "#d97706", text: "#f59e0b" },
  EPIC: { border: "#ea580c", text: "#fb923c" },
  LEGENDARY: { border: "#f59e0b", text: "#fde68a" },
  MYTHIC: { border: "#991b1b", text: "#fca5a5" },
};
