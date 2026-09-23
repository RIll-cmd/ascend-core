"use client";

import { useEffect } from "react";
import { AscendRouteSkeleton } from "@/components/loading/AscendRouteSkeleton";
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
    return <AscendRouteSkeleton preset="stable" label="Loading beast stable" />;
  }

  return <BeastsAndPetsView />;
}
