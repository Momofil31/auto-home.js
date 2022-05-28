const PlanningGoal = require("../../pddl/PlanningGoal");

class CleanHouseGoal extends PlanningGoal {
    constructor(house) {
        let goal = [];
        for (let r of Object.values(house.rooms)) {
            if (r.name != "out") {
                goal.push("clean " + r.name);
            }
        }
        super({ goal: goal });
    }
}
class SuckHouseGoal extends PlanningGoal {
    constructor(house) {
        let goal = [];
        for (let r of Object.values(house.rooms)) {
            if (r.name != "out" && r.cleanStatus.status != "clean") {
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
