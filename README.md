# ☕ CYBERBREW — The Full Café Ritual, Right at Your Desk

> An immersive, art-directed digital café ambience website , crafted with intimate analog warmth, procedural Web Audio acoustic synthesis, rain simulations, a Pomodoro focus timer, and an analog café receipt generator.

![Cyberbrew Preview](https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80)

---

## 📌 1. The Idea & Purpose

### Brand & Concept
- **Brand Name**: `cyberbrew`
- **Tagline**: *The full cafe ritual, right at your desk.*
- **Concept**: A warm, analog café existing inside a quiet digital world. It recreates the sensation of sitting in an independent café on a rainy evening: warm pendant lighting, coffee brewing, rain trickling down the glass, a notebook on a dark walnut table, distant city lights, quiet lo-fi chords, and absolutely nowhere you need to rush to.

### Core Purpose
- Provide a soothing, distraction-free environment for deep work, study, reading, writing, or relaxation.
- Deliver an organic, multi-layered acoustic soundscape where users can mix 8 individual sound layers to craft their personal café atmosphere.
- Integrate an unobtrusive, drift-free Pomodoro focus timer and reflective mindful notes.
- Bridge independent café culture, nostalgic internet aesthetics, and modern web craft without looking like an AI-generated template.

### Target Audience
- **Students & Researchers**: Need sustained focus with ambient white/pink noise (rain, chatter, coffee machine) that masks distracting room noise.
- **Remote Workers & Programmers**: Craving the social warmth and presence of a café without leaving their desk.
- **Writers & Creatives**: Looking for atmospheric inspiration, calming lo-fi chords, and a peaceful headspace.
- **Night Owls**: Seeking an intimate, nocturnal haven ("After Hours") with vinyl crackle and amber glow.

---

## 🎨 2. Art Direction & Design

### Restrained Color Palette
- **Espresso Brown**: `#30221E` (foundational dark warmth)
- **Deep Coffee**: `#49352D` (panel surfaces & subtle shadows)
- **Warm Cream**: `#F3EBDD` (editorial typography & soft highlights)
- **Muted Caramel**: `#BD956A` (secondary accents & tactile labels)
- **Dusty Rose**: `#C49A91` (gentle bookmarks & delicate notes)
- **Rainy Blue-Grey**: `#788A91` (cool exterior daylight & distant skies)
- **Soft Amber**: `#E5A869` (pendant lamp lighting glow & active indicators)
- **Deepest Shadow**: `#16110F` (rich background depth)

### Typography
- **Headlines & Editorial Quotes**: `Cormorant Garamond` (refined serif with italic warmth)
- **UI & Controls**: `Plus Jakarta Sans` (crisp, modern, human-centric sans-serif)
- **Receipt & Local Clock**: `JetBrains Mono` (authentic monospaced details)

### Visual Layers & Atmosphere
1. **Background**: Dynamic sky changing across *Morning*, *Golden Hour*, *Evening*, and *Midnight*, with subtle bokeh citylights.
2. **Weather Layer**: Interactive `<canvas>` rendering organic raindrops that slide, coalesce, and leave thin condensation trails down the glass (or drifting snow / sunlit dust motes).
3. **Foreground Table**: Dark walnut wood surface with subtle grain, an open handwritten leather notebook, brass teaspoon, coffee beans, and a ceramic cup with delicate rising steam wisps.
4. **Cinematic Analog Film Grain**: Lightweight SVG noise filter overlay that eliminates plastic digital flatness and imparts authentic analog warmth.

---

## ⚡ 3. Key Interactive Features & Functionality

### 🎚️ 1. Procedural Web Audio Sound Mixer (8 Ambient Tracks)
Unlike traditional websites relying on external MP3 URLs that can break, stutter, or fail CORS, Cyberbrew uses a custom procedural synthesis engine built on the native **Web Audio API**:
- **Rain on Glass**: Filtered pink/brown noise with randomized glass tap impulses.
- **Espresso & Cups**: Steam wand sweeps, extraction hiss, and resonant ceramic clinks.
- **Quiet Café Chatter**: Multi-voice formant-filtered noise mimicking conversational murmurs.
- **Vinyl Crackle**: Needle friction, Dirac dust pops, and subtle surface grain.
- **Soft Lo-Fi Chords**: Generative electric piano (Rhodes) playing warm 7th/9th chord progressions.
- **Fireplace Hearth**: Subdued low rumble and spontaneous wood crackles.
- **Distant City Traffic**: Sub-160Hz rain-slicked asphalt tire hum.
- **Night Wind**: Resonant bandpass filter modulated by a slow LFO breeze.
- **Master Controls**: Smooth volume slider, 1-click Mute/Unmute, and individual level controls.

