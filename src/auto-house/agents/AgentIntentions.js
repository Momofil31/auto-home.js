const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");
const { MessageDispatcher } = require("../helpers/Communication");
const { CleanHouseGoal, ChargeGoal, SuckHouseGoal } = require("./pddlGoals");

/*
 * HOUSE AGENT MESSAGES
 */

// Writes directly into belief state of recipient
class SendRoomStateGoal extends Goal {}
class SendRoomStateIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SendRoomStateGoal;
    }
    *exec() {
        let recipientAgent = this.goal.parameters.recipientAgent;
        let house = this.agent.house;
        for (let r of Object.values(house.rooms)) {
            if (r.name != "out") {
                if (r.cleanStatus.status == "dirty") {
                    recipientAgent.beliefs.declare("dirty " + r.name);
                    recipientAgent.beliefs.undeclare("clean " + r.name);
                    recipientAgent.beliefs.undeclare("sucked " + r.name);
                }
                if (r.cleanStatus.status == "sucked") {
                    recipientAgent.beliefs.declare("sucked " + r.name);
                    recipientAgent.beliefs.undeclare("clean " + r.name);
                    recipientAgent.beliefs.undeclare("dirty " + r.name);
                }
                if (r.cleanStatus.status == "clean") {
                    recipientAgent.beliefs.declare("clean " + r.name);
                    recipientAgent.beliefs.undeclare("dirty " + r.name);
                    recipientAgent.beliefs.undeclare("sucked " + r.name);
                }
                let isPersonInRoom = false;
                for (let p of Object.values(house.people)) {
                    if (p.in_room == r.name) {
                        isPersonInRoom = true;
                        break;
                    }
                }
                if (isPersonInRoom) recipientAgent.beliefs.declare("person_in_room " + r.name);
                else recipientAgent.beliefs.undeclare("person_in_room " + r.name);
            }
        }
        yield;
    }
}

/*
 *  VACUUM CLEANER GOALS & INTENTIONS & MESSAGES
 */
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
                    let res = this.agent.device.move(room.name, confRoom);
                    if (!res) throw new Error("move failed");

                    this.agent.beliefs.undeclare("in " + room.name);
                    this.agent.beliefs.declare("in " + confRoom);
                    yield res;
                    visited[room.name] = room.name;
                    yield* this.onlineDFS(house.rooms[confRoom], visited);
                    delete visited[room.name];

                    res = this.agent.device.move(confRoom, room.name);
                    if (!res) throw new Error("move failed");
                    this.agent.beliefs.undeclare("in " + confRoom);
                    this.agent.beliefs.declare("in " + room.name);
                }
            }
        }
        yield;
    }
}

class VacuumCleaningProcedureGoal extends Goal {}
class VacuumCleaningProcedureIntention extends Intention {
    static applicable(goal) {
        return goal instanceof VacuumCleaningProcedureGoal;
    }
    *exec({ houseAgent, times }) {
        let askRoomStatusGoal = new AskRoomStatusGoal({
            queriedAgent: houseAgent,
        });
        let suckHouseGoal = new SuckHouseGoal(this.agent.device.house);
        let askToCleanGoal = new AskToCleanGoal({ queriedAgent: this.agent.mopBotAgent });
        let chargeGoal = new ChargeGoal(this.agent.device);
        for (let i = 0; i < times; i++) {
            let goalAchieved = yield this.agent.postSubGoal(askRoomStatusGoal);
            if (i > 0) {
                this.log("New try, ignoring rooms with people inside");
                suckHouseGoal = new SuckHouseGoal(this.agent.device.house, true);
            }
            if (goalAchieved) goalAchieved = yield this.agent.postSubGoal(suckHouseGoal);

            if (goalAchieved) {
                let chargePromise = new Promise(async (res) => {
                    await this.agent.postSubGoal(chargeGoal);
                });
                let askToCleanPromise = new Promise(async (res) => {
                    await this.agent.postSubGoal(askToCleanGoal);
                });
                Promise.all([chargePromise, askToCleanPromise]);
                break;
            }
        }
    }
}

