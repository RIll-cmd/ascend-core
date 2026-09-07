export type FloorPresentationTone = "current" | "cleared" | "locked" | "available";

export function getFloorPresentation(status: string, isBoss: boolean, isSelected: boolean) {
  if (status === "LOCKED") return { label: "Sealed", tone: "locked" as const };
  if (status === "CLEARED") return { label: "Cleared", tone: "cleared" as const };
  if (isSelected) return { label: "Current floor", tone: "current" as const };
  return { label: isBoss ? "Boss crest" : "Open", tone: "available" as const };
}
