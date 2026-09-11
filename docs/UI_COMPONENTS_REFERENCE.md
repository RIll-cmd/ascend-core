# 🏛️ Ascend UI Component Reference Registry

> **Saved Reference**: Complete listings across **Magic UI**, **React Bits**, and **21st.dev**.
> Use this document for instant lookup of UI effects, cards, particles, animations, and habit tracker elements.

---

## 🎯 Quick Recommendation Guide for Habit Tracking UI (Kyoto Dusk Theme)

| Use Case | Component | Source / Registry | Install / Import | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Habit Cards (Hover Spotlight)** | `MagicCard` | Magic UI | `npx shadcn@latest add "@magicui/magic-card"` | Mouse-following spotlight glow around card borders with custom colors (vermilion/amber). |
| **Habit Cards (Pixel Aesthetic)** | `PixelCard` | React Bits | `npx shadcn@latest add "@react-bits/pixel-card"` | Interactive pixelated grid hover effect tailored for retro/pixel-art game themes. |
| **Elite / Priority Habit Glow** | `ShineBorder` / `BorderBeam` | Magic UI | `npx shadcn@latest add "@magicui/shine-border"` | Traveling perimeter light beam highlighting active or high-stakes habits. |
| **Habit Check-in Petal Burst** | `CoolMode` | Magic UI | `npx shadcn@latest add "@magicui/cool-mode"` | Explodes custom particle bursts (sakura petals 🌸, ember sparks) on checkbox click. |
| **Habit Checkmark Spring Action**| `Checkbox Group` | 21st.dev | `npx shadcn@latest add "https://21st.dev/r/edwinvakayil/checkbox-group"` | Spring-physics animated tick checkmark with option group support. |
| **Live Streak & EXP Ticker** | `NumberTicker` | Magic UI | `npx shadcn@latest add "@magicui/number-ticker"` | Tabular numeric counter animating cleanly between old and new values. |
| **Streak Badge** | `StreakBadge` | 21st.dev | `npx shadcn@latest add "https://21st.dev/r/trophyso/streak-badge"` | Dedicated gamified streak badge with fire/tier indicators. |
| **Monthly Habit Calendar** | `Habit Tracker Calendar` | 21st.dev | `npx shadcn@latest add "https://21st.dev/r/cnippet-dev/v-calendar-16"` | Heatmap/calendar highlighting completed days with day counts and check marks. |
| **Lake Ripple Tap Feedback** | `RippleButton` / `Ripple` | Magic UI | `npx shadcn@latest add "@magicui/ripple-button"` | Concentric wave ripple animation echoing tranquil water reflections. |
| **Ambient Veranda Petals** | `Floating3DParticles` | Magic UI | `npx shadcn@latest add "@magicui/floating-3d-particles"` | Pseudo-3D drifting particle field (petals/fireflies) across dashboard. |
| **Pixel Cursor Trail** | `PixelTrail` | React Bits / 21st.dev | `npx shadcn@latest add "@react-bits/pixel-trail"` | Smooth pixelated trailing cursor effect matching retro background art. |
| **Staggered View Entry** | `BlurFade` | Magic UI | `npx shadcn@latest add "@magicui/blur-fade"` | Cinematic blur-fade entrance stagger for habit cards when opening page. |

---

## 🪄 1. Magic UI Registry (78 Components)

> Registry URL: Configured via shadcn or `@magicui`

