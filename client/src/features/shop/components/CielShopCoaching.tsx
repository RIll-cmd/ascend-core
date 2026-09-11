"use client";

import { useState } from "react";
import { Loader2, ScrollText } from "lucide-react";
import { AiraAvatar, type AiraMood } from "@/components/ui/AiraAvatar";
import { API_BASE_URL } from "@/constants";
import { useAiraStore } from "@/features/aira/store";
import { useCharacterStore } from "@/store/useCharacterStore";
import { playUISound, playVoiceLine } from "@/utils/audio";
import { MagicCard } from "@/components/ui/magic-card";
import styles from "../shop.module.css";

export function CielShopCoaching() {
  const character = useCharacterStore((state) => state.character);
  const currentMood = useAiraStore((state) => state.currentMood);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalysis = async () => {
    if (!character) return;
    setIsLoading(true);
    setError(null);
    playUISound("/sounds/General/10_UI_Menu_SFX/001_Hover_01.wav");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/aira/shop-analysis/${character.id}`,
      );
      if (!response.ok) throw new Error("The appraisal quill went dry.");

      const data = await response.json();
      setAnalysis(data.analysis);
      playVoiceLine("/sounds/AIRA Persona/AI-NOTICE.mp3");
    } catch (requestError) {
      console.error("Failed to fetch Ciel shop analysis", requestError);
      setError("AIRA could not finish the appraisal. Try the ledger again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!character) return null;

  return (
    <MagicCard
      className="w-full rounded-none border-0 p-0 overflow-hidden mb-3.5"
      innerClassName="bg-transparent w-full h-full"
      backgroundColor="transparent"
      gradientFrom="#38bdf8"
      gradientTo="#818cf8"
      gradientColor="rgba(56, 189, 248, 0.12)"
      gradientSize={260}
      gradientOpacity={0.55}
    >
      <section className={styles.appraisalPanel} aria-labelledby="appraisal-heading">
        <div className={styles.appraisalAvatar} aria-hidden="true">
          <AiraAvatar
            mood={currentMood as AiraMood}
            className="h-12 w-12 !rounded-none !border-0 !shadow-none !ring-0"
          />
        </div>

        <div className={styles.appraisalCopy}>
          <h2 id="appraisal-heading">AIRA&apos;s Appraisal Ledger</h2>
          <div className={styles.appraisalStatus} aria-live="polite">
            {isLoading ? (
              <p>Cross-checking your purse, equipment, and current stock…</p>
            ) : error ? (
              <p>{error}</p>
            ) : analysis ? (
              <p>{analysis}</p>
            ) : (
              <p>
                Ask AIRA to mark the wares that best suit your current build and budget.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className={styles.woodButton}
          onClick={() => void fetchAnalysis()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={16} className={styles.buttonSpinner} aria-hidden="true" />
          ) : (
            <ScrollText size={16} aria-hidden="true" />
          )}
          {analysis ? "Appraise again" : "Request appraisal"}
        </button>
      </section>
    </MagicCard>
  );
}
