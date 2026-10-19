# Tesla Roadster Simulation

A browser-based 2D driving playground: drive a Roadster-inspired car, accelerate up a tall vertical launch ramp with a backward-curving lip, or fly through five glowing checkpoints.

## Run locally

Requires Python 3. No package installation or build step is needed.

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open `http://localhost:8000` in your browser. The game uses Canvas and plain JavaScript. Fonts are optional; system fonts work offline.

## Controls

- **W / Up / D / Right:** accelerate; in flight, W/Up goes up and D/Right goes right.
- **S / Down / A / Left:** reverse/brake; in flight, S/Down goes down and A/Left goes left.
- **M:** toggle magnetic grip. Magnetic traction adds climbing thrust and highlights the vertical launch track. The arcade contact model keeps the car on the arc until the open lip.
- **F:** toggle flight. Use WASD or arrow keys to move in four directions.
- **Shift:** hold for extra thrust.
- **P / Escape:** pause/resume.
- **R:** reset the run.

Hold D/Right or W/Up to build speed, then climb the near-vertical arc, follow its overhang and take off automatically to the left. Hold Shift for more launch speed; press F in the air for sustained flight. Collect all five rings in any order. Magnetic grip and flight are mutually exclusive; their buttons also toggle the modes. Keyboard play is intended for desktop browsers.

This is a fictional arcade simulation, not a model of real vehicle capabilities or an official Tesla product.

## Visual reference

The tall open arc, rear steel truss, dark demonstration stage, silver bodywork and blue thrusters are inspired by the reference screenshot provided for “The Ramp | Roadster”. This is a 2D artistic interpretation of that screenshot.