| Component | Name | Description | Install Command |
| :--- | :--- | :--- | :--- |
| **Android** | `android` | A mockup of an Android device. | `npx shadcn@latest add "@magicui/android"` |
| **Animated Beam** | `animated-beam` | An animated beam of light which travels along a path. Useful for showcasing the integration features of a website. | `npx shadcn@latest add "@magicui/animated-beam"` |
| **Animated Circular Progress Bar** | `animated-circular-progress-bar` | Animated Circular Progress Bar is a component that displays a circular gauge with a percentage value. | `npx shadcn@latest add "@magicui/animated-circular-progress-bar"` |
| **Animated Gradient Text** | `animated-gradient-text` | An animated gradient background which transitions between colors for text. | `npx shadcn@latest add "@magicui/animated-gradient-text"` |
| **Animated Grid Pattern** | `animated-grid-pattern` | A animated background grid pattern made with SVGs, fully customizable using Tailwind CSS. | `npx shadcn@latest add "@magicui/animated-grid-pattern"` |
| **Animated List** | `animated-list` | A list that animates each item in sequence with a delay. Used to showcase notifications or events on your landing page. | `npx shadcn@latest add "@magicui/animated-list"` |
| **Animated Shiny Text** | `animated-shiny-text` | A light glare effect which pans across text making it appear as if it is shimmering. | `npx shadcn@latest add "@magicui/animated-shiny-text"` |
| **Theme Toggler** | `animated-theme-toggler` | Theme toggle with View Transitions and animated clip-path masks (circle, polygons, star), optional viewport-centered origin. | `npx shadcn@latest add "@magicui/animated-theme-toggler"` |
| **Aurora Text** | `aurora-text` | A beautiful aurora text effect | `npx shadcn@latest add "@magicui/aurora-text"` |
| **Avatar Circles** | `avatar-circles` | Overlapping circles of avatars. | `npx shadcn@latest add "@magicui/avatar-circles"` |
| **Backlight** | `backlight` | A backlight glow effect for videos, images, and SVGs. | `npx shadcn@latest add "@magicui/backlight"` |
| **Bento Grid** | `bento-grid` | Bento grid is a layout used to showcase the features of a product in a simple and elegant way. | `npx shadcn@latest add "@magicui/bento-grid"` |
| **Blur Fade** | `blur-fade` | Blur fade in and out animation. Used to smoothly fade in and out content. | `npx shadcn@latest add "@magicui/blur-fade"` |
| **Border Beam** | `border-beam` | An animated beam of light which travels along the border of its container. | `npx shadcn@latest add "@magicui/border-beam"` |
| **Client Tweet Card** | `client-tweet-card` | A client-side version of the tweet card that displays a tweet with the author's name, handle, and profile picture. | `npx shadcn@latest add "@magicui/client-tweet-card"` |
| **Code Comparison** | `code-comparison` | A component which compares two code snippets. | `npx shadcn@latest add "@magicui/code-comparison"` |
| **Comic Text** | `comic-text` | Comic text animation | `npx shadcn@latest add "@magicui/comic-text"` |
| **Confetti** | `confetti` | Confetti animations are best used to delight your users when something special happens | `npx shadcn@latest add "@magicui/confetti"` |
| **Cool Mode** | `cool-mode` | Cool mode effect for buttons, links, and other DOMs | `npx shadcn@latest add "@magicui/cool-mode"` |
| **Dia Text Reveal** | `dia-text-reveal` | A horizontal color band sweeps across text, revealing a gradient shine before settling on the base color. | `npx shadcn@latest add "@magicui/dia-text-reveal"` |
| **Dock** | `dock` | An implementation of the MacOS dock using react + tailwindcss + motion | `npx shadcn@latest add "@magicui/dock"` |
| **Dot Pattern** | `dot-pattern` | A background dot pattern made with SVGs, fully customizable using Tailwind CSS. | `npx shadcn@latest add "@magicui/dot-pattern"` |
| **Dotted Map** | `dotted-map` | A component with a dotted map. | `npx shadcn@latest add "@magicui/dotted-map"` |
| **File Tree** | `file-tree` | A component used to showcase the folder and file structure of a directory. | `npx shadcn@latest add "@magicui/file-tree"` |
| **Flickering Grid** | `flickering-grid` | A flickering grid background made with SVGs, fully customizable using Tailwind CSS. | `npx shadcn@latest add "@magicui/flickering-grid"` |
| **Floating 3D Particles** | `floating-3d-particles` | A canvas-based pseudo-3D particle field with perspective projection, continuous rotation and buoyant drift. | `npx shadcn@latest add "@magicui/floating-3d-particles"` |
| **Glare Hover** | `glare-hover` | A diagonal glare on hover using a ::before gradient and CSS variables (angle, size, duration, color). | `npx shadcn@latest add "@magicui/glare-hover"` |
| **Globe** | `globe` | An autorotating, interactive, and highly performant globe made using WebGL. | `npx shadcn@latest add "@magicui/globe"` |
| **Glyph Matrix** | `glyph-matrix` | An animated grid of subtly shifting glyphs with fade effect and theme support. | `npx shadcn@latest add "@magicui/glyph-matrix"` |
| **Grid Pattern** | `grid-pattern` | A background grid pattern made with SVGs, fully customizable using Tailwind CSS. | `npx shadcn@latest add "@magicui/grid-pattern"` |
| **Hero Video Dialog** | `hero-video-dialog` | A hero video dialog component. | `npx shadcn@latest add "@magicui/hero-video-dialog"` |
| **Hexagon Pattern** | `hexagon-pattern` | A background hexagon pattern made with SVGs, fully customizable using Tailwind CSS. | `npx shadcn@latest add "@magicui/hexagon-pattern"` |
| **Highlighter** | `highlighter` | A text highlighter that mimics the effect of a human-drawn marker stroke. | `npx shadcn@latest add "@magicui/highlighter"` |
| **Hyper Text** | `hyper-text` | A text animation that scrambles letters before revealing the final text. | `npx shadcn@latest add "@magicui/hyper-text"` |
| **Icon Cloud** | `icon-cloud` | An interactive 3D tag cloud component | `npx shadcn@latest add "@magicui/icon-cloud"` |
| **Interactive Grid Pattern** | `interactive-grid-pattern` | A interactive background grid pattern made with SVGs, fully customizable using Tailwind CSS. | `npx shadcn@latest add "@magicui/interactive-grid-pattern"` |
| **Interactive Hover Button** | `interactive-hover-button` |  | `npx shadcn@latest add "@magicui/interactive-hover-button"` |
| **iPhone** | `iphone` | A mockup of the iPhone | `npx shadcn@latest add "@magicui/iphone"` |
| **Kinetic Text** | `kinetic-text` | A text component that animates font weight of characters on hover. | `npx shadcn@latest add "@magicui/kinetic-text"` |
| **Lens** | `lens` | A interactive component that enables zooming into images, videos and other elements. | `npx shadcn@latest add "@magicui/lens"` |
| **Light Rays** | `light-rays` | A component with animated light rays which shine down from above. | `npx shadcn@latest add "@magicui/light-rays"` |
| **Line Shadow Text** | `line-shadow-text` | A text component with a moving line shadow. | `npx shadcn@latest add "@magicui/line-shadow-text"` |
| **Magic Card** | `magic-card` | A spotlight effect that follows your mouse cursor and highlights borders on hover. | `npx shadcn@latest add "@magicui/magic-card"` |
| **Marquee** | `marquee` | An infinite scrolling component that can be used to display text, images, or videos. | `npx shadcn@latest add "@magicui/marquee"` |
| **Meteors** | `meteors` | A meteor shower effect. | `npx shadcn@latest add "@magicui/meteors"` |
| **Morphing Text** | `morphing-text` | A dynamic text morphing component for Magic UI. | `npx shadcn@latest add "@magicui/morphing-text"` |
| **Neon Gradient Card** | `neon-gradient-card` | A beautiful neon card effect | `npx shadcn@latest add "@magicui/neon-gradient-card"` |
| **Noise Texture** | `noise-texture` | An SVG fractal noise layer using feTurbulence, desaturation, and contrast controls for subtle texture overlays. | `npx shadcn@latest add "@magicui/noise-texture"` |
| **Number Ticker** | `number-ticker` | Animate numbers to count up or down to a target number | `npx shadcn@latest add "@magicui/number-ticker"` |
| **Orbiting Circles** | `orbiting-circles` | A collection of circles which move in orbit along a circular path | `npx shadcn@latest add "@magicui/orbiting-circles"` |
| **Particles** | `particles` | Particles are a fun way to add some visual flair to your website. They can be used to create a sense of depth, movement, and interactivity. | `npx shadcn@latest add "@magicui/particles"` |
| **Pixel Image** | `pixel-image` | A component that displays an image with a pixelated effect, creating a retro aesthetic. | `npx shadcn@latest add "@magicui/pixel-image"` |
| **Pointer** | `pointer` | A component that displays a pointer when hovering over an element | `npx shadcn@latest add "@magicui/pointer"` |
| **Progressive Blur** | `progressive-blur` | The Progressive Blur component adds a smooth blur gradient effect to scrollable content, indicating more content below or above. | `npx shadcn@latest add "@magicui/progressive-blur"` |
| **Pulsating Button** | `pulsating-button` | An animated pulsating button useful for capturing attention of users. | `npx shadcn@latest add "@magicui/pulsating-button"` |
| **Rainbow Button** | `rainbow-button` | An animated button with a rainbow effect. | `npx shadcn@latest add "@magicui/rainbow-button"` |
| **Retro Grid** | `retro-grid` | An animated scrolling retro grid effect | `npx shadcn@latest add "@magicui/retro-grid"` |
| **Ripple** | `ripple` | An animated ripple effect typically used behind elements to emphasize them. | `npx shadcn@latest add "@magicui/ripple"` |
| **Ripple Button** | `ripple-button` | An animated button with ripple useful for user engagement. | `npx shadcn@latest add "@magicui/ripple-button"` |
| **Safari** | `safari` | A safari browser mockup to showcase your website. | `npx shadcn@latest add "@magicui/safari"` |
| **Scroll Based Velocity** | `scroll-based-velocity` | Scrolling text whose speed changes based on scroll speed | `npx shadcn@latest add "@magicui/scroll-based-velocity"` |
| **Scroll Progress** | `scroll-progress` | Animated Scroll Progress for your pages | `npx shadcn@latest add "@magicui/scroll-progress"` |
| **Shimmer Button** | `shimmer-button` | A button with a shimmering light which travels around the perimeter. | `npx shadcn@latest add "@magicui/shimmer-button"` |
| **Shine Border** | `shine-border` | Shine border is an animated background border effect. | `npx shadcn@latest add "@magicui/shine-border"` |
| **Shiny Button** | `shiny-button` | A shiny button component with dynamic styles in the dark mode or light mode. | `npx shadcn@latest add "@magicui/shiny-button"` |
| **Smooth Cursor** | `smooth-cursor` | A customizable, physics-based smooth cursor animation component with spring animations and rotation effects | `npx shadcn@latest add "@magicui/smooth-cursor"` |
| **Sparkles Text** | `sparkles-text` | A dynamic text that generates continuous sparkles with smooth transitions, perfect for highlighting text with animated stars. | `npx shadcn@latest add "@magicui/sparkles-text"` |
| **Spinning Text** | `spinning-text` | The Spinning Text component animates text in a circular motion with customizable speed, direction, color, and transitions for dynamic and engaging effects. | `npx shadcn@latest add "@magicui/spinning-text"` |
| **Striped Pattern** | `striped-pattern` | A background striped pattern made with SVGs, fully customizable using Tailwind CSS. | `npx shadcn@latest add "@magicui/striped-pattern"` |
| **Terminal** | `terminal` | A terminal component | `npx shadcn@latest add "@magicui/terminal"` |
| **Text 3D Flip** | `text-3d-flip` | A text effect that flips each letter in 3D with a staggered animation on hover. | `npx shadcn@latest add "@magicui/text-3d-flip"` |
| **Text Animate** | `text-animate` | A text animation component that animates text using a variety of different animations. | `npx shadcn@latest add "@magicui/text-animate"` |
| **Text Reveal** | `text-reveal` | Fade in text as you scroll down the page. | `npx shadcn@latest add "@magicui/text-reveal"` |
| **Tweet Card** | `tweet-card` | A card that displays a tweet with the author's name, handle, and profile picture. | `npx shadcn@latest add "@magicui/tweet-card"` |
| **Typing Animation** | `typing-animation` | Characters appearing in typed animation | `npx shadcn@latest add "@magicui/typing-animation"` |
| **Video Text** | `video-text` | A component that displays text with a video playing in the background. | `npx shadcn@latest add "@magicui/video-text"` |
| **Warp Background** | `warp-background` | A card with a time warping background effect. | `npx shadcn@latest add "@magicui/warp-background"` |
| **Word Rotate** | `word-rotate` | A vertical rotation of words | `npx shadcn@latest add "@magicui/word-rotate"` |

