"use client";

import { useTowerStore } from "@/features/tower/store/useTowerStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { TowerFloorList } from "@/features/tower/components/TowerFloorList";
import { TowerFloorDetails } from "@/features/tower/components/TowerFloorDetails";
import { playAIRASound, playBattleSFX } from "@/utils/audio";

export function TowerView() {
  const { character } = useCharacterStore();
  const {
    floors,
    selectedFloor,
    selectFloor,
    challengeFloor,
    isSimulating,
  } = useTowerStore();

  const handleChallenge = (floorNumber: number) => {
    if (!character) return;
    playBattleSFX("encounter");
    if (selectedFloor?.status === "CLEARED") {
      playAIRASound("REPEATING");
    }
    challengeFloor(character.id, floorNumber);
  };

  return (
    <div className="relative mx-auto grid w-full max-w-[1500px] gap-5 lg:grid-cols-[minmax(340px,0.85fr)_minmax(520px,1.15fr)] lg:h-[660px] max-h-[85vh] z-10">
      {/* Left Column: Windowed Floor Rail */}
      <div className="h-[480px] sm:h-[540px] lg:h-full min-h-0 overflow-hidden">
        <TowerFloorList
          floors={floors}
          selectedFloor={selectedFloor}
          onSelectFloor={selectFloor}
        />
      </div>

      {/* Right Column: Stage Diorama & Combat Briefing */}
      <div className="h-[560px] sm:h-[600px] lg:h-full min-h-0 overflow-hidden">
        {selectedFloor ? (
          <TowerFloorDetails
            selectedFloor={selectedFloor}
            character={character}
            isSimulating={isSimulating}
            onChallenge={handleChallenge}
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border-2 border-[#796b4c]/80 bg-[#181d17]/90 p-8 text-center text-[#ddd4b7]">
            Choose an open floor to inspect its guardian.
          </div>
        )}
      </div>
    </div>
  );
}
