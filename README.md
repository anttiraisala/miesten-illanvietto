# Miesten illanvietto (Men's Night Out)

A single-file browser game about one long, absurd evening with three friends: **Rauno**, **Tuomas** and **Antti**.

## ▶ [Play the game](https://anttiraisala.github.io/miesten-illanvietto/)

The whole game lives in one HTML file ([`index.html`](index.html)), so there is nothing to install. Open the link above in any modern browser.

**On a phone:** play in **landscape** (hold the phone sideways). The game is designed for touch controls and a landscape screen.

> Status: **v1.0, first complete playable version.** See [PROGRESS.md](PROGRESS.md) for the status log and [MILESTONES.md](MILESTONES.md) for the plan.

## Controls

| | Keyboard | Phone (landscape) |
|---|---|---|
| Move / menu | Arrow keys or WASD | On-screen D-pad (shown only when needed) |
| Confirm / advance / action | Space, Enter or Z | **A** button, or tap anywhere on the screen |
| Switch character | C or Tab | **SWITCH** button |
| Mute | M | **SOUND** button |

Every episode suggests which of the three guys to play, but you can switch at any time. Poker lets you switch between hands.

## What the game is about

One day and one night, told as a series of episodes. Each episode starts with a title card (like an old TV series) that sets the scene in a couple of dramatic sentences, followed by a minigame or an interactive scene. The tone is honest, silly and absurd, with a warm, playful brotherly-love theme running through it (especially in the sauna).

Hidden meters run through the whole game and affect later episodes:

- **Mood**: goes up when everyone is having fun, down if someone is left out.
- **Blood alcohol**: rises with every beer and affects the minigames (wobbly controls, blurry text, worse decisions).
- **Hunger**: matters for the cooking episode and for how the evening ends.

The game quietly keeps a log of what happens (who won at poker, who burned the sausages, whether the drone ended up in a tree, how many beers each guy drank). The end credits are built from this log, so every playthrough ends a little differently.

## Episodes

1. **Meeting up (daytime)**: the guys meet, chat, and pick what to buy from the store (beer, sausages, snacks). The shopping list affects later episodes.
2. **RC car and drone**: Tuomas shows off his toys. An obstacle course for the radio-controlled car, then a drone flight. A crash into a tree is practically guaranteed.
3. **Sauna**: calm and warm. Throw steam at the right moment (too little is boring, too much drives everyone out), pick the right compliment for the right moment, and survive a löyly endurance contest. Ends with an awkward, heartfelt hug.
4. **Cooking**: Antti's time to shine. A timed kitchen minigame: fry the sausages, chop the onions, burn nothing.
5. **Poker at home**: a real, simplified poker game played for sticks and honor. Each friend has a recognizable playing style, so the player learns to read them.
6. **To the restaurant**: a short walk or taxi ride with something unexpected on the way. At the restaurant: more beer, more poker, and a looser mood as the blood alcohol meter climbs.
7. **Night and the way home**: the finale, with a tally of the whole evening and a short "next morning" epilogue.

## End credits

The credits roll like a movie: a photo-style picture alternates between the left and right side of the screen while text scrolls on the opposite side. The pictures are in-game "snapshots" of key moments (a polaroid-style frame around a screenshot of the drone crash, the winning poker hand, and so on), and the text tells the story of what the three friends did that evening, based on how the playthrough actually went.

## Characters

All three are adult men with beards and glasses, drawn as pixel art. Each one has a personality and a poker style.

| | Look | Role in the evening | Poker style |
|---|---|---|---|
| **Rauno** | Short, mixed brown and gray beard, thick brown rectangular glasses, tweed flat cap outdoors and messy upright hair indoors, black t-shirt with a golden Aztec-style print, neon green lanyard | The tech guru. Knows a lot about technology and speaks precisely and eloquently ("We are witnessing a classic case where angular velocity exceeds the pilot's reaction time.") | Loose passive: calls too often, rarely raises |
| **Tuomas** | Full reddish-brown beard and mustache, big rectangular glasses with a clear greenish lower rim, black wide-brimmed hat, black t-shirt with small white "SOUTH EXPLORER" text | Owner of the RC car and the drone, so his are the toys episodes | Loose aggressive: plays almost every hand, raises a lot, bluffs often |
| **Antti** | Long dark hair (a cap outdoors, a ponytail indoors), gray goatee, thin rectangular metal glasses, black t-shirt, broad and soft build | The kitchen master and the suspicious poker face | Tight aggressive: folds most hands, but when he raises he usually has something |

Outdoors everyone wears their headwear (Rauno's flat cap, Tuomas's hat, Antti's cap). Indoors Rauno has his messy hair and Antti his ponytail, Tuomas keeps his hat on as his trademark, and in the sauna all heads are bare.

## Gameplay notes

- Played by the three of us together: each episode suggests the character whose episode it is (Tuomas drives and flies, Antti cooks, and so on), but the player can switch character at any time.
- Poker is a lightweight, simplified version, not full Texas hold'em betting rules.
- Sound effects and 8-bit chiptune music are generated in the browser with the Web Audio API.
- Inside jokes from earlier episodes come back later in the evening.
- Choices (shopping list, what you say, who wins at poker) change the ending.

## Technical notes

- Single self-contained `index.html` (HTML5 canvas, plain JavaScript, no external dependencies). It is generated from `src/` by `python3 tools/build.py`.
- Pixel-art graphics drawn in code (no image files); 8-bit music and sound effects are synthesized with the Web Audio API (no audio files).
- Landscape layout, touch controls for phones, keyboard controls for desktop.
- Hosted with GitHub Pages from the `master` branch.

## Repository layout

```
README.md                    this file
MILESTONES.md                step-by-step build plan
PROGRESS.md                  live status log
HANDOFF.md                   complete technical description (for rebuilding or continuing with another AI)
index.html                   the game (generated single file, do not edit by hand)
src/                         game source: template.html and js/*.js (concatenated by tools/build.py)
assets/characters/           reference pixel-art character sheet (PNG)
tools/build.py               builds index.html from src/
tools/generate_sprites.py    draws the reference sprites (python3 tools/generate_sprites.py)
tests/                       Playwright headless tests (unit, bot playthrough, screenshots, mobile)
```

## Privacy

This is a private-joke game made for three friends. The pixel-art characters are drawn cartoons. The real reference photos used while designing them are intentionally **not** stored in this repository.