---

## ⚛️ 2. React Bits Registry (171 Components)

> Registry URL: `https://reactbits.dev/r/{name}.json` (configured in `components.json` as `@react-bits`)

### 📂 Components (45 items)

| Component Name | Category | Install Command |
| :--- | :--- | :--- |
| **AccordionGallery** | Components | `npx shadcn@latest add "@react-bits/accordion-gallery"` |
| **AnimatedList** | Components | `npx shadcn@latest add "@react-bits/animated-list"` |
| **BorderGlow** | Components | `npx shadcn@latest add "@react-bits/border-glow"` |
| **BounceCards** | Components | `npx shadcn@latest add "@react-bits/bounce-cards"` |
| **BubbleMenu** | Components | `npx shadcn@latest add "@react-bits/bubble-menu"` |
| **CardNav** | Components | `npx shadcn@latest add "@react-bits/card-nav"` |
| **CardSwap** | Components | `npx shadcn@latest add "@react-bits/card-swap"` |
| **Carousel** | Components | `npx shadcn@latest add "@react-bits/carousel"` |
| **ChromaGrid** | Components | `npx shadcn@latest add "@react-bits/chroma-grid"` |
| **CircularGallery** | Components | `npx shadcn@latest add "@react-bits/circular-gallery"` |
| **Counter** | Components | `npx shadcn@latest add "@react-bits/counter"` |
| **CurvedInput** | Components | `npx shadcn@latest add "@react-bits/curved-input"` |
| **DecayCard** | Components | `npx shadcn@latest add "@react-bits/decay-card"` |
| **DepthCarousel** | Components | `npx shadcn@latest add "@react-bits/depth-carousel"` |
| **Dock** | Components | `npx shadcn@latest add "@react-bits/dock"` |
| **DomeGallery** | Components | `npx shadcn@latest add "@react-bits/dome-gallery"` |
| **DriftWall** | Components | `npx shadcn@latest add "@react-bits/drift-wall"` |
| **ElasticSlider** | Components | `npx shadcn@latest add "@react-bits/elastic-slider"` |
| **FlowingMenu** | Components | `npx shadcn@latest add "@react-bits/flowing-menu"` |
| **FluidGlass** | Components | `npx shadcn@latest add "@react-bits/fluid-glass"` |
| **FlyingPosters** | Components | `npx shadcn@latest add "@react-bits/flying-posters"` |
| **Folder** | Components | `npx shadcn@latest add "@react-bits/folder"` |
| **GlassIcons** | Components | `npx shadcn@latest add "@react-bits/glass-icons"` |
| **GlassSurface** | Components | `npx shadcn@latest add "@react-bits/glass-surface"` |
| **GooeyNav** | Components | `npx shadcn@latest add "@react-bits/gooey-nav"` |
| **InfiniteMenu** | Components | `npx shadcn@latest add "@react-bits/infinite-menu"` |
| **InfiniteSpiral** | Components | `npx shadcn@latest add "@react-bits/infinite-spiral"` |
| **Lanyard** | Components | `npx shadcn@latest add "@react-bits/lanyard"` |
| **LineSidebar** | Components | `npx shadcn@latest add "@react-bits/line-sidebar"` |
| **MagicBento** | Components | `npx shadcn@latest add "@react-bits/magic-bento"` |
| **Masonry** | Components | `npx shadcn@latest add "@react-bits/masonry"` |
| **ModelViewer** | Components | `npx shadcn@latest add "@react-bits/model-viewer"` |
| **MorphSlider** | Components | `npx shadcn@latest add "@react-bits/morph-slider"` |
| **OptionWheel** | Components | `npx shadcn@latest add "@react-bits/option-wheel"` |
| **PillNav** | Components | `npx shadcn@latest add "@react-bits/pill-nav"` |
| **PixelCard** | Components | `npx shadcn@latest add "@react-bits/pixel-card"` |
| **ProfileCard** | Components | `npx shadcn@latest add "@react-bits/profile-card"` |
| **ReflectiveCard** | Components | `npx shadcn@latest add "@react-bits/reflective-card"` |
| **ScrollStack** | Components | `npx shadcn@latest add "@react-bits/scroll-stack"` |
| **SpecularButton** | Components | `npx shadcn@latest add "@react-bits/specular-button"` |
| **SpotlightCard** | Components | `npx shadcn@latest add "@react-bits/spotlight-card"` |
| **Stack** | Components | `npx shadcn@latest add "@react-bits/stack"` |
| **StaggeredMenu** | Components | `npx shadcn@latest add "@react-bits/staggered-menu"` |
| **Stepper** | Components | `npx shadcn@latest add "@react-bits/stepper"` |
| **TiltedCard** | Components | `npx shadcn@latest add "@react-bits/tilted-card"` |

