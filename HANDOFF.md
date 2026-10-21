# HANDOFF: how to recreate (or continue) this game

This document describes **Miesten illanvietto** precisely enough that another AI (or developer) can rebuild the same game from scratch, or continue development without guessing. It is written in English because everything that lives in this repository is English.

If you only need to *continue* work: read sections 1-4, 9 and 10. If you need to *recreate* from zero: read everything and follow section 11.

---

## 1. What the product is

A single-file browser game (`index.html`, no external dependencies, no audio/image files) about one long, silly evening with three adult male friends: **Rauno, Tuomas and Antti**. It is a private joke game for the three of them, not for publishing. It must work:

- in a desktop browser (keyboard), and
- on a phone in **landscape** orientation (touch buttons on screen), hosted on GitHub Pages (`https://anttiraisala.github.io/miesten-illanvietto/`).

Tone: honest, silly, absurd, with a warm, playful male-friendship ("brotherly love") theme, especially in the sauna. Pixel art, 8-bit chiptune music and sound effects.

### Original requirements (from the owner, translated)

1. Browser game about an evening of three adult men: Rauno, Tuomas, Antti. They meet in the daytime, maybe drive an RC car and a drone, then sauna, cook, play poker, drink beer. Then maybe go to a restaurant, drink beer and play poker there. Then go home late at night.
2. The whole thing is a story made of episodes; minigames inside the episodes.
3. Every episode starts with a **text card** saying what is happening.
4. When the game ends there are **end credits** with (fake) photos of the evening. The photo is on the left while text scrolls on the right; then the photo hops to the right and the text scrolls on the left, and so on. The text tells a story of what the characters did that evening and reflects what actually happened in the playthrough.
5. Pixel art characters based on photos of the real guys.
6. Character facts: all three have a **beard and glasses**. Antti: long hair (ponytail indoors), cap outdoors, chubby, thin metal glasses, grey goatee. Tuomas: wide-brimmed black hat, big glasses with a greenish lower rim, full reddish-brown beard, black t-shirt with small white "SOUTH EXPLORER" text. Rauno: tweed flat cap outdoors, messy hair indoors, thick brown glasses, short beard, black t-shirt with a golden Aztec-style print, neon green lanyard.
7. Roles: **Tuomas** owns the RC car and the drone. **Antti** cooks. **Rauno** is the technology guy who speaks precisely and eloquently. Poker styles: **Tuomas loose-aggressive, Antti tight-aggressive, Rauno loose-passive**.
8. The game *suggests* which character to play each episode, but the player can switch character at any time.
9. Poker is a lightweight version. Sound effects plus 8-bit music.
10. Playable on a phone in landscape. All in one HTML file. README links to the playable page.
11. Everything committed to the `master` branch (no `main`).
12. Code, comments, docs, commit messages and file names are **English**. The on-screen text and all character dialogue are **Finnish** (the owner explicitly asked for this in v1.1). Name inflections use `nf(char, case)` and the tokens `{P:all}`, `{T:gen}` etc. in cutscene text (see section on dialogue).

---

## 2. Tech stack and constraints

- Plain HTML5 canvas + vanilla JavaScript (ES2017 features, no modules, no frameworks, no build dependencies besides Python 3 for concatenation).
- Internal resolution **480 x 270**, scaled by CSS (`image-rendering: pixelated`) to fit the window. Integer scale when >= 2x, otherwise fractional.
- Audio: Web Audio API only (oscillators + noise). No samples.
- Sprites: drawn procedurally into offscreen canvases at load/first use (no image files).
- Text: system monospace (`bold Npx "Courier New", monospace`), outlined with a 1px black shadow. No bitmap font.
- Browser storage: only `localStorage` for the mute flag, always wrapped in try/catch.
- The shipped `index.html` is generated: `python3 tools/build.py` concatenates `src/template.html` and `src/js/*.js` (alphabetical order = load order). **Never edit `index.html` by hand; edit `src/` and rebuild, then commit both.**

---

## 3. Repository layout

