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
- **Automatic air grip:** always available, with no M key or manual switch. The car automatically adheres to walls and the ceiling while on the track, even at rest. Flying suspends surface attachment; driving past the open endpoint releases it naturally.
- **F:** toggle flight. Use WASD or arrow keys to move in four directions.
- **Shift:** hold for extra thrust.
- **P / Escape:** pause/resume.
- **R:** reset the run.

Hold D/Right or W/Up to build speed, then climb the half-circle wall and drive fully upside down along the ceiling. Release directions to coast with inertia; hold Space to stop while attached. Air grip holds the car only while road exists. Driving past the ceiling’s open end releases it with its current velocity; press F for flight. Hold Shift for more launch speed; press F in the air for sustained flight. Collect all five rings in any order. Air grip and flight are mutually exclusive; their buttons also toggle the modes. Keyboard play is intended for desktop browsers.

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

## V9: six-spoke reference correction

Current entry: `play-ceiling-v9.html` (`V9 · SIX-SPOKE WHEELS / LIVE ROTATION`). Corrects the previous five-spoke interpretation to **six black spokes and six silver sectors**, spaced at 60 degrees, based on the supplied wheel close-up. Body shape, short ceiling and distance-based wheel rotation are retained. The build script regenerates V9 and both component wheel/body SVGs.

## V10: gravity-free attached driving

Current entry: `play-ceiling-v10.html` (`V10 · AIR GRIP / NO GRAVITY`). While air grip is enabled and the car is attached, gravity contributes no tangential acceleration. Releasing directional input smoothly brakes to a complete stop on ground, walls and the ceiling. The ceiling endpoint clamps position and speed instead of automatically detaching; reverse input moves away from it. Press M to explicitly release adhesion or F for flight. Gravity still acts after detaching. The silver body and animated six-spoke wheels are retained. Rebuild V10 with `python3 scripts/build-release.py`.

## V11: inertia and open-end exit

Current entry: `play-ceiling-v11.html` (`V11 · INERTIA / OPEN TRACK EXIT`). Releasing an arrow/WASD key now preserves momentum with gradual rolling drag; short taps move the car and let it coast. Only Space applies the strong brake. Gravity remains cancelled while air grip is attached, so a car braked on a wall stays still. The ceiling end is open again: driving past it detaches even with air grip enabled, preserves tangential velocity and resumes airborne gravity. Press F to fly instead of falling. Six-spoke rotating wheels and the shortened ceiling are retained. Rebuild V11 with `python3 scripts/build-release.py`.

## V12: automatic surface adhesion

Current entry: `play-ceiling-v12.html` (`V12 · AUTOMATIC AIR GRIP`). Removes the M key and clickable air-grip toggle. Surface adhesion is always available automatically, including after leaving flight mode. Wall/ceiling driving remains gravity-free. Short taps still coast with inertia, Space brakes, the ceiling end releases naturally, and F toggles flight. The grip card now displays status rather than acting as a control. Rebuild V12 with `python3 scripts/build-release.py`. Earlier version notes describe historical behavior.

## V13: grounded steel scaffold

Current entry: `play-ceiling-v13.html` (`V13 · GROUNDED STEEL SCAFFOLD`). Replaces the narrow curved truss with a rectangular rear steel tower: vertical grounded columns, a straight top beam, horizontal cross members, X braces and foot plates. Steelwork is clipped behind the road face. Track geometry, automatic grip, inertia, open-end exit and vehicle artwork are unchanged. Rebuild V13 with `python3 scripts/build-release.py`.

## V14: shorter coasting

Current entry: `play-ceiling-v14.html` (`V14 · SHORTER COASTING`). On the driving surface, releasing directional input uses 2.4/s rolling drag instead of 0.48/s, while held-input acceleration and drag stay unchanged. A deterministic 100 ms tap followed by five seconds of coasting travels about 78% less distance after release. Coasting is retained rather than stopping instantly. This applies to attached road/wall/ceiling travel and the lower landing ground. Automatic adhesion, the open ceiling exit, six-spoke rotating wheels and scaffold are retained. Rebuild V14 with `python3 scripts/build-release.py`.

## V15: 20-degree uphill upper track

Current entry: `play-ceiling-v15.html` (`V15 · UPHILL CEILING +20°`). The 140-unit upper section rises at 20 degrees in the car's forward direction toward the left exit. The circular wall retains its radius and meets it tangentially at a 160-degree sweep. The scaffold follows the revised envelope and the upper checkpoint follows the road. Automatic adhesion cancels slope gravity, including at rest; exiting preserves the uphill tangent velocity. Short coasting and six-spoke wheel animation are retained. Rebuild V15 with `python3 scripts/build-release.py`.

## V16: 15-degree upper track

Current entry: `play-ceiling-v16.html` (`V16 · UPHILL CEILING +15°`). Reduces the upper incline from 20 to 15 degrees, keeping its 140-unit length and a tangent-continuous connection to the curved wall. Adhesion, short coasting, rotating six-spoke wheels and open-end exit remain unchanged. Rebuild V16 with `python3 scripts/build-release.py`.

## V17: trimmed upper scaffold