### 📂 Animations (38 items)

| Component Name | Category | Install Command |
| :--- | :--- | :--- |
| **AnimatedContent** | Animations | `npx shadcn@latest add "@react-bits/animated-content"` |
| **Antigravity** | Animations | `npx shadcn@latest add "@react-bits/antigravity"` |
| **BlobCursor** | Animations | `npx shadcn@latest add "@react-bits/blob-cursor"` |
| **ClickSpark** | Animations | `npx shadcn@latest add "@react-bits/click-spark"` |
| **Crosshair** | Animations | `npx shadcn@latest add "@react-bits/crosshair"` |
| **Cubes** | Animations | `npx shadcn@latest add "@react-bits/cubes"` |
| **CursorGrid** | Animations | `npx shadcn@latest add "@react-bits/cursor-grid"` |
| **ElasticMesh** | Animations | `npx shadcn@latest add "@react-bits/elastic-mesh"` |
| **ElectricBorder** | Animations | `npx shadcn@latest add "@react-bits/electric-border"` |
| **FadeContent** | Animations | `npx shadcn@latest add "@react-bits/fade-content"` |
| **GhostCursor** | Animations | `npx shadcn@latest add "@react-bits/ghost-cursor"` |
| **GlareHover** | Animations | `npx shadcn@latest add "@react-bits/glare-hover"` |
| **GlowCursor** | Animations | `npx shadcn@latest add "@react-bits/glow-cursor"` |
| **GradualBlur** | Animations | `npx shadcn@latest add "@react-bits/gradual-blur"` |
| **HalftoneReveal** | Animations | `npx shadcn@latest add "@react-bits/halftone-reveal"` |
| **ImageTrail** | Animations | `npx shadcn@latest add "@react-bits/image-trail"` |
| **LaserFlow** | Animations | `npx shadcn@latest add "@react-bits/laser-flow"` |
| **LogoLoop** | Animations | `npx shadcn@latest add "@react-bits/logo-loop"` |
| **MagicRings** | Animations | `npx shadcn@latest add "@react-bits/magic-rings"` |
| **Magnet** | Animations | `npx shadcn@latest add "@react-bits/magnet"` |
| **MagnetLines** | Animations | `npx shadcn@latest add "@react-bits/magnet-lines"` |
| **MetaBalls** | Animations | `npx shadcn@latest add "@react-bits/meta-balls"` |
| **MetallicPaint** | Animations | `npx shadcn@latest add "@react-bits/metallic-paint"` |
| **Noise** | Animations | `npx shadcn@latest add "@react-bits/noise"` |
| **OrbitImages** | Animations | `npx shadcn@latest add "@react-bits/orbit-images"` |
| **PixelSwap** | Animations | `npx shadcn@latest add "@react-bits/pixel-swap"` |
| **PixelTrail** | Animations | `npx shadcn@latest add "@react-bits/pixel-trail"` |
| **PixelTransition** | Animations | `npx shadcn@latest add "@react-bits/pixel-transition"` |
| **Ribbons** | Animations | `npx shadcn@latest add "@react-bits/ribbons"` |
| **RippleDistortion** | Animations | `npx shadcn@latest add "@react-bits/ripple-distortion"` |
| **ScrollExpand** | Animations | `npx shadcn@latest add "@react-bits/scroll-expand"` |
| **ShapeBlur** | Animations | `npx shadcn@latest add "@react-bits/shape-blur"` |
| **SplashCursor** | Animations | `npx shadcn@latest add "@react-bits/splash-cursor"` |
| **StarBorder** | Animations | `npx shadcn@latest add "@react-bits/star-border"` |
| **StickerPeel** | Animations | `npx shadcn@latest add "@react-bits/sticker-peel"` |
| **Strands** | Animations | `npx shadcn@latest add "@react-bits/strands"` |
| **SwarmCursor** | Animations | `npx shadcn@latest add "@react-bits/swarm-cursor"` |
| **TargetCursor** | Animations | `npx shadcn@latest add "@react-bits/target-cursor"` |

