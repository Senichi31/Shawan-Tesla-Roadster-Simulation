# Tesla Roadster Simulation

A browser-based 2D driving playground: drive a Roadster-inspired car, accelerate up a full 180-degree curved wall with a horizontal inverted ceiling, or fly through five glowing checkpoints.

## Run locally

Requires Python 3. No package installation or build step is needed.

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open `http://localhost:8000` in your browser. The game uses Canvas and plain JavaScript. Fonts are optional; system fonts work offline.

## Controls

- **W / Up / D / Right:** accelerate; in flight, W/Up goes up and D/Right goes right.
- **S / Down / A / Left:** reverse/brake; in flight, S/Down goes down and A/Left goes left.
- **M:** toggle air grip. Air grip is on by default and holds the car on the vertical wall and inverted ceiling, even at rest. Toggle it off while inverted to drop. The game models this as an arcade air-grip constraint.
- **F:** toggle flight. Use WASD or arrow keys to move in four directions.
- **Shift:** hold for extra thrust.
- **P / Escape:** pause/resume.
- **R:** reset the run.

Hold D/Right or W/Up to build speed, then climb the half-circle wall and drive fully upside down along the ceiling. Hold Space to stop while attached. Drive off the ceiling’s left end to drop or engage flight. Hold Shift for more launch speed; press F in the air for sustained flight. Collect all five rings in any order. Air grip and flight are mutually exclusive; their buttons also toggle the modes. Keyboard play is intended for desktop browsers.

This is a fictional arcade simulation, not a model of real vehicle capabilities or an official Tesla product.

## Visual reference

The tall open arc, rear steel truss, dark demonstration stage, silver bodywork and blue thrusters are inspired by the reference screenshot provided for “The Ramp | Roadster”. This is a 2D artistic interpretation of that screenshot.

The silver vehicle sprite in `assets/roadster.svg` is a custom vector study of the user-supplied video: a low panoramic canopy, angular rear fascia, red rear light strip, large dark wheels and sculpted silver body. Flight adds blue underbody plumes, a rear jet and drifting vapor. It is a side-view interpretation, not a production CAD model.

**Space** holds the brake. **M** toggles air grip (enabled at reset). Turn air grip off on the ceiling to fall under gravity; turn on **F** for free flight. Air grip and flight are separate arcade mechanics. The ceiling path is tangent-continuous with the 180-degree wall and supports forward and reverse travel.

## Standalone ceiling release

`play-ceiling-v6.html` contains the CSS, JavaScript and vehicle sprite in one file, so a page cannot combine an updated track with old cached assets. Its upper-left arena label reads `V6 · 180° WALL + INVERTED CEILING`. Rebuild it after editing the source files:

```sh
python3 scripts/build-release.py
```

The track is a true semicircle (180-unit radius), joined tangentially to the lower straight and an upper horizontal inverted section. Opening the release does not require a package manager or external network requests.

## V7: shortened ceiling and side-reference vehicle

Open `play-ceiling-v7.html` for the current standalone release. Its label reads `V7 · SHORT CEILING / SILVER ROADSTER`. The leftmost three 120-unit truss bays were removed: the ceiling endpoint moves from x=450 to x=810, leaving a 140-unit ceiling. Brake with Space as you enter the ceiling if you want to stop before its open end. The half-circle wall is unchanged.

The current silver vehicle is redrawn from the supplied side photograph, with a wedge nose, long black glazing, straight shoulder and large five-spoke wheels. It faces right to match forward driving in the game. Run `python3 scripts/build-release.py` after source changes to rebuild V7; V6 is retained as an older standalone release.

## V8: independent rolling wheels

The current standalone entry is `play-ceiling-v8.html`, labelled `V8 · FIVE-SPOKE WHEELS / LIVE ROTATION`. The silver car keeps its V7 body shape; the wheel design uses broad silver panels and heavy black five-spoke geometry based on the side reference. The build script derives `roadster-body.svg` and `roadster-wheel.svg` from the complete vehicle illustration. Canvas rotates each wheel independently according to signed surface distance divided by the visible tire radius, including wall/ceiling travel. Reversing reverses wheel rotation, braking stops it, and pause freezes it. Airborne wheels coast with damping. Run `python3 scripts/build-release.py` to regenerate the component assets and standalone V8 page.