```
README.md                    player-facing intro + link to the game
MILESTONES.md                the plan (milestones M0-M10)
PROGRESS.md                  live status log (update after every milestone)
HANDOFF.md                   this file
index.html                   GENERATED single-file game (GitHub Pages serves it)
src/template.html            HTML shell, CSS, touch button markup, __JS__ placeholder
src/js/00-core.js            canvas, input, game state G, log/snapshots, toast, scene manager
src/js/10-audio.js           Snd (SFX + mixer) and Music (chiptune sequencer, TRACKS)
src/js/20-sprites.js         Sprites: procedural pixel-art characters
src/js/30-ui.js              text/panel/bar helpers, HUD, drunk wobble
src/js/35-backgrounds.js     BG: background painters + FLOOR table
src/js/40-cutscene.js        TitleScene, Card (episode card), Cutscene (dialogue engine)
src/js/50-minigames-a.js     SKILL, ShopScene, RCScene, DroneScene
src/js/55-minigames-b.js     TimingScene (generic), EnduranceScene, HugScene, CookScene
src/js/60-poker.js           evaluator, AI, drawing, PokerScene
src/js/70-story.js           EP/EP_START: all episodes wired together with dialogue
src/js/80-credits.js         CreditsScene (polaroid slides), generated "photos"
src/js/99-main.js            main loop + window.__dbg debug hooks and test bots
assets/characters/*.png      reference sprite sheet (bust, 32x46) rendered by the Python tool
tools/generate_sprites.py    Python version of the bust sprites (design reference)
tools/build.py               builds index.html
tests/*.js                   Playwright headless tests (see section 9)
```

Real reference photos of the guys are intentionally **not** in the repo (public repo, privacy).

---

## 4. Architecture

### 4.1 Scenes
A scene is a plain object: `{ music?, hud?, noSwitch?, dpad?(), bot?(), enter(data), update(dt), draw(ctx), onSwitch?() }`. `Scenes.go(scene)` fades out (0.22 s), swaps, fades in. Inputs are ignored during fades. `music` (string key of `TRACKS`, or `null` to stop) is applied on swap; `undefined` keeps the current music. Scene factories (`ShopScene(opts)`, `Cutscene(opts)` ...) return fresh objects; chaining is done with `done`/`onEnd` callbacks that call `go(nextScene)`.

### 4.2 Global state `G` (reset by `newGame(startChar)`)
`player` ('rauno'|'tuomas'|'antti'), `mood` 0-100, `hunger` 0-100 (lower = fuller), `bac{}` per character 0..1 (0.07 per beer), `beers{}`, `shop{}` (items bought), `flags{}` (story flags: noBeer, noSausage, herring, droneTree, droneCrash, saunaWinner, burnt, cookPct, pokerWinner_home, pokerWinner_restaurant, target, ...), `log[]` (`{id, credit}` for credits), `snaps[]` (`{id, canvas 240x135, caption}`), `chips{}` poker chips (start 100), `pokerWins{}`, `stats{}`.

### 4.3 Event log and snapshots
`logEvent(id, creditText, takeSnapshot)` pushes a credit line; if the 3rd arg is true it also copies the current canvas into a 240x135 snapshot (`Snap.take`). The credits scene reads these. **Every notable moment must call `logEvent`.**

### 4.4 Input
Logical keys: `up down left right a b sw mute`. Keyboard: arrows/WASD, Space/Enter/Z = a, X/Esc = b, C/Tab = sw (switch character), M = mute. Touch: on-screen buttons with `data-k` attributes (pointer events) and tapping the canvas = `a`. `Input.pressed` holds edge-triggered presses for the current frame (cleared each frame); `Input.down` holds held state. The D-pad is hidden when the scene's `dpad()` returns false (cutscenes without a choice, credits).

### 4.5 Character switching
Pressing `sw` anywhere (unless `scene.noSwitch`) cycles `G.player`. Episode cards show a "Suggested hero" choice if the current player differs. Poker locks switching during a hand (`noSwitch = true`) and re-allows it between hands. Skills per character (`SKILL` in `50-minigames-a.js`): RC and drone: Tuomas 1.2; Rauno drone 1.1; cooking: Antti 1.35 (wider golden window and slower burn).

### 4.6 Drunkenness
`drinkBeer(who)` adds 0.07 BAC. When `G.bac[c] > 0.35` that character is drawn with the `drunk` expression; the scene calls `applyWobble(bac*k, t)` (row-shift wobble) before drawing UI. HUD shows BEER bar for the current player.

### 4.7 Dialogue engine (`Cutscene`)
`Cutscene({bg, fg?, floor, cast:[{c,x,v,flip?,y?,walk?,expr?}], steps, music, bust?, noMarker?, onEnd})`. Step kinds:
- `{who, text}` speech with portrait; `{narr:true, text}` narrator line (use `say(who,text)` / `nar(text)` helpers in `70-story.js`);
- `{choice:[...]|()=>[...], text, on:(index, scene)=>steps?}` menu, up/down + A; `on` may return extra steps to splice in;
- `{fn:(scene)=>steps?}` run code, optionally returning steps to inject; `{wait:seconds}`.
Text tokens `{P}` (current player name), `{O1}`/`{O2}` (the other two), `{T}` (target stored in `G.flags.target`). Typewriter at 55 chars/s with a tiny voice blip; A completes the line, then advances. A yellow ▼ marks `G.player` above the cast.

