"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, ArrowRight, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RankAscensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldRank?: string;
  newRank: string;
}

export function RankAscensionModal({
  isOpen,
  onClose,
  oldRank = "F",
  newRank,
}: RankAscensionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-[#0F172A] border border-amber-500/40 rounded-2xl p-8 shadow-2xl overflow-hidden text-center z-10"
          >
            {/* Background Glow Ring */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center"
            >
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Trophy className="w-10 h-10 text-amber-400 animate-pulse" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-semibold flex items-center justify-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Rank Ascension Triggered
              </span>
              <h2 className="text-3xl font-extrabold font-heading text-white tracking-tight">
                RANK ASCENDED!
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Your character power has reached a new threshold. Your rank classification has been permanently elevated.
              </p>
            </motion.div>

            {/* Rank Transition Display */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="my-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center gap-6"
            >
              <div className="text-center">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">
                  Previous Rank
                </span>
                <span className="text-2xl font-bold font-mono text-slate-400">
                  Rank {oldRank}
                </span>
              </div>

              <ArrowRight className="w-6 h-6 text-amber-400 animate-pulse" />

              <div className="text-center">
                <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold block">
                  New Rank
                </span>
                <span className="text-3xl font-extrabold font-mono text-amber-300 drop-shadow-md">
                  Rank {newRank}
                </span>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25"
              >
                CLAIM NEW ASCENSION RANK
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
