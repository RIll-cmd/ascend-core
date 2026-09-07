"use client";

import { useState } from "react";
import { Egg as EggIcon, Flower2, Footprints, Leaf, Loader2, Sparkles, Sprout } from "lucide-react";
import { Egg } from "@/features/beasts/types/beast";
import { useBeastStore } from "@/features/beasts/store/useBeastStore";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import meadow from "@/features/beasts/styles/MeadowAviary.module.css";

interface Props { egg: Egg | null; characterId: string; onSelectEggClick?: () => void }
export const EggIncubatorWidget = ({ egg, characterId, onSelectEggClick }: Props) => {
  const { syncSteps, hatchEgg, isSyncingSteps, isHatching } = useBeastStore();
  const [customSteps, setCustomSteps] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const current = egg?.currentSteps ?? egg?.currentEnergy ?? 0;
  const target = Math.max(1, egg?.targetSteps ?? egg?.targetEnergy ?? 5000);
  const progress = Math.min(100, Math.max(0, Math.floor((current / target) * 100)));
  const ready = Boolean(egg && (egg.status === "READY_TO_HATCH" || current >= target));
  const addSteps = async (amount: number, source = "SIMULATED_WALK") => { playUIMenuSFX("confirm"); await syncSteps(characterId, amount, source); };
  const addCustom = async () => { const amount = Number.parseInt(customSteps, 10); if (!amount || amount < 1) return; setIsSimulating(true); try { await addSteps(amount, "PEDOMETER_SYNC"); setCustomSteps(""); } finally { setIsSimulating(false); } };
  const hatch = async () => { if (!egg || !ready || isHatching) return; playBuffSFX("levelup"); await hatchEgg(characterId, egg.id); };
  return <article className={meadow.incubator}>
    <div className={meadow.sectionHeading}><h2>The overgrown nest</h2><span>{ready ? "WILDFLOWERS BLOOMING" : "SUN-WARMED ROOST"}</span></div>
    <div className={meadow.nestStage}><div className={meadow.nest} aria-hidden="true" />{egg ? <img src={egg.sprite || "/eggs/egg_1.png"} alt={egg.name} width={148} height={148} className={ready ? meadow.readyEgg : meadow.egg} /> : <EggIcon className={meadow.emptyEgg} aria-hidden="true" />}<div className={meadow.nestLeaf} aria-hidden="true"><Leaf /><Leaf /></div></div>
    <h3 className={meadow.eggName}>{egg?.name || "The nest is waiting"}</h3>
    {!egg ? <><p className={meadow.centerCopy}>Choose an egg from the nursery stall, then let your real-world steps gently wake it.</p><button className={meadow.primary} onClick={onSelectEggClick}>Visit the egg stall</button></> : <>
      <div className={meadow.stepNumbers}>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#e3d3a0] text-[#314f31] font-mono text-xs font-bold border border-[#b6a775]">
          <Footprints className="w-4 h-4 text-emerald-700 shrink-0 [image-rendering:auto]" aria-hidden="true" />
          <span>Steps gathered</span>
        </span>
        <strong className="font-mono text-sm sm:text-base text-[#22543d]">
          {current.toLocaleString()} / {target.toLocaleString()}
        </strong>
      </div>
      <div className={meadow.vineProgress} role="progressbar" aria-label="Egg incubation progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <div className={meadow.vineFill} style={{ transform: `scaleX(${progress / 100})` }} />
        {[0, 25, 50, 75, 100].map((mark) => (
          <span
            key={mark}
            className={`${progress >= mark ? meadow.sprouted : meadow.dormant} [image-rendering:auto] flex items-center justify-center`}
            style={{ left: `${mark}%` }}
          >
            {ready && mark > 50 ? <Flower2 className="w-3.5 h-3.5" /> : <Sprout className="w-3.5 h-3.5" />}
          </span>
        ))}
      </div>
      <p className={meadow.progressCaption}>{ready ? "The nest is flowering—your familiar is ready to meet you." : `${Math.max(0,target-current).toLocaleString()} walking steps until hatching.`}</p>
      <div className={meadow.logger}><p>Wooden step markers <span>Manual simulation controls</span></p><div className={meadow.quickSteps}>{[1000,2500,5000].map(n => <button key={n} disabled={isSyncingSteps || isSimulating} onClick={() => addSteps(n)}>+{n.toLocaleString()}</button>)}</div><div className={meadow.customSteps}><label><span className="sr-only">Custom step amount</span><input inputMode="numeric" value={customSteps} onChange={e=>setCustomSteps(e.target.value)} placeholder="Custom steps" /></label><button disabled={isSyncingSteps || isSimulating} onClick={addCustom}>{isSimulating ? <Loader2 className="animate-spin" /> : "Add steps"}</button></div></div>
      <button className={meadow.primary} disabled={!ready || isHatching} onClick={hatch}>{isHatching ? <Loader2 className="animate-spin" /> : <Sparkles />}{ready ? "Welcome your familiar" : "Keep walking"}</button>
    </>}
  </article>;
};
