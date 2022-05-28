const pddlActionIntention = require("../../pddl/actions/pddlActionIntention");

class Move extends pddlActionIntention {
    static parameters = ["r1", "r2"];
    static precondition = [["in", "r1"], ["door", "r1", "r2"], ["not zero_battery"]];
    static effect = [
        ["in", "r2"],
        ["not in", "r1"],
    ];
    *exec({ r1, r2 } = parameters) {
        if (this.checkPrecondition()) {
            let res = this.agent.device.move(r1, r2);
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
    static precondition = [
        ["not person_in_room", "r"],
        ["in", "r"],
        ["dirty", "r"],
        ["not zero_battery"],
        ["not clean", "r"],
    ];
    static effect = [
        ["not dirty", "r"],
        ["sucked", "r"],
    ];
    *exec({ r } = parameters) {
        if (this.checkPrecondition()) {
            let res = yield this.agent.device.suck(r);
            if (res) {
                this.applyEffect();
                if (this.agent.device.battery == 0) {
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
            yield this.agent.device.charge();
            await this.agent.device.notifyChange("charging", "waitForCharging");
            // This breaks a bit the rules but I couldn't find another way.
            if (!this.agent.device.charging && this.agent.device.battery == 100) {
                this.applyEffect();
            } else {
                throw new Error("charge failed");
            }
        } else throw new Error("pddl precondition not valid");
    }
}

class Clean extends pddlActionIntention {
    static parameters = ["r"];
    static precondition = [
        ["not person_in_room", "r"],
        ["in", "r"],
        ["sucked", "r"],
        ["not dirty", "r"],
        ["not zero_battery"],
    ];
    static effect = [
        ["not sucked", "r"],
        ["clean", "r"], // to change in order to have clearner bot
    ];
    *exec({ r } = parameters) {
        if (this.checkPrecondition()) {
            let res = yield this.agent.device.clean(r);
            if (res) {
                this.applyEffect();
                if (this.agent.device.battery == 0) {
                    this.agent.beliefs.declare("zero_battery");
                }
                this.agent.beliefs.undeclare("full_battery");
            } else {
                throw new Error("cleaning failed");
            }
        } else throw new Error("pddl precondition not valid");
    }
}
module.exports = { Move, Suck, Charge, Clean };
