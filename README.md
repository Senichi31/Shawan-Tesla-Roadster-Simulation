# Tesla Roadster Simulation — Version 1

A browser-based 2D driving game with an automatically gripping Roadster-inspired car, a curved wall and 15° inverted ceiling, four-corner vapor during the exit roll, and a finite scrolling flight area.

[Play the game](https://senichi31.github.io/Tesla-Roadster-Simulation/play.html?v=touch-v3)

## Run locally

Requires Python 3. No package installation is needed.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000`.

## Controls

On phones and tablets, use the on-screen arrows to drive or fly. Hold ↑ to take off/ascend and ↓ to descend. Hold BRAKE to slow down or BOOST for extra thrust; direction and boost support simultaneous touches. Use the flight, pause, and reset buttons for their respective actions.

- **Left / A, Right / D:** drive or move horizontally in flight.
- **Up arrow:** take off and ascend; **Down arrow:** descend. Landing on the ground or scaffold roof exits flight.
- **W / S:** forward/reverse on attached surfaces; ascend/descend in flight.
- **Space:** brake while attached.
- **Shift:** extra thrust.
- **F** or the flight button: toggle flight.
- **P / Escape** or the pause button: pause/resume.
- **R** or Reset run: reset before the first checkpoint.

Grip is automatic on the driving track and scaffold roof. Drive through the five checkpoints, exit the ceiling, and roll upright into flight automatically. Fly left to reveal more space; a marked boundary limits the world.

## Files

- `index.html`: main game page.
- `game.js`: physics, controls and Canvas rendering.
- `style.css`: page styling.
- `assets/`: vehicle artwork.
- `scripts/build-release.py`: builds the standalone game and derives the body/wheel artwork.
- `play.html`: standalone game with embedded CSS, JavaScript and artwork; can be opened directly or downloaded for offline play.

Rebuild the standalone page after editing source files:

```sh
python3 scripts/build-release.py
```

Keep one standalone file, `play.html`, and replace it on updates.

This is a fictional arcade simulation and an artistic interpretation of supplied references, not an official Tesla product or a model of real vehicle capabilities.