### 📂 Backgrounds (56 items)

| Component Name | Category | Install Command |
| :--- | :--- | :--- |
| **AcidSquares** | Backgrounds | `npx shadcn@latest add "@react-bits/acid-squares"` |
| **AeroShards** | Backgrounds | `npx shadcn@latest add "@react-bits/aero-shards"` |
| **Aurora** | Backgrounds | `npx shadcn@latest add "@react-bits/aurora"` |
| **Balatro** | Backgrounds | `npx shadcn@latest add "@react-bits/balatro"` |
| **Ballpit** | Backgrounds | `npx shadcn@latest add "@react-bits/ballpit"` |
| **Beams** | Backgrounds | `npx shadcn@latest add "@react-bits/beams"` |
| **CRTWarp** | Backgrounds | `npx shadcn@latest add "@react-bits/c-r-t-warp"` |
| **ColorBends** | Backgrounds | `npx shadcn@latest add "@react-bits/color-bends"` |
| **DarkVeil** | Backgrounds | `npx shadcn@latest add "@react-bits/dark-veil"` |
| **Dither** | Backgrounds | `npx shadcn@latest add "@react-bits/dither"` |
| **DotField** | Backgrounds | `npx shadcn@latest add "@react-bits/dot-field"` |
| **DotGrid** | Backgrounds | `npx shadcn@latest add "@react-bits/dot-grid"` |
| **EvilEye** | Backgrounds | `npx shadcn@latest add "@react-bits/evil-eye"` |
| **FaultyTerminal** | Backgrounds | `npx shadcn@latest add "@react-bits/faulty-terminal"` |
| **Ferrofluid** | Backgrounds | `npx shadcn@latest add "@react-bits/ferrofluid"` |
| **FloatingLines** | Backgrounds | `npx shadcn@latest add "@react-bits/floating-lines"` |
| **Galaxy** | Backgrounds | `npx shadcn@latest add "@react-bits/galaxy"` |
| **GhostFibers** | Backgrounds | `npx shadcn@latest add "@react-bits/ghost-fibers"` |
| **GradientBlinds** | Backgrounds | `npx shadcn@latest add "@react-bits/gradient-blinds"` |
| **GradientWaves** | Backgrounds | `npx shadcn@latest add "@react-bits/gradient-waves"` |
| **Grainient** | Backgrounds | `npx shadcn@latest add "@react-bits/grainient"` |
| **GridDistortion** | Backgrounds | `npx shadcn@latest add "@react-bits/grid-distortion"` |
| **GridMotion** | Backgrounds | `npx shadcn@latest add "@react-bits/grid-motion"` |
| **GridScan** | Backgrounds | `npx shadcn@latest add "@react-bits/grid-scan"` |
| **Hyperspeed** | Backgrounds | `npx shadcn@latest add "@react-bits/hyperspeed"` |
| **Iridescence** | Backgrounds | `npx shadcn@latest add "@react-bits/iridescence"` |
| **LetterGlitch** | Backgrounds | `npx shadcn@latest add "@react-bits/letter-glitch"` |
| **LightPillar** | Backgrounds | `npx shadcn@latest add "@react-bits/light-pillar"` |
| **LightRays** | Backgrounds | `npx shadcn@latest add "@react-bits/light-rays"` |
| **LightTunnel** | Backgrounds | `npx shadcn@latest add "@react-bits/light-tunnel"` |
| **Lightfall** | Backgrounds | `npx shadcn@latest add "@react-bits/lightfall"` |
| **Lightning** | Backgrounds | `npx shadcn@latest add "@react-bits/lightning"` |
| **LineWaves** | Backgrounds | `npx shadcn@latest add "@react-bits/line-waves"` |
| **LiquidChrome** | Backgrounds | `npx shadcn@latest add "@react-bits/liquid-chrome"` |
| **LiquidEther** | Backgrounds | `npx shadcn@latest add "@react-bits/liquid-ether"` |
| **MoltenMetal** | Backgrounds | `npx shadcn@latest add "@react-bits/molten-metal"` |
| **Orb** | Backgrounds | `npx shadcn@latest add "@react-bits/orb"` |
| **Particles** | Backgrounds | `npx shadcn@latest add "@react-bits/particles"` |
| **PixelBlast** | Backgrounds | `npx shadcn@latest add "@react-bits/pixel-blast"` |
| **PixelSnow** | Backgrounds | `npx shadcn@latest add "@react-bits/pixel-snow"` |
| **Plasma** | Backgrounds | `npx shadcn@latest add "@react-bits/plasma"` |
| **PlasmaWave** | Backgrounds | `npx shadcn@latest add "@react-bits/plasma-wave"` |
| **Prism** | Backgrounds | `npx shadcn@latest add "@react-bits/prism"` |
| **PrismaticBurst** | Backgrounds | `npx shadcn@latest add "@react-bits/prismatic-burst"` |
| **Radar** | Backgrounds | `npx shadcn@latest add "@react-bits/radar"` |
| **RippleGrid** | Backgrounds | `npx shadcn@latest add "@react-bits/ripple-grid"` |
| **Scanner** | Backgrounds | `npx shadcn@latest add "@react-bits/scanner"` |
| **ShapeGrid** | Backgrounds | `npx shadcn@latest add "@react-bits/shape-grid"` |
| **SideRays** | Backgrounds | `npx shadcn@latest add "@react-bits/side-rays"` |
| **Silk** | Backgrounds | `npx shadcn@latest add "@react-bits/silk"` |
| **SlicedWaves** | Backgrounds | `npx shadcn@latest add "@react-bits/sliced-waves"` |
| **SoftAurora** | Backgrounds | `npx shadcn@latest add "@react-bits/soft-aurora"` |
| **Threads** | Backgrounds | `npx shadcn@latest add "@react-bits/threads"` |
| **Topography** | Backgrounds | `npx shadcn@latest add "@react-bits/topography"` |
| **Waves** | Backgrounds | `npx shadcn@latest add "@react-bits/waves"` |
| **WebThreads** | Backgrounds | `npx shadcn@latest add "@react-bits/web-threads"` |

