"use client";

import React from "react";
import { MuscleRecoveryStatusResponse } from "@/features/workouts/types/muscleRecovery";
import {
  Calendar,
  Zap,
  Flame,
  ShieldCheck,
  RotateCcw,
  Dumbbell,
  Shield,
  Swords,
} from "lucide-react";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { PixelBadge } from "@/components/ui/pixel/PixelBadge";
import { PixelActivityIcon, PixelSwordIcon, PixelSkullIcon, PixelLaurelWreathIcon, PixelMuscleRecoveryIcon } from "@/components/ui/pixel/PixelIcons";

interface MuscleRecoveryHUDProps {
  recoveryStatus?: MuscleRecoveryStatusResponse | null;
  onOpenLogger?: () => void;
  onResetRecovery?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const MuscleRecoveryHUD: React.FC<MuscleRecoveryHUDProps> = ({
  recoveryStatus,
  onOpenLogger,
  onResetRecovery,
  isLoading = false,
  className = "",
}) => {
  const summary = recoveryStatus?.summary || {
    freshCount: 16,
    recoveringCount: 0,
    fatiguedCount: 0,
    totalCount: 16,
    overallFreshness: 100,
    daysSinceLastWorkout: 0,
    lastWorkoutDate: null,
  };

  const getSystemStatus = () => {
    if (summary.overallFreshness >= 80) {
      return {
        label: "FULLY RECOVERED",
        badgeVariant: "success" as const,
        icon: ShieldCheck,
        color: "text-[#22c55e]",
      };
    }
    if (summary.overallFreshness >= 50) {
      return {
        label: "RECOVERING",
        badgeVariant: "warning" as const,
        icon: Zap,
        color: "text-[#f59e0b]",
      };
    }
    return {
      label: "REST RECOMMENDED",
      badgeVariant: "danger" as const,
      icon: Flame,
      color: "text-[#ef4444]",
    };
  };

  const systemStatus = getSystemStatus();
  const StatusIcon = systemStatus.icon;

  return (
    <div
      className={`pixel-stone-slab p-4 sm:p-5 select-none relative ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Header & Status */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#140e0c] border-2 border-[#4a3830] shadow-[inset_2px_2px_0_0_#2a1f1b] flex items-center justify-center shrink-0">
            <PixelMuscleRecoveryIcon className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-sm sm:text-base font-pixel font-bold text-white uppercase tracking-wider">
                Muscle Recovery & Readiness
              </h2>
              <PixelBadge variant={systemStatus.badgeVariant} size="sm">
                <StatusIcon className="w-3 h-3 mr-1" />
                {systemStatus.label}
              </PixelBadge>
            </div>
            <p className="font-sans text-xs text-stone-300 font-medium">
              Real-time physiological readiness telemetry & fatigue distribution
            </p>
          </div>
        </div>

        {/* Right Side: Telemetry Counters & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Days Since Last Workout */}
          <span className="block px-3.5 py-2 bg-[#140e0c] border-2 border-[#4a3830] shadow-[inset_2px_2px_0_0_#0d0908] text-center min-w-[95px]">
            <span className="text-xs font-sans font-bold text-stone-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#f59e0b]" />
              REST
            </span>
            <span className="text-base font-pixel-chunky font-bold text-[#f59e0b] tabular-nums block mt-0.5">
              {summary.daysSinceLastWorkout === 0 ? "TODAY" : `${summary.daysSinceLastWorkout}d`}
            </span>
          </span>

          {/* Fresh Muscle Tally */}
          <span className="block px-3.5 py-2 bg-[#140e0c] border-2 border-[#4a3830] shadow-[inset_2px_2px_0_0_#0d0908] text-center min-w-[125px]">
            <span className="text-xs font-sans font-bold text-stone-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[#22c55e]" />
              READY TO TRAIN
            </span>
            <span className="text-base font-pixel-chunky font-bold text-[#22c55e] tabular-nums block mt-0.5">
              {summary.freshCount} / {summary.totalCount}
            </span>
          </span>

          {/* Action Log Workout Button */}
          {onOpenLogger && (
            <PixelButton
              onClick={onOpenLogger}
              variant="gold"
              size="md"
              className="gap-2 shrink-0 font-pixel"
            >
              <Swords className="w-4 h-4" />
              LOG WORKOUT
            </PixelButton>
          )}

          {/* Dev/Player Reset Simulation Utility */}
          {onResetRecovery && (
            <PixelButton
              onClick={onResetRecovery}
              variant="dark"
              size="sm"
              className="w-9 h-9 min-h-0 p-0 flex items-center justify-center shrink-0"
              title="Reset All Muscles to 100% Ready (Simulation)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
            </PixelButton>
          )}
        </div>
      </div>
    </div>
  );
};
