// Device which actually do things in the house

// Agent which gives intelligence (PDDL) on the device and controls it

const Agent = require("../../bdi/Agent");
const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");
const GenericDevice = require("./GenericDevice");
const pddlActionIntention = require("../../pddl/actions/pddlActionIntention");
const PlanningGoal = require("../../pddl/PlanningGoal");
const House = require("../House");
const Clock = require("../../utils/Clock");

global.deviceNextId = 0;

class VacuumCleaner extends GenericDevice {
    constructor(house, name, chargingStationRoom) {
        super();
        this.house = house;
        this.name = name;
        this.id = global.deviceNextId++;
        this.set("in_room", "kitchen");
        this.set("battery", 100);
        this.set("charging", false);
        this.chargingStationRoom = chargingStationRoom;
    }
    move(from, to) {
        if (this.in_room == to) {
            return false;
        }
        if (this.in_room != from) {
            return false;
        }
        if (to == "out") {
            return false;
        }
        if (!this.house.rooms[from].doors_to.includes(to)) {
            return false;
        }
        if (this.charging) {
            return false;
        }
        this.in_room = to;
        this.log("move", from, to);
        return true;
    }
    async suck(r) {
        if (this.in_room != r) {
            return false;
        }
        if (this.house.rooms[r].cleanStatus.status != "dirty") {
            return false;
        }
        if (this.charging) {
            return false;
        }
        this.house.rooms[r].cleanStatus.status = "clean";
        this.log("suck", r);
        // TODO wait finishing sucking. Each suck should depend on in_room each room has different time encoded in house.
        let timeRemaining = this.house.rooms[r].suck_time;
        while (timeRemaining) {
            await Clock.global.notifyChange("mm", "waitForSucking");
            if (timeRemaining > 0) {
                timeRemaining = timeRemaining - Clock.TIME_STEP;
                this.battery -= Clock.TIME_STEP;
            } else {
                Clock.global.unobserve("mm", "waitForSucking");
            }
        }

        this.battery -= Clock.TIME_STEP;
        return true;
    }
    charge() {
        if (this.in_room != this.chargingStationRoom) {
            return false;
        }
        if (this.battery == 100) {
            return false;
        }
        this.charging = true;
        this.log("charging");
        let timeRemaining = 100 - this.battery;
        Clock.global.observe(
            "mm",
            (mm) => {
                if (timeRemaining > 0) {
                    timeRemaining = timeRemaining - Clock.TIME_STEP;
                    this.battery += Clock.TIME_STEP;
                    return;
                }
                this.log("charging completed");
                Clock.global.unobserve("mm", "waitForCharging");
                this.charging = false;
            },
            "waitForCharging",
        );
    }
}
// Agents
// let house = new House();

// let vacuumCleanerDevice = new VacuumCleaner(house, "vacuum", "kitchen");

class LearnHouseGoal extends Goal {}
class LearnHouseIntention extends Intention {
    static applicable(goal) {
        return goal instanceof LearnHouseGoal;
    }
    *exec() {
        let house = this.goal.parameters.house;
        let s = house.rooms[this.goal.parameters.start];
        let visited = {};
        yield* this.onlineDFS(s, visited);
    }
    *onlineDFS(room, visited) {
        let house = this.goal.parameters.house;
        for (let confRoom of room.doors_to) {
            if (!(confRoom in visited)) {
                if (confRoom != "out") {
                    this.agent.beliefs.declare("door " + room.name + " " + confRoom);
                    this.agent.beliefs.declare("door " + confRoom + " " + room.name);
                    let res = this.agent.vacuumCleanerDevice.move(room.name, confRoom);
                    if (!res) throw new Error("move failed");

                    this.agent.beliefs.undeclare("in " + room.name);
                    this.agent.beliefs.declare("in " + confRoom);
                    yield res;
                    visited[room.name] = room.name;
                    yield* this.onlineDFS(house.rooms[confRoom], visited);
                    delete visited[room.name];

                    res = this.agent.vacuumCleanerDevice.move(confRoom, room.name);
                    if (!res) throw new Error("move failed");
                    this.agent.beliefs.undeclare("in " + confRoom);
                    this.agent.beliefs.declare("in " + room.name);
                }
            }
        }
        yield;
    }
}

