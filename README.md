# Auto-Home.js

## Autonomous Software Agents - Project

University of Trento - Trento, 2022

Filippo Momesso - filippo.momesso@studenti.unitn.it

Adapted and extended from [Autonode.js](https://github.com/marcorobol/Autonode.js).

## How to run

First `npm install` to install the required dependencies.

From root directory of this repository run:

```
node ./src/autohouse/scenarios/complete_scenario.js
```

---

## Logs

Logs of the scenario running can be found in `scenario_logs` directory.

---

## Changelog

### 1.0 (04/06/2022)

Final version of the project developed for the final submission.

-   Added rooms and Alice to house.
-   Vacuum cleaner agent and Mop-bot agent with planning capabilities.
-   Communication between agents.
-   Several new devices and intentions.
-   Several scenarios to show how agents interact with the environment and with each other.
-   Refactored and moved various files.

### 0.1 (02/05/2022)

First partial implementation of the project developed the A2 deadline.
The repository implements:

-   Basic structure of the `House` (a subset of what described in A1) with a single floor and four rooms.
-   Devices for lights, shutters and coffee machine implemented as `Observable` classes.
-   One `Person` which moves in/out the house and between rooms in a daily routine, the same for each day of the week.
-   Main agent which controls the house and some devices. Subclasses of `Intention` and `Goal` are use to automatically control lights and coffee machine.
-   Security agent has goals and intentions to control shutters at night and when the person leaves the house.
-   Sensor for tracking people position in beliefset, implemented as subclasses of `Intention` and `Goal`.
-   Fixed bug on definition of multiple observers on same property of same `Observable` object. Retro compatible with older implementations.

---