Current entry: `play-ceiling-v17.html` (`V17 · +15° CEILING / TRIMMED SCAFFOLD`). Removes the highlighted uppermost row of steelwork, including its posts, cross braces and top beam. Remaining steel members begin at the previous row boundary. The 15-degree road and all driving behavior are unchanged. Rebuild V17 with `python3 scripts/build-release.py`.

## V18: scaffold reaches the ceiling endpoint

Current entry: `play-ceiling-v18.html` (`V18 · CEILING-END SCAFFOLD`). Corrects the over-trimmed support: the top beam and upright grid extend to the outer edge of the inclined ceiling endpoint, trimming only the excess above it. The 15-degree track and all driving logic remain unchanged. Rebuild with `python3 scripts/build-release.py`.

## V19: small scaffold height adjustment

Current entry: `play-ceiling-v19.html`. Raises the scaffold top by another 6 arena units to close the small gap at the upper track endpoint. Track geometry and driving behavior are unchanged. Rebuild with `python3 scripts/build-release.py`.

## V20: left and right driving

Current entry: `play-ceiling-v20.html` (`V20 · LEFT + RIGHT DRIVING`). Left/A moves toward decreasing track distance and turns the vehicle body left once travel reverses; Right/D returns it to forward travel. The same facing behavior works on the curved wall. Wheel rendering compensates for body mirroring so rolling direction stays correct. The reset position is x=500 to leave usable ground to both sides. Short coasting, automatic adhesion, the 15-degree ceiling and scaffold remain unchanged. Rebuild with `python3 scripts/build-release.py`.

## V21: full-body flight collisions

Current entry: `play-ceiling-v21.html` (`V21 · FULL-BODY FLIGHT COLLISION`). Flying now collides using a convex silhouette covering the nose, tail, roof and wheel envelope, against finite two-sided road segments with the visible deck thickness. Movement and rotation are substepped to prevent boosted motion from tunnelling through the road. Contact removes velocity into the surface while preserving motion along it. Facing changes are rechecked for overlap. Scaffold and exhaust remain decorative; attached driving keeps its existing path constraint. Validation covers nose, tail, roof, rotating into the curve, landing, boosted travel and existing automatic grip/coasting/open-end exit. Rebuild with `python3 scripts/build-release.py`.

## V22: solid scaffold footprint

Current entry: `play-ceiling-v22.html` (`V22 · SOLID SCAFFOLD COLLISION`). The scaffold roof, rear face and ceiling-end cap join the road face and floor as one closed flight-collision obstacle. Cars cannot enter its X-braced bays, including by flying down onto the roof or approaching from behind. Rendering and collision share the scaffold top/back coordinates. Contacts are rechecked after arena clamps. Validation checks independent polygon containment and edge crossings across repeated boosted approaches from above, behind, the tip and the road face, plus V21 flight collisions and normal driving. The visible track and scaffold design remain unchanged. Rebuild with `python3 scripts/build-release.py`.

## V23: collisions after leaving flight mode

Current entry: `play-ceiling-v23.html` (`V23 · SOLID COLLISION IN ALL MODES`). Free falling and landed ground movement now use the same substepped whole-body road/scaffold collision solver as powered flight. Disabling F never disables collision: the scaffold roof supports a falling vehicle, and the rear face blocks ground movement. Inner road contacts can reattach automatically; scaffold roof/rear contacts remain solid supports. Attached poses and facing changes also maintain body clearance at the straight-to-curve junction. Validation covers disabling and repeatedly toggling F while approaching from above, rear and the open tip; resting on the roof; ground movement into the rear; normal driving/landing; and existing flight nose/tail/roof/rotation collisions. Rebuild with `python3 scripts/build-release.py`.

## V24: automatic longitudinal roll

Current entry: `play-ceiling-v24.html` (`V24 · AUTOMATIC AXIAL ROLL`). Leaving the inverted upper track automatically rolls the vehicle upright around its nose-to-tail axis over 1.05 seconds. The nose retains its launch direction and momentum: this is not an end-over-end pitch or a front/back turn. A dedicated silver top-view sprite expands between the inverted and upright side views to represent the 3D roll in Canvas 2D. Projected whole-body collision follows the roll, including its visible width; road reattachment is deferred while the roll clears the lip. Pause freezes progress, F on/off does not cancel it, and landing/reset restores the standard pose. Validation covers start/midpoint/end orientation, roof visibility, pause/F controls, collisions in both modes and existing driving behavior. Rebuild with `python3 scripts/build-release.py`.

## V25: show the underside during roll

Current entry: `play-ceiling-v25.html` (`V25 · UNDERSIDE AXIAL ROLL`). Reverses the longitudinal roll direction and replaces the midpoint roof view with a stylized underbody view showing the flat undertray, suspension, wheels and air nozzles. Nose direction, roll timing and the collision envelope are retained. Rebuild with `python3 scripts/build-release.py`.

## V26: wider rolling underbody

Current entry: `play-ceiling-v26.html`. Increases the underside view's transverse size from 56 to 76 arena units (about 36%) while retaining vehicle length and side-profile artwork. The roll collision projection expands correspondingly, from 26 to 36 units of transverse half-width. Roll orientation and scaffold collision checks pass. Rebuild with `python3 scripts/build-release.py`.
