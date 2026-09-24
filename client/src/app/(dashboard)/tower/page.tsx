"use client";

import { useEffect } from "react";
import { BattleModal } from "@/features/tower/components/BattleModal";
import { TowerView } from "@/features/tower/components/TowerView";
import { useTowerStore } from "@/features/tower/store/useTowerStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { PixelTowerRuinsBackground } from "@/components/ui/pixel";

export default function TowerPage() {
  const { character, loadCharacter } = useCharacterStore();
  const { fetchFloors } = useTowerStore();

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  useEffect(() => {
    const charId = character?.id || "char-id-123";
    fetchFloors(charId);
  }, [character?.id, fetchFloors]);

  return (
    <div className="relative z-30 min-h-full w-full min-w-0 overflow-hidden bg-transparent p-3 text-[#fff8df] selection:bg-amber-700 selection:text-amber-50 sm:p-6">
      {/* === 16-BIT ENCHANTED TOWER RUINS LIVING BACKGROUND === */}
      <PixelTowerRuinsBackground />

      <TowerView />

      <BattleModal />
    </div>
  );
}