### 📂 TextAnimations (32 items)

| Component Name | Category | Install Command |
| :--- | :--- | :--- |
| **ASCIIText** | TextAnimations | `npx shadcn@latest add "@react-bits/a-s-c-i-i-text"` |
| **BlurText** | TextAnimations | `npx shadcn@latest add "@react-bits/blur-text"` |
| **CircularText** | TextAnimations | `npx shadcn@latest add "@react-bits/circular-text"` |
| **CountUp** | TextAnimations | `npx shadcn@latest add "@react-bits/count-up"` |
| **CurvedLoop** | TextAnimations | `npx shadcn@latest add "@react-bits/curved-loop"` |
| **DecryptedText** | TextAnimations | `npx shadcn@latest add "@react-bits/decrypted-text"` |
| **DepthText** | TextAnimations | `npx shadcn@latest add "@react-bits/depth-text"` |
| **EchoText** | TextAnimations | `npx shadcn@latest add "@react-bits/echo-text"` |
| **FallingText** | TextAnimations | `npx shadcn@latest add "@react-bits/falling-text"` |
| **FoldText** | TextAnimations | `npx shadcn@latest add "@react-bits/fold-text"` |
| **FuzzyText** | TextAnimations | `npx shadcn@latest add "@react-bits/fuzzy-text"` |
| **GlitchText** | TextAnimations | `npx shadcn@latest add "@react-bits/glitch-text"` |
| **GradientText** | TextAnimations | `npx shadcn@latest add "@react-bits/gradient-text"` |
| **MaskedHeading** | TextAnimations | `npx shadcn@latest add "@react-bits/masked-heading"` |
| **ParticleText** | TextAnimations | `npx shadcn@latest add "@react-bits/particle-text"` |
| **RotatingText** | TextAnimations | `npx shadcn@latest add "@react-bits/rotating-text"` |
| **ScrambledText** | TextAnimations | `npx shadcn@latest add "@react-bits/scrambled-text"` |
| **ScrollFloat** | TextAnimations | `npx shadcn@latest add "@react-bits/scroll-float"` |
| **ScrollReveal** | TextAnimations | `npx shadcn@latest add "@react-bits/scroll-reveal"` |
| **ScrollVelocity** | TextAnimations | `npx shadcn@latest add "@react-bits/scroll-velocity"` |
| **ShinyText** | TextAnimations | `npx shadcn@latest add "@react-bits/shiny-text"` |
| **Shuffle** | TextAnimations | `npx shadcn@latest add "@react-bits/shuffle"` |
| **SplitFlapText** | TextAnimations | `npx shadcn@latest add "@react-bits/split-flap-text"` |
| **SplitText** | TextAnimations | `npx shadcn@latest add "@react-bits/split-text"` |
| **StrokeText** | TextAnimations | `npx shadcn@latest add "@react-bits/stroke-text"` |
| **TextCursor** | TextAnimations | `npx shadcn@latest add "@react-bits/text-cursor"` |
| **TextLoop** | TextAnimations | `npx shadcn@latest add "@react-bits/text-loop"` |
| **TextPressure** | TextAnimations | `npx shadcn@latest add "@react-bits/text-pressure"` |
| **TextType** | TextAnimations | `npx shadcn@latest add "@react-bits/text-type"` |
| **TrueFocus** | TextAnimations | `npx shadcn@latest add "@react-bits/true-focus"` |
| **VariableProximity** | TextAnimations | `npx shadcn@latest add "@react-bits/variable-proximity"` |
| **WarpText** | TextAnimations | `npx shadcn@latest add "@react-bits/warp-text"` |

