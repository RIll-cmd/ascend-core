import React from "react";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepSchedule } from "./StepSchedule";
import { StepDifficulty } from "./StepDifficulty";
import { StepTiers } from "./StepTiers";
import { StepReview } from "./StepReview";
import { useCreateHabitStore } from "../../store/useCreateHabitStore";
import { useHabitStore } from "../../store/useHabitStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useRouter } from "next/navigation";
import {
  PixelGrimoireIcon,
  PixelArrowRightIcon,
  PixelArrowLeftIcon,
  PixelCheckIcon,
} from "@/components/ui/pixel/PixelIcons";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { toast } from "sonner";

const STEP_LABELS = [
  "Information",
  "Schedule",
  "Difficulty",
  "Tiers",
  "Review",
];

export const CreateHabitWizard: React.FC = () => {
  const { step, nextStep, prevStep, getPayload, reset } = useCreateHabitStore();
  const { createNewHabit, isLoading } = useHabitStore();
  const { character } = useCharacterStore();
  const router = useRouter();

  const handleNext = () => {
    playUIMenuSFX("confirm");
    nextStep();
  };

  const handleBack = () => {
    playUIMenuSFX();
    if (step === 1) {
      reset();
      router.push("/habits");
    } else {
      prevStep();
    }
  };

  const handleSubmit = async () => {
    const payload = getPayload();
    if (!payload.name.trim()) {
      toast.error("Please enter a habit name.");
      return;
    }

    const charId = character?.id || (typeof window !== "undefined" ? localStorage.getItem("ascend_character_id") : null) || "char-id-123";
    const newHabit = await createNewHabit(charId, payload);
    if (newHabit) {
      playBuffSFX();
      toast.success(`Habit created: ${newHabit.name}!`, {
        description: "Your daily habit routine is now active.",
      });
      reset();
      router.push("/habits");
    } else {
      toast.error("Failed to create habit. Please try again.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepBasicInfo />;
      case 2:
        return <StepSchedule />;
      case 3:
        return <StepDifficulty />;
      case 4:
        return <StepTiers />;
      case 5:
        return <StepReview />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1f242b] flex items-center justify-center p-3 sm:p-6 relative font-pixel text-[#1d2d2a] select-none">
      <div className="w-full max-w-2xl bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-4 border-[#3b424c] shadow-[6px_6px_0_0_#111a18] p-5 sm:p-7 relative overflow-hidden text-[#1d2d2a]">
        
        {/* Stone Masonry Corner Brackets */}
        <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#3b424c] pointer-events-none" />
        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#3b424c] pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#3b424c] pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#3b424c] pointer-events-none" />

        {/* Wizard Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#3b424c]/30 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2f3640] border-2 border-[#1d2d2a] flex items-center justify-center text-[#ffb03a] shadow-[2px_2px_0_0_#1d2d2a]">
              <PixelGrimoireIcon className="w-6 h-6 text-[#ffb03a]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase text-[#1d2d2a]">
                ✦ Create New Habit ✦
              </h2>
              <p className="text-[10px] text-[#5a6472] uppercase font-mono font-bold mt-0.5">
                Step {step} of 5 • {STEP_LABELS[step - 1]} Configuration
              </p>
            </div>
          </div>

          <div className="px-2.5 py-1 bg-[#2f3640] text-[#ffd166] border border-[#1d2d2a] text-xs font-bold shadow-[2px_2px_0_0_#111a18]">
            STEP {step}/5
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-6 px-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-[#ffb03a] text-[#1d2d2a] border-2 border-[#1d2d2a] shadow-[2px_2px_0_0_#1d2d2a]"
                    : step > s
                    ? "bg-[#2f3640] text-[#ffd166] border-2 border-[#1d2d2a]"
                    : "bg-[#b0b8c4] text-[#5a6472] border-2 border-[#5a6472]"
                }`}
              >
                {step > s ? <PixelCheckIcon className="w-3.5 h-3.5 text-[#ffb03a]" /> : s}
              </div>
              <span className={`text-[9px] uppercase mt-1 hidden sm:block font-mono font-bold ${
                step === s ? "text-[#ea580c]" : step > s ? "text-[#2f3640]" : "text-[#5a6472]"
              }`}>
                {STEP_LABELS[s - 1]}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStep()}
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 flex justify-between items-center border-t-2 border-[#3b424c]/30 pt-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-3 py-1.5 bg-[#2f3640] hover:bg-[#3b424c] text-[#ffd166] font-pixel font-bold text-xs border-2 border-[#1d2d2a] shadow-[2px_2px_0_0_#1d2d2a] active:translate-y-0.5 cursor-pointer flex items-center gap-1 transition-all"
          >
            <PixelArrowLeftIcon className="w-3.5 h-3.5 mr-0.5" />
            <span>{step === 1 ? "Cancel" : "Back"}</span>
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 bg-[#ffb03a] hover:bg-[#ffd166] text-[#1d2d2a] font-pixel font-bold text-xs border-2 border-[#1d2d2a] shadow-[2px_2px_0_0_#1d2d2a] active:translate-y-0.5 cursor-pointer flex items-center gap-1 transition-all"
            >
              <span>Next</span>
              <PixelArrowRightIcon className="w-3.5 h-3.5 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-1.5 bg-[#ffb03a] hover:bg-[#ffd166] text-[#1d2d2a] font-pixel font-bold text-xs border-2 border-[#1d2d2a] shadow-[2px_2px_0_0_#1d2d2a] active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <PixelCheckIcon className="w-3.5 h-3.5 text-[#1d2d2a]" />
              <span>{isLoading ? "Creating..." : "Save & Activate Habit"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

