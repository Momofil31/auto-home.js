const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");

class RoomStatusSensorGoal extends Goal {}

class RoomStatusSensorIntention extends Intention {
    static applicable(goal) {
        return goal instanceof RoomStatusSensorGoal;
    }

    *exec() {
        let roomsPromises = [];
        let rooms = this.goal.parameters.rooms;
        for (let r of Object.values(rooms)) {
            // let lightGoalPromise = this.agent.postSubGoal( new SenseOneLightGoal(l) )
            // lightsGoals.push(lightGoalPromise)
            if (r.name != "out") {
                let roomsPromise = new Promise(async (res) => {
                    while (true) {
                        let old_status = r.cleanStatus.status;
                        await r.cleanStatus.notifyChange("status", "roomStatus");
                        let new_status = r.cleanStatus.status;
                        this.agent.beliefs.undeclare(old_status + " " + r.name);
                        this.agent.beliefs.declare(new_status + " " + r.name);
                    }
                });

                roomsPromises.push(roomsPromise);
            }
        }
        yield Promise.all(roomsPromises);
    }
}

module.exports = {
    RoomStatusSensorGoal,
    RoomStatusSensorIntention,
};
