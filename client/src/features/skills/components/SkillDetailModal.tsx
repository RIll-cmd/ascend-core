import React from 'react';
import { SkillDefinition, PlayerSkill } from '../types';
import { SkillIcon } from './SkillIcon';
import { getSkillLore } from '../data/skillLore';
import { playUISound, playBuffSFX } from '@/utils/audio';
import { BookOpen, Sparkles, Swords, X, Lock, CheckCircle2, Star, ExternalLink } from 'lucide-react';

interface SkillDetailModalProps {
  skill: SkillDefinition;
  allSkills?: SkillDefinition[];
  playerSkill?: PlayerSkill;
  available: boolean;
  unmetReason?: string;
  onClose: () => void;
  onUnlock: () => void;
  onSelectSkill?: (skill: SkillDefinition) => void;
  loading: boolean;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({ 
  skill, 
  allSkills,
  playerSkill, 
  available, 
  unmetReason, 
  onClose, 
  onUnlock, 
  onSelectSkill,
  loading 
}) => {
  const loreData = getSkillLore(skill.id, skill.name);
  let reqs: Record<string, any> = {};
  try {
    reqs = JSON.parse(skill.statRequirements);
  } catch (e) {}

  const isMaxLevel = playerSkill && playerSkill.currentLevel >= skill.maxLevel;
  const isUnlocked = !!playerSkill;

  // Ergonomic keyboard listener: Escape to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playUISound("/sounds/General/10_UI_Menu_SFX/001_Hover_01.wav");
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-detail-title"
    >
      {/* CELESTIAL ASTROLABE STAR-PLATE MODAL */}
      <div className="bg-[#070c18]/98 border-4 border-[#ca9e54] shadow-[8px_8px_0_0_#000] max-w-md w-full overflow-hidden text-[#e2e8f0] relative rounded-none">
        
        {/* Top Astrolabe Horizon Coordinates Ribbon */}
        <div className="w-full bg-[#0d1424] border-b border-[#785a28]/60 text-[#ca9e54] text-[11px] font-mono px-3 py-1 flex items-center justify-between tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ca9e54]" />
            <span>CELESTIAL ASTROLABE • STAR PLATE T{skill.tier}</span>
          </span>
          <span className="text-[#fef08a]">{skill.elementPath || 'Universal'}</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3.5 p-4 border-b border-[#785a28]/50 bg-gradient-to-r from-[#0d1527] via-[#090f1d] to-[#0d1527] relative">
          {/* Skill Icon in Brass Frame */}
          <div className="relative w-14 h-14 rounded-none border-2 border-[#ca9e54] bg-[#070c16] p-1 flex items-center justify-center shadow-[3px_3px_0_0_#000]">
            <SkillIcon iconId={skill.icon} size={48} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 id="skill-detail-title" className="text-base sm:text-lg font-bold text-[#fef08a] font-pixel tracking-wide truncate drop-shadow-sm">
              {skill.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#ca9e54]">
              <span className="text-amber-300">{skill.skillType}</span>
              <span>•</span>
              <span className="text-[#94a3b8]">Tier {skill.tier}</span>
              <span>•</span>
              <span className="text-[#38bdf8]">{skill.elementPath || 'Universal'}</span>
            </div>
          </div>

          {/* Close Button */}
          <button 
            type="button"
            onClick={() => {
              playUISound("/sounds/General/10_UI_Menu_SFX/001_Hover_01.wav");
              onClose();
            }} 
            aria-label="Close Starchart"
            className="text-[#ca9e54] hover:text-[#fef08a] hover:bg-[#121c32] rounded-none p-1.5 transition-colors cursor-pointer hover:shadow-[2px_2px_0_0_#000] focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 text-xs font-sans">
          {/* Combat Effect */}
          <div className="p-3 bg-[#0b1222] border border-[#785a28]/60 shadow-[2px_2px_0_0_#000] rounded-none">
            <span className="text-[11px] font-mono font-bold uppercase text-amber-400 tracking-wider mb-1 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>COMBAT MASTERY EFFECT:</span>
            </span>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              {loreData.combatEffect || skill.description}
            </p>
          </div>

          {/* Celestial Codex Inscription */}
          <div className="p-3 bg-gradient-to-br from-[#0e1628] to-[#070b16] border border-purple-500/30 rounded-none shadow-[2px_2px_0_0_#000]">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wider mb-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>CELESTIAL CODEX INSCRIPTION</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed italic">
              &ldquo;{loreData.lore}&rdquo;
            </p>
          </div>

          {/* Stats Matrix Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-[#090f1e] p-2.5 border border-[#785a28]/40 rounded-none shadow-[2px_2px_0_0_#000] font-mono">
            <div>
              <span className="block text-[#94a3b8] text-[11px] uppercase">Constellation Path</span>
              <span className="font-bold text-[#fef08a]">{skill.elementPath || 'Universal'}</span>
            </div>
            <div>
              <span className="block text-[#94a3b8] text-[11px] uppercase">Max Rank</span>
              <span className="font-bold text-[#fef08a]">{skill.maxLevel}</span>
            </div>
            <div>
              <span className="block text-[#94a3b8] text-[11px] uppercase">Current Level</span>
              <span className="font-bold text-amber-300 flex items-center gap-1">
                {playerSkill ? (
                  <>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Lv.{playerSkill.currentLevel}</span>
                  </>
                ) : (
                  'Dormant'
                )}
              </span>
            </div>
            <div>
              <span className="block text-[#94a3b8] text-[11px] uppercase">Astral Essence Cost</span>
              <span className="font-bold text-yellow-400">{skill.baseCostSP} SP</span>
            </div>
          </div>

          {/* Prerequisites Checklist with Deep-Linking */}
          <div className="space-y-1.5 pt-1">
            <h3 className="text-[11px] uppercase font-mono font-bold text-[#ca9e54] tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#ca9e54]" />
              <span>Constellation Alignment Requirements</span>
            </h3>
            <ul className="space-y-1 text-xs font-mono">
              {Object.entries(reqs).length === 0 && (
                <li className="text-[#94a3b8] italic">No prerequisite stars required</li>
              )}
              {Object.entries(reqs).map(([key, val]) => {
                if (key === 'skills') {
                  const prereqs = val as string[];
                  return (
                    <li key={key} className="flex items-center gap-1.5 text-[#cbd5e1] flex-wrap">
                      <span className="w-1.5 h-1.5 rounded-none bg-amber-400 inline-block shadow-[1px_1px_0_0_#000] shrink-0" />
                      <span>Prerequisite Star(s):</span>
                      <div className="inline-flex flex-wrap gap-1.5">
                        {prereqs.map((prereqName) => {
                          const targetSkill = allSkills?.find(
                            s => s.name.toLowerCase() === prereqName.toLowerCase() || s.id === prereqName
                          );
                          return targetSkill && onSelectSkill ? (
                            <button
                              key={prereqName}
                              type="button"
                              onClick={() => {
                                playUISound("/sounds/General/10_UI_Menu_SFX/001_Hover_01.wav");
                                onSelectSkill(targetSkill);
                              }}
                              className="font-bold text-[#fef08a] bg-[#0c1424] hover:bg-[#15233c] border border-[#ca9e54]/70 px-1.5 py-0.5 rounded-none shadow-[1px_1px_0_0_#000] hover:text-white transition-colors cursor-pointer text-[11px] underline underline-offset-2 decoration-amber-400/50 hover:decoration-amber-300 inline-flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:outline-none"
                              title={`Inspect prerequisite star: ${targetSkill.name}`}
                            >
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                              <span>{targetSkill.name}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-[#ca9e54]" />
                            </button>
                          ) : (
                            <span key={prereqName} className="font-bold text-[#fef08a]">
                              {prereqName}
                            </span>
                          );
                        })}
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={key} className="flex items-center gap-1.5 text-[#cbd5e1]">
                    <span className="w-1.5 h-1.5 rounded-none bg-amber-400 inline-block shadow-[1px_1px_0_0_#000]" />
                    Required {key}: <span className="font-bold text-[#fef08a]">{val}</span>
                  </li>
                );
              })}
            </ul>

            {!available && !playerSkill && (
              <p className="text-xs text-rose-400 font-mono font-bold flex items-center gap-1.5 pt-1">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>{unmetReason || 'Prerequisites or Astral Essence not met.'}</span>
              </p>
            )}

            {isMaxLevel && (
              <p className="text-xs text-amber-300 font-mono font-bold flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Zenith reached. Maximum star mastery unlocked.</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#090e1c] border-t border-[#785a28]/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              playUISound("/sounds/General/10_UI_Menu_SFX/001_Hover_01.wav");
              onClose();
            }}
            className="px-4 py-2 bg-[#101828] border border-[#785a28]/60 text-[#cbd5e1] hover:text-[#fef08a] hover:bg-[#18233c] text-xs font-mono font-bold uppercase transition-colors cursor-pointer rounded-none shadow-[2px_2px_0_0_#000] focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            Close Starchart
          </button>

          <button
            type="button"
            onClick={() => {
              playBuffSFX("levelup");
              onUnlock();
            }}
            disabled={!available || loading || !!isMaxLevel}
            className={`
              px-5 py-2 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 rounded-none transition-colors cursor-pointer shadow-[3px_3px_0_0_#000] focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none
              ${
                available && !isMaxLevel
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 active:translate-y-[1px]'
                  : 'bg-[#182030] text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
              }
            `}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {loading
                ? 'Aligning Star...'
                : isMaxLevel
                ? 'Zenith Reached'
                : isUnlocked
                ? `Upgrade (${skill.baseCostSP} SP)`
                : `Awaken Star (${skill.baseCostSP} SP)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