// Writes directly into belief state of recipient
class SendHouseConfigurationGoal extends Goal {}
class SendHouseConfigurationIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SendHouseConfigurationGoal;
    }
    *exec() {
        let recipientAgent = this.goal.parameters.recipientAgent;
        for (let [fact, value] of Object.values(this.agent.beliefs.entries)) {
            let tokens = fact.split(" ");
            switch (tokens[0]) {
                case "door":
                case "person_in_room":
                case "sucked":
                case "dirty":
                case "clean":
                    if (value) {
                        recipientAgent.beliefs.declare(fact);
                    } else {
                        recipientAgent.beliefs.undeclare(fact);
                    }
                    break;
            }
        }
        yield;
    }
}

class AskRoomStatusGoal extends Goal {}
class AskRoomStatusIntention extends Intention {
    static applicable(goal) {
        return goal instanceof AskRoomStatusGoal;
    }
    *exec() {
        let queriedAgent = this.goal.parameters.queriedAgent;
        let request = yield new SendRoomStateGoal({
            recipientAgent: this.agent,
        });
        yield MessageDispatcher.authenticate(this.agent).sendTo(queriedAgent.name, request);
    }
}

class AskToCleanGoal extends Goal {}
class AskToCleanIntention extends Intention {
    static applicable(goal) {
        return goal instanceof AskToCleanGoal;
    }
    *exec() {
        let queriedAgent = this.goal.parameters.queriedAgent;
        let request = yield new MopCleaningProcedureGoal({
            vacuumCleanerAgent: this.agent,
            times: 2,
        });
        yield MessageDispatcher.authenticate(this.agent).sendTo(queriedAgent.name, request);
    }
}

/*
 *  MOPBOT GOALS & INTENTIONS & MESSAGES
 */
class MopCleaningProcedureGoal extends Goal {}
class MopCleaningProcedureIntention extends Intention {
    static applicable(goal) {
        return goal instanceof MopCleaningProcedureGoal;
    }
    *exec({ vacuumCleanerAgent, times }) {
        let askHouseConfigurationGoal = new AskHouseConfigurationGoal({
            queriedAgent: vacuumCleanerAgent,
            house: this.agent.device.house,
        });
        let cleanHouseGoal = new CleanHouseGoal(this.agent.device.house);
        let chargeGoal = new ChargeGoal(this.agent.device);
        for (let i = 0; i < times; i++) {
            let goalAchieved = yield this.agent.postSubGoal(askHouseConfigurationGoal);
            if (i > 0) {
                this.log("New try, ignoring rooms with people inside");
                cleanHouseGoal = new CleanHouseGoal(this.agent.device.house, true);
            }
            if (goalAchieved) goalAchieved = yield this.agent.postSubGoal(cleanHouseGoal);
            if (goalAchieved) {
                let chargePromise = new Promise(async (res) => {
                    await this.agent.postSubGoal(chargeGoal);
                });
                Promise.all([chargePromise]);
                break;
            }
        }
    }
}

class AskHouseConfigurationGoal extends Goal {}
class AskHouseConfigurationIntention extends Intention {
    static applicable(goal) {
        return goal instanceof AskHouseConfigurationGoal;
    }
    *exec() {
        let queriedAgent = this.goal.parameters.queriedAgent;
        let house = this.goal.parameters.house;
        let request = yield new SendHouseConfigurationGoal({
            house: house,
            recipientAgent: this.agent,
        });
        yield MessageDispatcher.authenticate(this.agent).sendTo(queriedAgent.name, request);
    }
}

module.exports = {
    SendRoomStateGoal,
    SendRoomStateIntention,
    LearnHouseGoal,
    LearnHouseIntention,
    VacuumCleaningProcedureGoal,
    VacuumCleaningProcedureIntention,
    SendHouseConfigurationGoal,
    SendHouseConfigurationIntention,
    AskRoomStatusGoal,
    AskRoomStatusIntention,
    AskToCleanGoal,
    AskToCleanIntention,
    MopCleaningProcedureGoal,
    MopCleaningProcedureIntention,
    AskHouseConfigurationGoal,
    AskHouseConfigurationIntention,
};
