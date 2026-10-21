# Progress

Live status of the build. Updated after every milestone. See `MILESTONES.md` for the plan and `HANDOFF.md` for the full technical description.

**Current status: v1.1 is on `master`: the complete game with all on-screen text and dialogue in Finnish.** All seven episodes, the morning epilogue and the credits work from the title screen to the end. Verified with automated bot playthroughs in headless Chromium and phone-landscape emulation; not yet verified on a real phone.

## Milestone status

| Milestone | Status | Notes |
|---|---|---|
| M0 Foundation | done | Repo, README, milestone guide, first sprites |
| M1 Engine skeleton | done | 480x270 canvas, scaling, keyboard + touch input, scene manager with fades, rotate-phone overlay, mute |
| M2 Characters and title | done | Procedural full-body sprites with variants (outdoor/indoor/sauna), expressions, walk poses; title with hero picker |
| M3 Cards, meters, log | done | Episode cards with suggested hero, dialogue engine, mood/food/beer HUD, event log + snapshots |
| M4 Episodes 1-2 | done | Parking-lot banter, shop (7 items, budget), RC car course, drone flight |
| M5 Episodes 3-4 | done | Steam timing, endurance contest, compliments, hug, porch beers, cooking (onions + frying) |
| M6 Episode 5 | done | Lightweight poker with three AI personalities (unit-tested) |
| M7 Episodes 6-7 | done | Street event, pub cheers, pub poker, drunk wobble, taxi ride, morning card |
| M8 Credits | done | Polaroid snapshots alternate sides, text scrolls on the other side, generated from the log |
| M9 Audio | done | 8 chiptune tracks + 25 sound effects, all synthesized |
| M10 Polish and phone testing | partly | Emulated phone landscape/portrait checked; real-device testing still to do |

## Log

- **v1.1**: Finnish localization of all visible text and dialogue (story, cards, HUD, shop, minigames, poker, credits, touch buttons, rotate overlay, `lang="fi"`). Names are inflected via `nf()`/`{P:all}` tokens. Poker AI labels shortened to fit. Unit tests and a bot playthrough to the credits pass; screenshots checked for text fit.
- **v1.0 (this version)**: complete playable game, headless bot playthrough reaches credits without errors.
  - Fixed during testing: dialogue box covered the characters (floors raised to y=190-196); poker AI cards overlapped the board (seats moved to the edges); HUD badge overlapped poker seat (poker draws its own mini HUD); touch D-pad covered the dialogue (hidden when unneeded; SWITCH/SOUND moved under the HUD badge); credits captions were truncated (short caption table); RC rating thresholds were too lenient (bot finishes in ~11 s, humans should take 15-30 s).
- **v0.2**: sprites, UI, dialogue, minigames drafted.
- **v0.1**: repo, README, placeholder page, milestone guide, first character sketches.

## How to verify quickly

```
python3 tools/build.py
export NODE_PATH=$(npm root -g)
node tests/unit.js
node tests/playthrough.js /tmp/shots
```
or open `index.html` and play: Title -> A.

## To do next (owner decides)

1. **Owner action:** in GitHub settings set the default branch to `master` and enable Pages (Settings -> Pages -> Deploy from a branch -> `master` / root). The README "Play the game" link works only after that.
2. Play it on real phones (Android + iPhone), note what is awkward: control sizes, text size, audio unlock, difficulty of the minigames.
3. Tune difficulty (RC ratings, endurance, steam speed, cooking window) after real playtests.
4. Content pass: more dialogue, more random events, inside jokes only the three friends know (names of real places, nicknames).
5. Art pass: more expressions/poses, better car interior and restaurant, optional pixel versions of real group photo for a bonus ending.
6. Optional: save/continue.