**Layout rule (learned the hard way):** the dialogue box occupies y = 196..262, so every character must stand with feet at y <= ~196 (`BG.FLOOR` values are 190-196). Choice menus use a taller box (y = 130..262) and cover the cast, which is fine.

---

## 5. Visual specification

### Canvas and UI
480x270. Panels: 2px cream border (`#f2e6c9`), 1px black, fill `#141a33`. HUD top-left: three 50px bars (MOOD pink `#ff7aa8`, FOOD yellow `#ffd166` = 1 - hunger, BEER amber `#f2a02e`); top-right badge with current character head + name + "C: vaihda" (Finnish UI labels: FIILIS / MAHA / KALJA). Character colors: Rauno `#8fe36a`, Tuomas `#f2a65a`, Antti `#9ec5ff`.

### Sprites (`20-sprites.js`, 32x62 px, feet at bottom)
Built from rectangles in a `make(name, variant, expr, pose)` function; cached per key. Variants: `out` (headwear), `in`, `sauna` (bare head + towel). Expressions: `normal`, `drunk` (heavy lids + red cheeks), `hot` (red tint + sweat). Poses: `idle`, `walk0`, `walk1` (one leg shortened). Torso half-widths: Rauno 9, Tuomas 11, Antti 13 (makes Antti the widest). Key colors:

| Part | Rauno | Tuomas | Antti |
|---|---|---|---|
| Skin | `#e8b996` (shade `#c98f6e`) | same | same |
| Beard | `#6e4b30` brown, chin `#b9b2a6` grey | `#7a4528` reddish brown, chin `#6b3c22` | `#3a2c24` dark, chin goatee `#9d9b95` grey |
| Glasses | thick `#8a4a24` brown frames | black top, lower rim `#8fb08a` greenish, lens `#f2cdb0` | thin `#b9bcc6` metal |
| Headwear | flat cap `#8a3d1e` with orange/cream flecks, `#5e2813` brim; indoors messy hair `#6b4a2c` | wide-brim hat `#15151b`; sauna: short hair `#6b4026` | cap `#15151b`; hair `#2b2018` long (outdoors/sauna) or ponytail (indoors) |
| Shirt | black `#15151b`, gold print `#b8842e`/`#e0b252`, lanyard `#7cf04a` | black with white chest text bar `#cfd2d6` | plain black |

`tools/generate_sprites.py` is the original Python drawing of the busts and the best reference for exact pixel coordinates; `20-sprites.js` is a direct port with full body legs added (jeans `#2c3352`, shoes `#2a2420`).

### Backgrounds (`35-backgrounds.js`)
Painter functions drawn with `rect/circle` only: `lot, shop, yard, sauna, porch, kitchen, living, street, restaurant, car`, each with a floor Y in `BG.FLOOR`. Sky gradients come from `TOD` (day/eve/night) with stars/moon/clouds. The pub has a flickering "P U B" neon sign.

---

## 6. Game flow (what happens, in order)

Title (pick hero with left/right, A) -> `newGame(hero)` -> for each episode: **Card** -> **Cutscene(s)** -> **minigame(s)** -> **Cutscene** -> next Card. Episode cards show episode number, title, a clock time, and a 1-2 sentence description (typewriter) plus the "Suggested hero" choice.

