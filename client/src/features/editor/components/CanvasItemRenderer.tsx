"use client";

import * as React from "react";
import { CanvasElement } from "../types/editor";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Progress,
  Slider,
  Switch,
  Kbd,
  Alert,
  AlertTitle,
  AlertDescription,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  HealthBar,
  ManaBar,
  XpBar,
  EnemyHealthDisplay,
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  Dialogue,
  DifficultySelect,
} from "@/components/ui/8bit";
import { PixelMonolithIcon, PixelFlameIcon, PixelShieldIcon } from "@/components/ui/pixel/PixelIcons";

interface CanvasItemRendererProps {
  element: CanvasElement;
  onUpdateProp?: (key: string, value: any) => void;
}

export function CanvasItemRenderer({ element, onUpdateProp }: CanvasItemRendererProps) {
  const { type, props } = element;

  switch (type) {
    case "button":
      return (
        <div className="flex items-center gap-3">
          <Button
            variant={props.variant || "gold"}
            size={props.size || "md"}
            disabled={props.disabled}
            onClick={() => {
              // tactile sound or response
            }}
          >
            {props.text || "Click Me"}
          </Button>
        </div>
      );

    case "badge":
      return (
        <div className="flex items-center gap-2">
          <Badge variant={props.variant || "gold"} font={props.font || "retro"}>
            {props.text || "[ BADGE ]"}
          </Badge>
        </div>
      );

    case "card":
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{props.title || "Card Title"}</CardTitle>
            <CardDescription>{props.description || "Card Description"}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#c4b5a5]">
              {props.content || "Card content goes here..."}
            </p>
          </CardContent>
        </Card>
      );

    case "progress":
      return (
        <div className="w-full space-y-1.5 font-pixel">
          <div className="flex justify-between text-[10px] text-[#fba170] font-bold">
            <span>DISCIPLINE PROGRESS</span>
            <span>{props.value || 0}/{props.max || 100}%</span>
          </div>
          <Progress value={props.value || 0} max={props.max || 100} />
        </div>
      );

    case "slider":
      return (
        <div className="w-full space-y-2 font-pixel">
          <div className="flex justify-between text-xs text-[#fba170] font-bold">
            <span>{props.label || "Volume Level"}</span>
            <span>{props.value || 50}%</span>
          </div>
          <Slider
            value={[props.value || 50]}
            max={props.max || 100}
            min={props.min || 0}
            step={props.step || 5}
            onValueChange={(val) => {
              if (onUpdateProp && val[0] !== undefined) {
                onUpdateProp("value", val[0]);
              }
            }}
          />
        </div>
      );

    case "switch":
      return (
        <div className="flex items-center justify-between p-3 border-2 border-black bg-[#1c1114] shadow-[2px_2px_0_0_#000] font-pixel w-full">
          <span className="text-xs font-bold text-[#fdf2e9]">{props.label || "Option Switch"}</span>
          <Switch
            checked={Boolean(props.checked)}
            onCheckedChange={(checked) => {
              if (onUpdateProp) {
                onUpdateProp("checked", checked);
              }
            }}
          />
        </div>
      );

    case "kbd":
      return (
        <div className="flex items-center gap-2 font-pixel">
          <Kbd>{props.keyLabel || "SPACE"}</Kbd>
          <span className="text-[10px] text-[#c4b5a5] font-bold">{props.subText || "ACTION"}</span>
        </div>
      );

    case "alert":
      return (
        <Alert variant={props.variant || "destructive"} className="w-full font-pixel">
          <AlertTitle className="text-xs">{props.title || "Alert Notice"}</AlertTitle>
          <AlertDescription className="text-[10px] mt-1">
            {props.description || "Alert details and notice message."}
          </AlertDescription>
        </Alert>
      );

    case "empty":
      return (
        <Empty className="w-full font-pixel">
          <EmptyMedia variant="icon">
            <PixelMonolithIcon className="w-6 h-6 text-amber-400" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{props.title || "No Bounties Found"}</EmptyTitle>
            <EmptyDescription>{props.description || "Visit the tavern or guild board to accept tasks."}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="gold" size="sm">{props.buttonText || "Open Guild Board"}</Button>
          </EmptyContent>
        </Empty>
      );

    case "health-bar":
      return (
        <div className="w-full">
          <HealthBar
            currentHp={props.currentHp || 850}
            maxHp={props.maxHp || 1000}
            showText={props.showText ?? true}
          />
        </div>
      );

    case "mana-bar":
      return (
        <div className="w-full">
          <ManaBar
            currentMp={props.currentMp || 450}
            maxMp={props.maxMp || 600}
            showText={props.showText ?? true}
          />
        </div>
      );

    case "xp-bar":
      return (
        <div className="w-full">
          <XpBar
            currentExp={props.currentXp || 4200}
            expToNextLevel={props.maxXp || 6000}
            showText={props.showText ?? true}
          />
        </div>
      );

    case "enemy-health":
      return (
        <div className="w-full">
          <EnemyHealthDisplay
            enemyName={props.bossName || "SPIRE BOSS"}
            currentHealth={props.currentHp || 15000}
            maxHealth={props.maxHp || 20000}
            isBoss={true}
            level={props.phase || 2}
            showLevel={true}
            showHealthText={true}
          />
        </div>
      );

    case "item-slot":
      return (
        <Item variant={props.rarity || "legendary"} className="w-full">
          <div className="w-10 h-10 bg-black/60 border-2 border-black flex items-center justify-center text-amber-400 font-pixel text-sm shrink-0 shadow-[2px_2px_0_0_#000]">
            ⚔️
          </div>
          <ItemContent>
            <div className="flex items-center gap-2">
              <ItemTitle className="font-pixel text-xs">{props.name || "Blade of the Monolith"}</ItemTitle>
              <Badge variant="gold" className="text-[8px]">LVL {props.level || 50}</Badge>
            </div>
            <ItemDescription className="font-pixel text-[9px] text-[#c4b5a5] mt-0.5">
              {props.description || "+85 Attack Power, +12% Critical Velocity"}
            </ItemDescription>
          </ItemContent>
        </Item>
      );

    case "dialogue":
      return (
        <div className="w-full">
          <Dialogue
            speakerName={props.speakerName || "A.I.R.A."}
            avatarFallback={props.avatarFallback || "AI"}
            dialogueText={props.dialogueText || "Greetings, Aspirant."}
            isPlayer={Boolean(props.isPlayer)}
          />
        </div>
      );

    case "quest-card":
      return (
        <div className="relative p-5 backdrop-blur-md bg-[linear-gradient(180deg,rgba(32,18,22,0.92)_0%,rgba(20,11,14,0.96)_100%)] border-y-4 border-[#e05344]/60 shadow-[4px_4px_0_0_#000] font-pixel text-[#fdf2e9] space-y-3 w-full">
          {/* Stepped pixel side notches */}
          <div className="absolute inset-0 border-x-4 -mx-1 border-[#e05344]/60 pointer-events-none" aria-hidden="true" />
          
          <div className="flex items-center justify-between gap-2">
            <Badge variant="gold">{props.rank || "S-RANK"}</Badge>
            <span className="text-[10px] text-[#fba170] font-bold">{props.category || "MAIN QUEST"}</span>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#fdf2e9]">{props.title || "Purge the Void Revenant"}</h4>
            <p className="text-[10px] text-[#c4b5a5] mt-1">{props.objective || "Defeat Spire specters..."}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#e05344]/30 text-[10px] flex-wrap gap-2">
            <span className="text-[#fba170]">PROGRESS: {props.progress || "3/5"}</span>
            <span className="text-[#fde047]">REWARD: +{props.rewardGold || 750}G (+{props.rewardExp || 1500} XP)</span>
          </div>
        </div>
      );

    case "save-slot":
      return (
        <div className="relative p-4 border-y-4 border-[#8c7a53]/60 bg-[#161a15] shadow-[3px_3px_0_0_#000] font-pixel flex items-center justify-between gap-3 w-full">
          <div className="absolute inset-0 border-x-4 -mx-1 border-[#8c7a53]/60 pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black border-2 border-[#f59e0b] text-[#fde047] flex items-center justify-center text-xs font-bold shadow-[2px_2px_0_0_#000]">
              #{props.slotNumber || 1}
            </div>
            <div>
              <div className="text-xs font-bold text-[#f3df9d]">{props.title || "HYPERTROPHY SPLIT"}</div>
              <div className="text-[9px] text-[#8c7a53] mt-0.5">{props.timestamp || "TODAY"} // {props.completionRate || "92%"}</div>
            </div>
          </div>
          <Button variant="secondary" size="sm">LOAD ROUTINE</Button>
        </div>
      );

    case "difficulty-select":
      return (
        <div className="w-full">
          <DifficultySelect />
        </div>
      );

    case "telemetry-card":
      return (
        <div className="relative p-4 bg-[#1a1012] border-y-4 border-[#e05344]/40 shadow-[4px_4px_0_0_#000] font-pixel text-[#fdf2e9] space-y-2 w-full">
          <div className="absolute inset-0 border-x-4 -mx-1 border-[#e05344]/40 pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="text-[9px] font-bold text-[#c4b5a5] uppercase tracking-wider">{props.label || "DISCIPLINE DEPTH"}</div>
            <PixelFlameIcon className="w-4 h-4 text-[#fba170]" />
          </div>
          <div className="text-xl font-bold text-[#fba170]">{props.value || "98.4%"}</div>
          <div className="text-[9px] text-[#10b981] font-bold">{props.change || "+4.2% THIS MOON"}</div>
        </div>
      );

    case "container-plaque":
      return (
        <div className="relative p-5 bg-[linear-gradient(180deg,rgba(32,18,22,0.95)_0%,rgba(20,11,14,0.98)_100%)] border-y-4 border-[#e05344]/60 shadow-[4px_4px_0_0_#000] font-pixel text-[#fdf2e9] w-full">
          <div className="absolute inset-0 border-x-4 -mx-1 border-[#e05344]/60 pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1c1114] border-2 border-black flex items-center justify-center text-[#fba170] shadow-[2px_2px_0_0_#000] shrink-0">
              <PixelMonolithIcon className="w-6 h-6 text-[#fba170]" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#fdf2e9] tracking-wider uppercase">
                {props.title || "TEMPLE OF CONTINUOUS PROGRESSION"}
              </h2>
              <p className="text-[9px] text-[#c4b5a5] mt-1 uppercase font-bold">
                {props.subtitle || "KYOTO SANCTUARY // DAY 142 CADENCE"}
              </p>
            </div>
          </div>
        </div>
      );

    case "input-group":
      return (
        <div className="flex items-center gap-2 w-full font-pixel">
          <input
            type="text"
            placeholder={props.placeholder || "SEARCH SANCTUARY BOUNTIES..."}
            className="h-9 px-3 bg-[#160c0f] border-2 border-black shadow-[2px_2px_0_0_#000] text-xs font-pixel text-[#fdf2e9] placeholder:text-[#8c7b7d] focus:outline-none focus:border-[#fba170] flex-1"
          />
          <Button variant="gold" size="md">{props.buttonText || "SEARCH"}</Button>
        </div>
      );

    default:
      return (
        <div className="p-3 border border-dashed border-[#8c7a53] text-xs font-pixel text-[#c4b5a5]">
          Element: {type}
        </div>
      );
  }
}
