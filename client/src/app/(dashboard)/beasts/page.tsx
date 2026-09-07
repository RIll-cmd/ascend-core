"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useBeastStore } from "@/features/beasts/store/useBeastStore";
import { BeastsAndPetsView } from "@/features/beasts/components/BeastsAndPetsView";

export default function BeastsPage() {
  const { user } = useUser();
  const { character } = useCharacterStore();
  const { collection, isLoading, fetchCollection } = useBeastStore();
  const characterId = character?.id || user?.id || "char-id-123";

  useEffect(() => {
    if (characterId) void fetchCollection(characterId);
  }, [characterId, fetchCollection]);

  if (isLoading && !collection) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="flex items-center gap-3 px-6 py-4 rounded-xl bg-[#1c2c23]/90 border-2 border-[#38513b] text-emerald-200 font-pixel text-sm shadow-xl"
          role="status"
        >
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" aria-hidden="true" />
          <span>Waking the sanctuary aviary...</span>
        </div>
      </div>
    );
  }

  return <BeastsAndPetsView />;
}