| Ep | Time | Title | Scenes | Effects |
|---|---|---|---|---|
| 1 | 14:00 | Meeting Up | Cutscene (parking lot banter + 3-way choice) -> **ShopScene** | Shop: budget 26 EUR, 7 items; no beer = mood -10 + flag `noBeer`; no sausage = flag `noSausage` (cooking uses 3 emergency noodle blocks); herring = flag for a 50/50 mood +-4 gag at dinner; chips +3 mood |
| 2 | 15:30 | Toys for Grown-ups | Cutscene -> **RCScene** -> Cutscene (rating comment) -> Cutscene -> **DroneScene** -> Cutscene (landed / tree / crash variants) | RC: top-down course, 6 gates, 10 cones (+1 s each), 3 boxes (+0.4 s); ratings S/A/B/C at <16/<21/<29 s (incl. penalties); drone: 5 rings, 7 trees, wind gusts, 60 s battery, land on pad |
| 3 | 17:30 | Löyly | Cutscene -> **TimingScene** steam (5 rounds) -> Cutscene -> **EnduranceScene** -> Cutscene (2 compliment rounds) -> **HugScene** -> porch Cutscene | Steam: hit +3 mood, too hot -2. Endurance: mash A, AI decay randomised; winner logged. Compliments: match trait to target for +6. Hug: mash A to 100 in 9 s: +9 mood else +2. Porch: everyone drinks a beer |
| 4 | 19:30 | The Kitchen | Cutscene -> **CookScene** (onion chopping if onions bought, then fry) -> dinner Cutscene | 5 sausages (or 3 noodle blocks); golden window [0.62, 0.95] (Antti [0.55, 1.02]); burns at 1.12 (Antti 1.2); score 2/1/0 per item; hunger and mood updated |
| 5 | 21:30 | Poker Night | Cutscene -> **PokerScene** (6 hands, home) -> Cutscene | Beer every 2nd hand; winner logged |
| 6 | 23:30 | To the Restaurant | street Cutscene with one random event (seagull / cat / kebab; 3 choices each) -> pub Cutscene -> **TimingScene** "Cheers" (3 rounds, +1 beer each) -> Cutscene -> **PokerScene** (4 hands, pub) -> Cutscene | Beer every hand at the pub |
| 7 | 02:00 | The Way Home | street Cutscene (lamp post gag if anyone is very drunk) -> taxi Cutscene | |
| 8 | 10:30 | Next Morning | Card with hangover text based on average BAC | -> **CreditsScene** |

Credits: slide 0 poster, then up to 9 snapshot slides (unique event ids, evenly sampled), then "THE NUMBERS" slide (evening rating from mood: >=85 legendary, >=65 great, >=45 solid, else awkward; beers; poker champions; sauna winner; burnt dinners; drone status), then "THE END" (A = play again). Slide `i` has the polaroid on the left when `i` is even, on the right when odd; the photo hops in (ease-out cubic + hop), the previous photo flies out; text scrolls up at 34 px/s on the opposite side. A skips a slide. Headings come from `CREDIT_HEAD`, captions from `CAPTION`, extra silly credit lines from `CREDIT_EXTRA`.

---

## 7. Minigame details worth copying exactly

- **TimingScene(cfg)**: ping-pong marker (speed 1.2-1.35, +12% per round), green zone width 0.18-0.22 at a random position; A grades `hit` / `low` / `high` and shows a result string; `cfg.onGrade`, `cfg.done(grades)`, `cfg.extra` for particles. Used for steam and cheers.
- **Endurance**: composure 100 each; decays `base * (1 + t/18)` per second (player base 9, AIs random 1.6-2.9, plus slight sine jitter); each A tap +7 for the player; time runs 3x once the player is out; last one standing wins.
- **RC car**: heading + speed model: gas 150/s (x skill), brake 220/s, friction `0.35^dt`, max 135 x skill, steer 3.0 rad/s scaled by speed. Cones fly when hit.
- **Drone**: acceleration 230 (x skill), drag `0.28^dt`, wind gusts of +-60 px/s^2 for 2-4 s, tree collision radius 12, ring radius 14, landing needs speed < 45 within 22 px of the pad.
- **Cook**: per-item cook rate random 0.10-0.16/s; left/right cursor, A removes.

### Poker (`60-poker.js`)
3 players, 100 chips each (refilled to 30 if under 10), ante 5. Flow per hand: deal 2 hole cards -> flop (3) -> betting -> turn+river (2) -> betting -> showdown. Bets: 10 on the flop round, 20 on the last; at most 2 raises per round; all-in simplified (no side pots). Evaluator: best 5 of 7, categories 0-8, lexicographic compare (wheel straight supported). AI strength: `handStrength()` (category base values, bonus for pair rank, draws, noise) fed to `aiDecide(who, s, toCall, canRaise)`:
- **Tuomas (loose-aggressive):** 30% bluff chance, raises with strength > 0.3 unfacing a bet or > 0.55 facing one, calls wide.
- **Antti (tight-aggressive):** raises > 0.6 (unfaced) / > 0.72, calls > 0.46, otherwise folds.
- **Rauno (loose-passive):** almost never raises (> 0.9), calls whenever strength > 0.18 or 50% of the time.
Seats are re-laid out when the player switches character between hands. Quips per personality appear in speech bubbles.

---

## 8. Audio

