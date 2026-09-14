import { CanvasElement } from "../types/editor";

export function generateElementJsx(element: CanvasElement): { imports: string[]; jsx: string } {
  const { type, props } = element;

  switch (type) {
    case "button":
      return {
        imports: [`import { Button } from "@/components/ui/8bit";`],
        jsx: `<Button variant="${props.variant || "gold"}" size="${props.size || "md"}" disabled={${Boolean(props.disabled)}}>
  ${props.text || "Click Me"}
</Button>`,
      };

    case "badge":
      return {
        imports: [`import { Badge } from "@/components/ui/8bit";`],
        jsx: `<Badge variant="${props.variant || "gold"}" font="${props.font || "retro"}">
  ${props.text || "BADGE"}
</Badge>`,
      };

    case "card":
      return {
        imports: [
          `import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/8bit";`,
        ],
        jsx: `<Card className="w-full">
  <CardHeader>
    <CardTitle>${props.title || "Card Title"}</CardTitle>
    <CardDescription>${props.description || "Card Description"}</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-xs text-[#c4b5a5]">
      ${props.content || "Card Content goes here..."}
    </p>
  </CardContent>
</Card>`,
      };

    case "progress":
      return {
        imports: [`import { Progress } from "@/components/ui/8bit";`],
        jsx: `<div className="w-full space-y-1.5">
  <div className="flex justify-between text-[10px] font-pixel text-[#fba170]">
    <span>PROGRESS</span>
    <span>${props.value || 0}/${props.max || 100}%</span>
  </div>
  <Progress value={${props.value || 0}} max={${props.max || 100}} />
</div>`,
      };

    case "slider":
      return {
        imports: [`import { Slider } from "@/components/ui/8bit";`],
        jsx: `<div className="w-full space-y-2">
  <div className="flex justify-between text-xs font-pixel text-[#fba170]">
    <span>${props.label || "Volume"}</span>
    <span>${props.value || 50}%</span>
  </div>
  <Slider
    value={[${props.value || 50}]}
    max={${props.max || 100}}
    min={${props.min || 0}}
    step={${props.step || 1}}
  />
</div>`,
      };

    case "switch":
      return {
        imports: [`import { Switch } from "@/components/ui/8bit";`],
        jsx: `<div className="flex items-center justify-between p-3 border-2 border-black bg-[#1a1012] shadow-[2px_2px_0_0_#000]">
  <span className="text-xs font-pixel text-[#fdf2e9]">${props.label || "Toggle Option"}</span>
  <Switch defaultChecked={${Boolean(props.checked)}} />
</div>`,
      };

    case "kbd":
      return {
        imports: [`import { Kbd } from "@/components/ui/8bit";`],
        jsx: `<div className="flex items-center gap-2">
  <Kbd>${props.keyLabel || "SPACE"}</Kbd>
  <span className="text-[10px] font-pixel text-[#c4b5a5]">${props.subText || "ACTION"}</span>
</div>`,
      };

    case "alert":
      return {
        imports: [`import { Alert, AlertTitle, AlertDescription } from "@/components/ui/8bit";`],
        jsx: `<Alert variant="${props.variant || "destructive"}">
  <AlertTitle>${props.title || "Alert Notice"}</AlertTitle>
  <AlertDescription>${props.description || "Alert details and notice message."}</AlertDescription>
</Alert>`,
      };

    case "empty":
      return {
        imports: [
          `import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, Button } from "@/components/ui/8bit";`,
        ],
        jsx: `<Empty className="w-full">
  <EmptyHeader>
    <EmptyTitle>${props.title || "Nothing Found"}</EmptyTitle>
    <EmptyDescription>${props.description || "Explore and discover more items."}</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button variant="gold" size="sm">${props.buttonText || "Return"}</Button>
  </EmptyContent>
</Empty>`,
      };

    case "health-bar":
      return {
        imports: [`import { HealthBar } from "@/components/ui/8bit";`],
        jsx: `<HealthBar
  currentHp={${props.currentHp || 100}}
  maxHp={${props.maxHp || 100}}
  showText={${Boolean(props.showText)}}
/>`,
      };

    case "mana-bar":
      return {
        imports: [`import { ManaBar } from "@/components/ui/8bit";`],
        jsx: `<ManaBar
  currentMp={${props.currentMp || 100}}
  maxMp={${props.maxMp || 100}}
  showText={${Boolean(props.showText)}}
/>`,
      };

    case "xp-bar":
      return {
        imports: [`import { XpBar } from "@/components/ui/8bit";`],
        jsx: `<XpBar
  currentExp={${props.currentXp || 0}}
  expToNextLevel={${props.maxXp || 1000}}
  showText={${Boolean(props.showText)}}
/>`,
      };

    case "enemy-health":
      return {
        imports: [`import { EnemyHealthDisplay } from "@/components/ui/8bit";`],
        jsx: `<EnemyHealthDisplay
  enemyName="${props.bossName || "BOSS"}"
  currentHealth={${props.currentHp || 10000}}
  maxHealth={${props.maxHp || 10000}}
  isBoss={true}
  level={${props.phase || 1}}
  showLevel={true}
  showHealthText={true}
/>`,
      };

    case "item-slot":
      return {
        imports: [`import { Item, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/8bit";`],
        jsx: `<Item variant="${props.rarity || "legendary"}">
  <div className="w-10 h-10 bg-black/60 border-2 border-black flex items-center justify-center text-amber-400 font-pixel text-xs shrink-0 shadow-[2px_2px_0_0_#000]">
    ⚔️
  </div>
  <ItemContent>
    <ItemTitle className="font-pixel text-xs">${props.name || "Legendary Weapon"}</ItemTitle>
    <ItemDescription className="font-pixel text-[9px] text-[#c4b5a5]">
      ${props.description || "+100 Power, +15% Speed"}
    </ItemDescription>
  </ItemContent>
</Item>`,
      };

    case "dialogue":
      return {
        imports: [`import { Dialogue } from "@/components/ui/8bit";`],
        jsx: `<Dialogue
  speakerName="${props.speakerName || "Guide"}"
  avatarFallback="${props.avatarFallback || "NPC"}"
  dialogueText="${props.dialogueText || "Hello, adventurer!"}"
  isPlayer={${Boolean(props.isPlayer)}}
/>`,
      };

    case "quest-card":
      return {
        imports: [
          `import { Badge, Button } from "@/components/ui/8bit";`,
        ],
        jsx: `<div className="relative p-5 backdrop-blur-md bg-[linear-gradient(180deg,rgba(32,18,22,0.92)_0%,rgba(20,11,14,0.96)_100%)] border-y-4 border-[#e05344]/60 shadow-[4px_4px_0_0_#000] font-pixel text-[#fdf2e9] space-y-3">
  {/* 8bitcn Stepped side notches */}
  <div className="absolute inset-0 border-x-4 -mx-1 border-[#e05344]/60 pointer-events-none" aria-hidden="true" />
  
  <div className="flex items-center justify-between gap-2">
    <Badge variant="gold">${props.rank || "S-RANK"}</Badge>
    <span className="text-[10px] text-[#fba170] font-bold">${props.category || "MAIN QUEST"}</span>
  </div>

  <div>
    <h4 className="text-sm font-bold uppercase tracking-wider text-[#fdf2e9]">${props.title || "Quest Objective"}</h4>
    <p className="text-[10px] text-[#c4b5a5] mt-1">${props.objective || "Fulfill objectives..."}</p>
  </div>

  <div className="flex items-center justify-between pt-2 border-t border-[#e05344]/30 text-[10px]">
    <span className="text-[#fba170]">PROGRESS: ${props.progress || "0/1"}</span>
    <span className="text-[#fde047]">REWARD: +${props.rewardGold || 500}G (+${props.rewardExp || 1000} XP)</span>
  </div>
</div>`,
      };

    case "save-slot":
      return {
        imports: [`import { Button } from "@/components/ui/8bit";`],
        jsx: `<div className="relative p-4 border-y-4 border-[#8c7a53]/60 bg-[#161a15] shadow-[3px_3px_0_0_#000] font-pixel flex items-center justify-between gap-3">
  <div className="absolute inset-0 border-x-4 -mx-1 border-[#8c7a53]/60 pointer-events-none" />
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-black border-2 border-[#f59e0b] text-[#fde047] flex items-center justify-center text-xs font-bold shadow-[2px_2px_0_0_#000]">
      #${props.slotNumber || 1}
    </div>
    <div>
      <div className="text-xs font-bold text-[#f3df9d]">${props.title || "SAVE DATA"}</div>
      <div className="text-[9px] text-[#8c7a53] mt-0.5">${props.timestamp || "RECENT"} // ${props.completionRate || "100%"}</div>
    </div>
  </div>
  <Button variant="secondary" size="sm">LOAD</Button>
</div>`,
      };

    case "difficulty-select":
      return {
        imports: [`import { DifficultySelect } from "@/components/ui/8bit";`],
        jsx: `<DifficultySelect />`,
      };

    case "telemetry-card":
      return {
        imports: [],
        jsx: `<div className="relative p-4 bg-[#1a1012] border-y-4 border-[#e05344]/40 shadow-[4px_4px_0_0_#000] font-pixel text-[#fdf2e9] space-y-2">
  <div className="absolute inset-0 border-x-4 -mx-1 border-[#e05344]/40 pointer-events-none" />
  <div className="text-[9px] font-bold text-[#c4b5a5] uppercase tracking-wider">${props.label || "METRIC"}</div>
  <div className="text-xl font-bold text-[#fba170]">${props.value || "100%"}</div>
  <div className="text-[9px] text-[#10b981] font-bold">${props.change || "+0%"}</div>
</div>`,
      };

    case "container-plaque":
      return {
        imports: [],
        jsx: `<div className="relative p-5 bg-[linear-gradient(180deg,rgba(32,18,22,0.95)_0%,rgba(20,11,14,0.98)_100%)] border-y-4 border-[#e05344]/60 shadow-[4px_4px_0_0_#000] font-pixel text-[#fdf2e9]">
  <div className="absolute inset-0 border-x-4 -mx-1 border-[#e05344]/60 pointer-events-none" />
  <h2 className="text-sm sm:text-base font-bold text-[#fdf2e9] tracking-wider uppercase">
    ${props.title || "SANCTUARY TITLE"}
  </h2>
  <p className="text-[10px] text-[#c4b5a5] mt-1 uppercase font-bold">
    ${props.subtitle || "SUBTITLE DECREE"}
  </p>
</div>`,
      };

    case "input-group":
      return {
        imports: [`import { Button } from "@/components/ui/8bit";`],
        jsx: `<div className="flex items-center gap-2">
  <input
    type="text"
    placeholder="${props.placeholder || "INPUT..."}"
    className="h-9 px-3 bg-[#160c0f] border-2 border-black shadow-[2px_2px_0_0_#000] text-xs font-pixel text-[#fdf2e9] placeholder:text-[#8c7b7d] focus:outline-none focus:border-[#fba170] flex-1"
  />
  <Button variant="gold" size="md">${props.buttonText || "SEARCH"}</Button>
</div>`,
      };

    default:
      return {
        imports: [],
        jsx: `<div><!-- Element ${type} --></div>`,
      };
  }
}

export function generateFullCanvasJsx(elements: CanvasElement[]): string {
  if (elements.length === 0) {
    return `// Canvas is currently empty. Click or add 8bitcn elements from the palette!`;
  }

  const allImports = new Set<string>();
  allImports.add(`import * as React from "react";`);

  const elementCodeBlocks: string[] = [];

  for (const element of elements) {
    const { imports, jsx } = generateElementJsx(element);
    imports.forEach((imp) => allImports.add(imp));
    elementCodeBlocks.push(jsx);
  }

  const importStatements = Array.from(allImports).join("\n");
  const childrenCode = elementCodeBlocks
    .map((block) =>
      block
        .split("\n")
        .map((line) => `      ${line}`)
        .join("\n")
    )
    .join("\n\n");

  return `${importStatements}

export default function Custom8BitComposition() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-4 font-pixel">
${childrenCode}
    </div>
  );
}
`;
}