---

## 🌐 3. Curated 21st.dev Components

> Catalog: 21st.dev MCP (`21st-magic`)

| Component | Author | ID | Preview / Details | Install Command |
| :--- | :--- | :--- | :--- | :--- |
| **Habit Tracker Calendar** | `cnippet-dev` | `25158` | Monthly calendar with check indicators & running day counts | `npx shadcn@latest add "https://21st.dev/r/cnippet-dev/v-calendar-16"` |
| **Streak Badge** | `trophyso` | `13137` | Gamified streak badge with tier counters | `npx shadcn@latest add "https://21st.dev/r/trophyso/streak-badge"` |
| **Pixel Trail** | `jatin-yadav05` | `9669` | Smooth cursor pixel trail effect | `npx shadcn@latest add "https://21st.dev/r/jatin-yadav05/pixel-trail"` |
| **Checkbox Group** | `edwinvakayil` | `25106` | Spring-animated tick checkbox options | `npx shadcn@latest add "https://21st.dev/r/edwinvakayil/checkbox-group"` |
| **Cursor Trail** | `grootstudio` | `18360` | Spawns & animates images/petals along mouse path | `npx shadcn@latest add "https://21st.dev/r/grootstudio/cursor-trail"` |
| **Digit Stream** | `tkachukkateryna14` | `24182` | Dark kinetic numbers flowing along path on scroll | `npx shadcn@latest add "https://21st.dev/r/tkachukkateryna14/digit-stream"` |
| **Chapter Scrubber** | `ruixen.ui` | `19825` | Magnifying vertical rail dock for task progress | `npx shadcn@latest add "https://21st.dev/r/ruixen.ui/chapter-scrubber"` |
