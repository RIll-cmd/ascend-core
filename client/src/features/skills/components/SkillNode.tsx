import React from 'react';
import { SkillDefinition, PlayerSkill } from '../types';
import { SkillIcon } from './SkillIcon';
import { getSkillLore } from '../data/skillLore';
import { playUISound } from '@/utils/audio';
import { Sparkles, BookOpen, CheckCircle2, Lock, Flame, Zap, Shield, Waves, Crown, Swords, Star } from 'lucide-react';

interface SkillNodeProps {
  skill: SkillDefinition;
  playerSkill?: PlayerSkill;
  status: 'locked' | 'available' | 'unlocked';
  onClick: () => void;
}

export const SkillNode: React.FC<SkillNodeProps> = ({ skill, playerSkill, status, onClick }) => {
  const loreData = getSkillLore(skill.id, skill.name);
  const elementKey = (skill.elementPath || 'universal').toLowerCase();
  const tier = Math.min(5, Math.max(1, skill.tier || 1));

  // Element specific celestial visuals and icons
  let ElementIcon = Sparkles;
  let elementGlowBg = 'from-slate-900 to-slate-950';
  let elementBadgeColor = 'text-slate-300 bg-slate-800/80 border-slate-600';
  let tierBadgeColor = 'text-amber-300 bg-[#121929] border-[#ca9e54]/50';
  let starCoronaClass = '';

  switch (skill.elementPath) {
    case 'Flame':
      ElementIcon = Flame;
      elementGlowBg = 'from-red-950/90 via-[#180e0a] to-[#0a0503]';
      elementBadgeColor = 'text-amber-400 bg-red-950/70 border-amber-500/40';
      tierBadgeColor = 'text-amber-300 bg-red-950/90 border-amber-500/50';
      starCoronaClass = 'shadow-md shadow-black/80 ring-1 ring-amber-400/50';
      break;
    case 'Tempest':
      ElementIcon = Zap;
      elementGlowBg = 'from-cyan-950/90 via-[#0a1520] to-[#04090e]';
      elementBadgeColor = 'text-cyan-300 bg-cyan-950/70 border-cyan-500/40';
      tierBadgeColor = 'text-cyan-300 bg-cyan-950/90 border-cyan-500/50';
      starCoronaClass = 'shadow-md shadow-black/80 ring-1 ring-cyan-400/50';
      break;
    case 'Earth':
      ElementIcon = Shield;
      elementGlowBg = 'from-amber-950/90 via-[#1a140a] to-[#0a0804]';
      elementBadgeColor = 'text-yellow-400 bg-yellow-950/70 border-yellow-500/40';
      tierBadgeColor = 'text-yellow-300 bg-yellow-950/90 border-yellow-500/50';
      starCoronaClass = 'shadow-md shadow-black/80 ring-1 ring-yellow-400/50';
      break;
    case 'Tide':
      ElementIcon = Waves;
      elementGlowBg = 'from-blue-950/90 via-[#0a1222] to-[#03060c]';
      elementBadgeColor = 'text-sky-300 bg-blue-950/70 border-blue-500/40';
      tierBadgeColor = 'text-sky-300 bg-blue-950/90 border-blue-500/50';
      starCoronaClass = 'shadow-md shadow-black/80 ring-1 ring-sky-400/50';
      break;
    case 'Ascension':
      ElementIcon = Crown;
      elementGlowBg = 'from-purple-950/90 via-[#150d22] to-[#07030c]';
      elementBadgeColor = 'text-purple-300 bg-purple-950/70 border-purple-500/40';
      tierBadgeColor = 'text-purple-200 bg-purple-950/90 border-purple-500/50';
      starCoronaClass = 'shadow-md shadow-black/80 ring-1 ring-purple-400/50';
      break;
  }

  // Dynamic classes for node status
  let activeEffectClass = '';
  let containerBg = 'bg-[#080d1a]';

  if (status === 'unlocked') {
    activeEffectClass = `skill-tier-${elementKey}-${tier} ${starCoronaClass}`;
    containerBg = `bg-gradient-to-b ${elementGlowBg}`;
  } else if (status === 'available') {
    activeEffectClass = 'animate-star-ready border-2 border-yellow-400';
    containerBg = 'bg-[#1a1506]';
  } else {
    activeEffectClass = 'border-2 border-slate-800 animate-star-ember';
    containerBg = 'bg-[#080d1a]';
  }

  let reqs: Record<string, any> = {};
  try {
    reqs = JSON.parse(skill.statRequirements);
  } catch (e) {}

  return (
    <div className="relative group/node flex flex-col items-center select-none">
      {/* Interactive Starchart Node */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          playUISound("/sounds/General/10_UI_Menu_SFX/001_Hover_01.wav");
          onClick();
        }}
        aria-label={`${skill.name}, Tier ${tier} ${skill.elementPath || 'Universal'} Star. Status: ${status === 'unlocked' ? `Mastered Level ${playerSkill?.currentLevel || 1}` : status === 'available' ? 'Available to Awaken' : 'Dormant'}`}
        className={`
          relative transition-transform duration-300 
          w-[72px] h-[72px] rounded-none shadow-[3px_3px_0_0_#000] p-1 flex flex-col items-center justify-center
          hover:scale-110 active:scale-95 z-10 cursor-pointer
          focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none
          ${containerBg} ${activeEffectClass}
          ${status === 'locked' ? 'opacity-70 hover:opacity-100 hover:border-slate-500' : ''}
        `}
      >
        {/* Tier Astrolabe Quadrant Pill (Top Left) */}
        <div className={`absolute -top-2 -left-2 text-[11px] font-mono font-black px-1.5 py-0.5 rounded-none border-2 shadow-[2px_2px_0_0_#000] z-20 ${tierBadgeColor}`}>
          {tier === 5 ? (
            <span className="flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5 text-amber-300" />
              <span>ULT</span>
            </span>
          ) : (
            `T${tier}`
          )}
        </div>

        {/* Status Lock / Element Star Indicator (Top Right) */}
        {status === 'locked' ? (
          <div className="absolute -top-2 -right-2 bg-[#080d1a] text-slate-400 border-2 border-slate-700 p-1 rounded-none shadow-[2px_2px_0_0_#000] z-20">
            <Lock className="w-2.5 h-2.5" />
          </div>
        ) : status === 'available' ? (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[11px] font-black px-1.5 py-0.5 rounded-none border-2 border-yellow-200 shadow-[2px_2px_0_0_#000] z-20 animate-pulse font-mono">
            AWAKEN
          </div>
        ) : (
          <div className={`absolute -top-2 -right-2 text-white p-1 rounded-none border-2 shadow-[2px_2px_0_0_#000] z-20 ${elementBadgeColor}`}>
            <ElementIcon className="w-2.5 h-2.5" />
          </div>
        )}

        {/* Skill Sprite Icon with Star Aura */}
        <div className="flex items-center justify-center w-full h-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          <SkillIcon iconId={skill.icon} size={46} />
        </div>
        
        {/* Star Mastery Level Pip (Bottom Right for Unlocked) */}
        {status === 'unlocked' && playerSkill && (
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 text-[11px] font-mono font-black px-1.5 py-0.5 rounded-none border-2 border-[#ca9e54] shadow-[2px_2px_0_0_#000] z-20 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
            <span>Lv.{playerSkill.currentLevel}</span>
          </div>
        )}
      </button>

      {/* Node Skill Name Label Underneath */}
      <span className="mt-2 text-xs font-medium text-[#e2e8f0] text-center max-w-[104px] line-clamp-2 leading-tight tracking-normal font-sans transition-colors group-hover/node:text-[#fef08a]">
        {skill.name}
      </span>

      {/* CELESTIAL ASTROLABE STAR-PLATE TOOLTIP */}
      <div className="hidden group-hover/node:block absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-76 sm:w-88 bg-[#060a14]/98 border-2 border-[#ca9e54] rounded-none p-4 shadow-[4px_4px_0_0_#000] backdrop-blur-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200 text-left">
        {/* Astrolabe Brass Coordinate Bar Accent */}
        <div className="w-full bg-[#0d1424] border border-[#785a28]/60 text-[#ca9e54] text-[11px] font-mono px-2 py-0.5 flex items-center justify-between mb-2">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#ca9e54]" />
            <span>STAR COORD: T{tier} • {skill.elementPath || 'Universal'}</span>
          </span>
          <span className="text-[#fef08a]">{skill.skillType}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-sm font-bold text-[#fef08a] tracking-wide font-pixel flex items-center gap-1.5 drop-shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {skill.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[11px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-none border ${elementBadgeColor}`}>
                {skill.elementPath || "Universal"}
              </span>
              <span className="text-[11px] font-mono text-[#d4b277] bg-[#0c1220] border border-[#785a28]/60 px-1.5 py-0.5 rounded-none">
                Tier {skill.tier}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {status === 'unlocked' ? (
            <span className="text-[11px] font-mono font-bold uppercase text-amber-300 bg-amber-950/70 border border-amber-500/50 px-2 py-0.5 rounded-none flex items-center gap-1 shadow-[1px_1px_0_0_#000]">
              <CheckCircle2 className="w-2.5 h-2.5 text-amber-400" /> AWAKENED Lv.{playerSkill?.currentLevel || 1}
            </span>
          ) : status === 'available' ? (
            <span className="text-[11px] font-mono font-bold uppercase text-yellow-300 bg-yellow-950/80 border border-yellow-400 px-2 py-0.5 rounded-none flex items-center gap-1 shadow-[1px_1px_0_0_#000] animate-pulse">
              READY ({skill.baseCostSP} SP)
            </span>
          ) : (
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-none flex items-center gap-1 shadow-[1px_1px_0_0_#000]">
              <Lock className="w-2.5 h-2.5" /> DORMANT
            </span>
          )}
        </div>

        {/* Combat Description */}
        <div className="my-2.5 p-2.5 rounded-none bg-[#0b1220] border border-[#785a28]/50 shadow-[2px_2px_0_0_#000]">
          <span className="text-[11px] font-mono font-bold uppercase text-amber-400 tracking-wider mb-0.5 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>COMBAT MASTERY EFFECT:</span>
          </span>
          <p className="text-xs text-[#e2e8f0] leading-snug font-sans">
            {loreData.combatEffect || skill.description}
          </p>
        </div>

        {/* Ancient Starchart Lore Chronicle */}
        <div className="my-2.5 p-2.5 rounded-none bg-gradient-to-br from-[#0c1424] to-[#060a12] border border-purple-500/30 relative overflow-hidden shadow-[2px_2px_0_0_#000]">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wider mb-1">
            <BookOpen className="w-3 h-3 text-purple-400" />
            <span>CELESTIAL CODEX INSCRIPTION</span>
          </div>
          <p className="text-xs text-[#cbd5e1] leading-relaxed font-sans italic">
            &ldquo;{loreData.lore}&rdquo;
          </p>
        </div>

        {/* Prerequisites Footer */}
        {Object.keys(reqs).length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-[#785a28]/40 text-[11px] font-mono text-[#d4b277] flex items-center gap-1.5">
            <span className="text-[#ca9e54] font-bold uppercase">REQ:</span>
            <span>
              {Object.entries(reqs)
                .map(([k, v]) => (k === 'skills' ? `Star ${(v as string[]).join(', ')}` : `${v} ${k}`))
                .join(' • ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