`TRACKS` in `10-audio.js`: `title, day, sauna, kitchen, poker, restaurant, night, credits`, each `{bpm, wave, lead, bass, perc}` where lead/bass are token strings (one token = one eighth note; note names like `C5`, `Bb4`; `-` rest; `_` hold; `|` ignored) and perc is a string (`k` kick, `s` snare, `h` hat, `.` none). A scheduler (`setInterval` 40 ms, 0.2 s lookahead) plays them in a loop. SFX are synthesized per name in `Snd.sfx(name)` (select, confirm, back, bad, good, coin, switch, crash, cone, bump, checkpoint, finish, ring, sizzle, steam, card, chip, clink, love, burn, win, lose, tick, whoosh, hot). Audio is unlocked on the first key/touch (`Snd.unlock`), required by mobile browsers. M or the ÄÄNI (sound) button mutes (persisted).

---

## 9. Build, run, test

```
python3 tools/build.py                       # regenerate index.html
python3 -m http.server                       # or just open index.html
export NODE_PATH=$(npm root -g)              # Playwright must be resolvable
node tests/unit.js                           # poker evaluator + AI personality checks
node tests/playthrough.js /tmp/shots         # bot plays title -> credits, captures screenshots
node tests/shots.js /tmp/shots 1,2,3         # screenshots of chosen episode cutscenes
node tests/mobile.js /tmp/mobile             # phone landscape/portrait emulation
```
Debug hooks (console): `__dbg.go('ep', 4)` jump to an episode, `__dbg.go('card', 3)`, `__dbg.go('credits')`; `__dbg.dbg.auto = true` plus `__dbg.dbg.speed = 3` runs the bots. Minigame scenes expose a `bot()` method used only by `auto` mode.

Definition of done for any change: build passes, `tests/unit.js` passes, `tests/playthrough.js` reaches `credits` with no errors, and screenshots look right (no UI overlapping characters, text fits).

---

## 10. Known limitations and ideas

- Not yet verified on real phones (only Chromium emulation). iOS audio unlock, fonts and safe-area insets should be checked.
- Sprites are procedural and hand-coded; more poses (sitting, laughing) and a drunk walk would help. Real-photo likeness was done by reading photos, not by image conversion.
- All visible text and dialogue is Finnish, written inline in the source (no string table). Names are inflected with `FI`/`nf()` in `00-core.js`; `subst()` in `40-cutscene.js` accepts `{P}`, `{O1}`, `{O2}`, `{T}` optionally followed by `:nom|gen|all|par|ine|ela|ill|ade`. Keep wording short: the dialogue box wraps at about 62 chars per line and choice options must fit one line.
- Ideas: more minigames (beer pong, karaoke, kebab stand), save/continue, a "photo mode" bonus ending with the real group photo, volume slider, more random events per episode.

---

## 11. Recreating from scratch: recommended order

1. `00-core.js`, `template.html`, `99-main.js`: canvas fit, input (keyboard + touch buttons), scene manager with fades. Verify a blank scene on desktop and phone emulation.
2. `10-audio.js`: `Snd`, `Music`, a couple of tracks. Verify no console errors and that audio starts after the first tap.
3. `20-sprites.js`: three characters x variants. Verify with a contact sheet screenshot.
4. `30-ui.js`, `35-backgrounds.js`: helpers and backgrounds.
5. `40-cutscene.js`: title, card, dialogue engine. Verify the dialogue box never covers the characters.
6. Episodes in order, each with its minigame, committing after each: shop + RC + drone, sauna (timing, endurance, compliments, hug), cooking, poker, pub (cheers + poker), night + morning.
7. `80-credits.js` last, because it needs the event log and snapshots from earlier scenes.
8. Add bots (`bot()`), `tests/*`, and run the full playthrough. Fix layout issues from screenshots.
9. Update README, MILESTONES, PROGRESS; build; commit; push to `master`.

### Prompt that reproduces this project (for another AI)

> Build a single-file browser game (HTML5 canvas, vanilla JS, no assets, 480x270 pixel art scaled to fit, landscape phone support with on-screen buttons) called "Miesten illanvietto". Three bearded, bespectacled friends (Rauno, Tuomas, Antti; looks and roles in HANDOFF.md section 1 and 5) spend an evening together: meeting and shopping, RC car and drone (Tuomas), sauna (steam timing, endurance, compliments, group hug), cooking (Antti), lightweight poker at home (Tuomas loose-aggressive, Antti tight-aggressive, Rauno loose-passive), a pub with a second poker round, the way home, a morning card, then end credits with polaroid snapshots alternating left/right while text scrolls on the other side, generated from an event log. Each episode starts with a text card; the player may switch character any time. Use Web Audio for 8-bit music and SFX. Keep code and comments in English, but write all on-screen text and dialogue in Finnish. Source in `src/`, built to `index.html` with `tools/build.py`; commit to the `master` branch after every milestone and keep PROGRESS.md updated.
