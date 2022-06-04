const Agent = require("../../bdi/Agent");
const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");

class SecurityAgent extends Agent {
    constructor(name, house) {
        super(name);
        this.house = house;
    }
}

class SecurityAlarmGoal extends Goal {}
class SecurityAlarmIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SecurityAlarmGoal;
    }

    *exec() {
        let people = this.goal.parameters.people;
        let house = this.goal.parameters.house;
        let securityAlarmPromises = [];
        for (let p of Object.values(people)) {
            let securityAlarmPromise = new Promise(async (res) => {
                while (true) {
                    await p.notifyChange("in_room", "securityAlarm");
                    let new_room = p.in_room;
                    let previous_room = p.previous_room;
                    let suspectId = p.uuid;
                    if (previous_room == "out" && new_room != "out") {
                        // check if person entered belong to the house
                        for (let housePerson of Object.values(house.people)) {
                            if (suspectId == housePerson.uuid) break;
                        }
                        // if I arrive here we have a burglar
                        this.log("!!! BURGLAR ALARM !!! Police called.");
                    }
                }
            });
            securityAlarmPromises.push(securityAlarmPromise);
        }
        yield Promise.all(securityAlarmPromises);
    }
}

module.exports = { SecurityAgent, SecurityAlarmGoal, SecurityAlarmIntention };
