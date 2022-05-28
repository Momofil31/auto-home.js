const Agent = require("../../bdi/Agent");
const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");

class HouseAgent extends Agent {
    constructor(name, house) {
        super(name);
        this.house = house;
    }
}

/*
 * Writes directly into belief state of recipient
 */
class SendRoomStateGoal extends Goal {}
class SendRoomStateIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SendRoomStateGoal;
    }
    *exec() {
        let recipientAgent = this.goal.parameters.recipientAgent;
        let house = this.goal.parameters.house;
        for (let r of Object.values(house.rooms)) {
            if (r.name != "out") {
                if (r.cleanStatus.status == "dirty") {
                    recipientAgent.beliefs.declare("dirty " + r.name);
                    recipientAgent.beliefs.undeclare("clean " + r.name);
                }
                if (r.cleanStatus.status == "clean") {
                    recipientAgent.beliefs.declare("clean " + r.name);
                    recipientAgent.beliefs.undeclare("dirty " + r.name);
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

module.exports = { HouseAgent, SendRoomStateGoal, SendRoomStateIntention };