### ☕ 2. Curated Editorial Café Presets
- **The Window Seat**: *Rainy, intimate, and peaceful.* (Rain 65%, Espresso 35%, Lo-Fi 50%, Vinyl 40%)
- **After Hours**: *For thoughts that only arrive after midnight.* (Vinyl 65%, Lo-Fi 55%, Wind 40%, Fireplace 25%)
- **Sunday Morning**: *No rush. No plans. Just one more cup.* (Espresso 60%, Chatter 45%, Lo-Fi 50%)
- **The Study Table**: *Get comfortable. Let the rest of the world wait.* (Rain 50%, Lo-Fi 60%, Vinyl 30%)
- **Somewhere in Paris**: *A little daydream, somewhere across the world.* (Lo-Fi 55%, Chatter 45%, Traffic 30%)

### ⏱️ 3. Mindful Pomodoro Focus Timer
- 25m Focus, 5m Short Break, and 15m Long Break intervals.
- Circular SVG progress ring with animated countdown.
- **Zero-drift accurate time tracking**: Uses `Date.now()` delta calculation, ensuring the countdown stays perfectly accurate even when the tab is backgrounded.
- Soft ceramic chime audio on completion and persistent session counter.

### 🧾 4. The Digital Café Receipt
- Generates an authentic printed paper receipt showing the active mood preset, weather, lighting, time spent at desk, focus sessions completed, live timestamp, and barista quote.

### 📖 5. Mindful Notebook & Intentions
- An open notebook on the table with curated quotes. Click **"turn page ↻"** to cycle through gentle reminders.
- Includes a dedicated text field for users to write their intention for the session, saved automatically to `localStorage`.

### 🪟 6. Zen Mode (Hide UI)
- Press `H` or click the eye icon to smoothly hide all toolbars, text, and panels, leaving only the rain, ambient window, coffee cup, and soundscape.

### ⌨️ 7. Keyboard Shortcuts
- `Space`: Master Play / Pause audio
- `M`: Mute / Unmute audio
- `H`: Toggle Zen Mode (hide/show interface)
- `F`: Open Focus Timer panel
- `Esc`: Close open drawers

---

## 🛠️ 4. Technology Stack

- **Markup**: Semantic HTML5 (W3C standard, ARIA dialog and region attributes)
- **Styling**: Modern CSS3 (CSS Custom Properties, Flexbox, CSS Grid, Media Queries, backdrop-filter blur)
- **Graphics**: Dual HTML5 `<canvas>` (Procedural Rain Simulation & Rising Steam Wisps) + SVG noise filter
- **Audio Engine**: Pure Vanilla JavaScript Web Audio API (`AudioContext`, `BiquadFilterNode`, `GainNode`, `BufferSource`)
- **Typography**: Google Fonts (`Cormorant Garamond`, `Plus Jakarta Sans`, `JetBrains Mono`)
- **Storage**: `localStorage` (Persists custom atmosphere, intentions, and focus stats)

---

## 📱 5. Responsiveness

- **Desktop (1024px+)**: Wide cinematic desk composition with sliding side panels and dual-page leather journal.
- **Tablet (768px - 1023px)**: Fluid scaling, bottom-sheet sliding drawers, and touch-friendly sliders.
- **Mobile (320px - 767px)**: Portrait café desk layout, single-page mindful notebook, gesture-friendly controls, and zero horizontal overflow.

---

## 🚀 6. Local Setup & Running Instructions

Cyberbrew is a pure frontend project with zero build steps or package installations required!

### Option 1: Direct Browser Launch
1. Clone or download this repository.
2. Locate `index.html` in your file manager.
3. Double-click `index.html` (or right-click → **Open with** → Chrome / Edge / Firefox / Safari).

### Option 2: Local HTTP Server (Recommended)
```bash
# Using Node's npx serve
npx serve .

# Or using Python's built-in server
python -m http.server 8080
```
Open `http://localhost:8080` in your web browser.

---

## 🌐 7. Deployment Guide

### Deploying to GitHub Pages (1-Click)
1. Push this repository to your GitHub account (e.g. `https://github.com/erinbreaks/cyberbrew`).
2. Go to **Settings** → **Pages** on your GitHub repository.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**.
5. Your live site will be ready at:
   ```
   https://erinbreaks.github.io/cyberbrew/
   ```

### Deploying to Vercel
1. Go to [vercel.com](https://vercel.com) and import your `cyberbrew` GitHub repository.
2. Keep the Framework Preset as **Other** (Static Site).
3. Click **Deploy**. Your live URL will be ready in seconds.

---

## 📤 8. Mission 2 Submission Summary

| Requirement | Submission Detail |
|---|---|
| **Project Title** | Cyberbrew — The full cafe ritual, right at your desk |
| **Topic** | Digital Café Ambience & Focus Soundscape (imissmycafe.com concept) |
| **Frontend Stack** | HTML5, CSS3, Vanilla JavaScript, Web Audio API, Canvas |
| **GitHub Repository** | `https://github.com/erinbreaks/cyberbrew` |
| **Live Website Link** | `https://erinbreaks.github.io/cyberbrew/` |

---

## 📄 License
Open source under the [MIT License](https://opensource.org/licenses/MIT). Built with care for Web Development Mission 2.
