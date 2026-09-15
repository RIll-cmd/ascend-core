import React, { useEffect, useState } from "react";
import {
  Play,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  X,
  Dumbbell,
  Flame,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useFitnessStore } from "../store/useFitnessStore";
import { ExerciseLogger } from "./ExerciseLogger";
import { RestTimer } from "./RestTimer";
import { PRPopup } from "./PRPopup";
import { WorkoutSummary } from "./WorkoutSummary";

export const WorkoutSessionView: React.FC = () => {
  const {
    activeSession,
    activeExercises,
    sessionLogs,
    sessionSeconds,
    exercises,
    selectedCategory,
    searchQuery,
    loadExercises,
    setSelectedCategory,
    setSearchQuery,
    getFilteredExercises,
    startWorkout,
    finishWorkout,
    recoverActiveSession,
    addExerciseToWorkout,
    incrementSessionTimer,
    logSetFromText,
  } = useFitnessStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Quick Text Log state (Phase 1 Voice Simulator)
  const [quickText, setQuickText] = useState("");
  const [isQuickLogging, setIsQuickLogging] = useState(false);

  const handleQuickTextLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) return;

    setIsQuickLogging(true);
    await logSetFromText(quickText.trim());
    setIsQuickLogging(false);
    setQuickText("");
  };

  // Load master exercises and attempt active session recovery on mount
  useEffect(() => {
    loadExercises();
    recoverActiveSession();
  }, [loadExercises, recoverActiveSession]);

  // Session Stopwatch interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeSession) {
      interval = setInterval(() => {
        incrementSessionTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession, incrementSessionTimer]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleStartWorkout = async () => {
    setIsStarting(true);
    await startWorkout();
    setIsStarting(false);
  };

  const handleFinishWorkout = async () => {
    setShowFinishConfirm(false);
    await finishWorkout();
  };

  const CATEGORIES = [
    "All",
    "Chest",
    "Back",
    "Legs",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Core",
    "Cardio",
    "Mobility",
  ] as const;

  const filteredExercises = getFilteredExercises();

  // If no active session, show Start Workout launch screen
  if (!activeSession) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-slate-100">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="w-16 h-16 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/30">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            Workout Session Engine
          </h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8 text-sm">
            Begin an active gym session to log exercises, track weight and reps, monitor rest timers, and earn RPG stats.
          </p>

          <button
            onClick={handleStartWorkout}
            disabled={isStarting}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-lg px-8 py-4 rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] transition-all flex items-center gap-3 mx-auto uppercase tracking-wider"
          >
            <Play className="w-6 h-6 fill-current" />
            {isStarting ? "Initializing..." : "Start Workout Session"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 text-slate-100 relative pb-28">
      {/* Top Active Session Bar */}
      <div className="sticky top-4 z-30 bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              ACTIVE SESSION
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Live Stopwatch */}
          <div className="flex items-center gap-2 font-mono font-black text-xl text-white">
            <Clock className="w-5 h-5 text-cyan-400" />
            {formatTimer(sessionSeconds)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>
              EXERCISES:{" "}
              <strong className="text-cyan-300 font-bold">{activeExercises.length}</strong>
            </span>
            <span>
              SETS:{" "}
              <strong className="text-cyan-300 font-bold">{sessionLogs.length}</strong>
            </span>
          </div>

          <button
            onClick={() => setShowFinishConfirm(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finish Workout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Quick Text / Voice Log Bar (Phase 1 Voice Simulator) */}
        <form
          onSubmit={handleQuickTextLog}
          className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 shadow-lg flex items-center gap-3"
        >
          <div className="p-2 bg-cyan-500/20 text-cyan-300 rounded-xl">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Quick Log (e.g. 'Bench Press 60 for 8' or 'Squat 100 5')..."
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isQuickLogging || !quickText.trim()}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
          >
            {isQuickLogging ? "Parsing..." : "Quick Log"}
          </button>
        </form>

        {/* Action Header to Add Exercises */}
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div>
            <h3 className="text-base font-bold text-slate-200">Session Exercises</h3>
            <p className="text-xs text-slate-400">
              Add exercises to your active session and log your sets.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </button>
        </div>

        {/* Empty Active Exercises State */}
        {activeExercises.length === 0 ? (
          <div className="border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Dumbbell className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="font-semibold text-slate-300">No exercises added to this session yet.</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Click "Add Exercise" to choose from the exercise database.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Add First Exercise
            </button>
          </div>
        ) : (
          /* List of Active Exercise Loggers */
          <div className="space-y-4">
            {activeExercises.map((exercise) => (
              <ExerciseLogger key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}
      </div>

      {/* Rest Timer Widget */}
      <RestTimer />

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-cyan-400" />
                Select Exercise
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Controls */}
            <div className="p-4 border-b border-slate-800/80 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search exercises by name, muscle, equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? "bg-cyan-500 text-black font-bold"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Selection List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No exercises match your search criteria.
                </div>
              ) : (
                filteredExercises.map((ex) => {
                  const isAdded = activeExercises.some((e) => e.id === ex.id);
                  return (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-cyan-500/40 transition-all"
                    >
                      <div>
                        <div className="font-bold text-slate-200 text-sm">{ex.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {ex.category} • {ex.muscleGroup} • {ex.equipment}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!isAdded) {
                            addExerciseToWorkout(ex);
                          }
                          setShowAddModal(false);
                        }}
                        disabled={isAdded}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                          isAdded
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                            : "bg-cyan-600 hover:bg-cyan-500 text-white"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Add
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Finish Workout Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Finish Workout Session?</h3>
            <p className="text-sm text-slate-400 mb-6">
              You logged <strong className="text-cyan-300">{sessionLogs.length} sets</strong> across{" "}
              <strong className="text-cyan-300">{activeExercises.length} exercises</strong> in{" "}
              <strong className="text-cyan-300">{formatTimer(sessionSeconds)}</strong>.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-sm"
              >
                Continue Workout
              </button>
              <button
                onClick={handleFinishWorkout}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-900/40"
              >
                Confirm Finish
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Gamified PR Victory Modal & Rewards Summary Overlay */}
      <PRPopup />
      <WorkoutSummary />
    </div>
  );
};
