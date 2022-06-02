const PlanningGoal = require("../../pddl/PlanningGoal");

class CleanHouseGoal extends PlanningGoal {
    constructor(house, ignoreRoomsWithPeople = false) {
        let goal = [];
        for (let r of Object.values(house.rooms)) {
            if (r.name != "out") {
                if (ignoreRoomsWithPeople) {
                    let isPersonInRoom = false;
                    for (let p of Object.values(house.people)) {
                        if (p.in_room == r.name) {
                            isPersonInRoom = true;
                            break;
                        }
                    }
                    if (isPersonInRoom) {
                        continue;
                    }
                }
                goal.push("clean " + r.name);
            }
        }
        super({ goal: goal });
    }
}
class SuckHouseGoal extends PlanningGoal {
    constructor(house, ignoreRoomsWithPeople = false) {
        let goal = [];
        for (let r of Object.values(house.rooms)) {
            if (r.name != "out" && r.cleanStatus.status != "clean") {
                if (ignoreRoomsWithPeople) {
                    let isPersonInRoom = false;
                    for (let p of Object.values(house.people)) {
                        if (p.in_room == r.name) {
                            isPersonInRoom = true;
                            break;
                        }
                    }
                    if (isPersonInRoom) {
                        continue;
                    }
                }
                goal.push("sucked " + r.name);
            }
        }
        super({ goal: goal });
    }
}

class ChargeGoal extends PlanningGoal {
    constructor(device) {
        super({
            goal: ["in " + device.chargingStationRoom, "full_battery"],
        });
    }
}

module.exports = {
    CleanHouseGoal,
    SuckHouseGoal,
    ChargeGoal,
};