class Move extends pddlActionIntention {
    static parameters = ["r1", "r2"];
    static precondition = [["in", "r1"], ["door", "r1", "r2"], ["not zero_battery"]];
    static effect = [
        ["in", "r2"],
        ["not in", "r1"],
    ];
    *exec({ r1, r2 } = parameters) {
        if (this.checkPrecondition()) {
            let res = this.agent.vacuumCleanerDevice.move(r1, r2);
            yield res;
            if (res) {
                this.applyEffect();
            } else {
                throw new Error("move failed");
            }
        } else throw new Error("pddl precondition not valid");
    }
}
class Suck extends pddlActionIntention {
    static parameters = ["r"];
    static precondition = [["in", "r"], ["dirty", "r"], ["not zero_battery"]];
    static effect = [
        ["not dirty", "r"],
        ["clean", "r"], // to change in order to have clearner bot
    ];
    *exec({ r } = parameters) {
        if (this.checkPrecondition()) {
            let res = yield this.agent.vacuumCleanerDevice.suck(r);
            if (res) {
                this.applyEffect();
                if (this.agent.vacuumCleanerDevice.battery == 0) {
                    this.agent.beliefs.declare("zero_battery");
                }
                this.agent.beliefs.undeclare("full_battery");
            } else {
                throw new Error("suck failed");
            }
        } else throw new Error("pddl precondition not valid");
    }
}

class Charge extends pddlActionIntention {
    static parameters = [];
    static precondition = [
        ["not full_battery"],
        ["in", "kitchen"], // note that this should not be hardcoded but based on agent.chargingStationRoom
    ];
    static effect = [["full_battery"], ["not zero_battery"]];

    async *exec() {
        if (this.checkPrecondition()) {
            yield this.agent.vacuumCleanerDevice.charge();
            await this.agent.vacuumCleanerDevice.notifyChange("charging", "waitForCharging");
            // This breaks a bit the rules but I couldn't find another way.
            if (
                !this.agent.vacuumCleanerDevice.charging &&
                this.agent.vacuumCleanerDevice.battery == 100
            ) {
                this.applyEffect();
            } else {
                throw new Error("charge failed");
            }
        } else throw new Error("pddl precondition not valid");
    }
}

class VacuumCleanerAgent extends Agent {
    constructor(name, vacuumCleanerDevice) {
        super(name);
        this.vacuumCleanerDevice = vacuumCleanerDevice;
    }
}

// let vacuumCleanerAgent = new VacuumCleanerAgent("vacuum_cleaner", vacuumCleanerDevice);
// vacuumCleanerAgent.intentions.push(LearnHouseIntention);

// const learnHouseGoal = new LearnHouseGoal({
//     house: house,
//     start: vacuumCleanerDevice.in_room,
// });

// const cleanHouseGoal = new PlanningGoal({
//     goal: [
//         "clean kitchen",
//         "clean living_room",
//         "clean hallway",
//         "clean bathroom_0",
//         "clean garage",
//     ],
// });

// const chargeGoal = new PlanningGoal({
//     goal: ["in " + vacuumCleanerDevice.chargingStationRoom, "full_battery"],
// });

// vacuumCleanerAgent.postSubGoal(learnHouseGoal);

// let { OnlinePlanning } = require("../../pddl/OnlinePlanner")([Move, Suck, Charge]);
// vacuumCleanerAgent.intentions.push(OnlinePlanning);
// vacuumCleanerAgent.beliefs.declare("in kitchen");
// vacuumCleanerAgent.beliefs.declare("dirty kitchen");
// vacuumCleanerAgent.beliefs.declare("dirty hallway");
// vacuumCleanerAgent.beliefs.declare("dirty garage");
// vacuumCleanerAgent.beliefs.declare("clean living_room");
// vacuumCleanerAgent.beliefs.declare("clean bathroom_0");
// vacuumCleanerAgent.beliefs.declare("full_battery");
// vacuumCleanerAgent.beliefs.undeclare("zero_battery");

// const postCleaningGoal = (agent) => (achieved) => {
//     if (achieved) {
//         agent.postSubGoal(cleanHouseGoal);
//         learnHouseGoal.unobserve("achieved", achieved, "learnHouseGoal");
//     }
// };
// const postChargeGoal = (agent) => (achieved) => {
//     if (achieved) {
//         agent.postSubGoal(chargeGoal);
//         cleanHouseGoal.unobserve("achieved", achieved, "chargeGoal");
//     }
// };

// learnHouseGoal.observe("achieved", postCleaningGoal(vacuumCleanerAgent), "learnHouseGoal");
// cleanHouseGoal.observe("achieved", postChargeGoal(vacuumCleanerAgent), "postChargeGoal");

// console.log("a1 entries", vacuumCleanerAgent.beliefs.entries);
// console.log("a1 literals", vacuumCleanerAgent.beliefs.literals);

// Clock.startTimer();

module.exports = {
    VacuumCleaner,
    VacuumCleanerAgent,
    LearnHouseGoal,
    LearnHouseIntention,
    Move,
    Suck,
    Charge,
};
