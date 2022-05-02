const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");

class SensePeoplePositionGoal extends Goal {
    constructor(people = []) {
        super();
        /** @type {Array<Person>} */
        this.people = Object.values(people);
    }
}

class SensePeoplePositionIntention extends Intention {
    constructor(agent, goal) {
        super(agent, goal);

        /** @type {Array<Person>} */
        this.people = this.goal.people;
    }

    static applicable(goal) {
        return goal instanceof SensePeoplePositionGoal;
    }

    /**
     * To run code in parallel use postSubGoal without wait or yield. For example:
     *
     * for (let l of this.lights) {
     *      let lightGoalPromise = this.agent.postSubGoal( new SenseOneLightGoal(l) )
     *      lightsGoals.push(lightGoalPromise)
     * }
     * Or put paraller code in Promises callback and do not wait or yield for them neither. For example:
     *
     * for (let l of this.lights) {
     *      let lightGoalPromise = new Promise( async res => {
     *          while (true) {
     *              let status = await l.notifyChange('status')
     *              this.log('sense: light ' + l.name + ' switched ' + status)
     *              this.agent.beliefs.declare('light_on '+l.name, status=='on')
     *              this.agent.beliefs.declare('light_off '+l.name, status=='off')
     *          }
     *      });
     * }
     */
    *exec() {
        let peopleGoals = [];
        for (let p of this.people) {
            // let lightGoalPromise = this.agent.postSubGoal( new SenseOneLightGoal(l) )
            // lightsGoals.push(lightGoalPromise)

            let personGoalPromise = new Promise(async (res) => {
                while (true) {
                    await p.notifyChange("in_room", "positionSensor");
                    let new_room = p.in_room;
                    this.log("sense: " + p.name + " moved to " + new_room);
                    this.agent.beliefs.undeclare(
                        "person_in_room " + p.name + " " + p.previous_room,
                    );
                    this.agent.beliefs.declare("person_in_room " + p.name + " " + new_room);
                }
            });

            peopleGoals.push(personGoalPromise);
        }
        yield Promise.all(peopleGoals);
    }
}

module.exports = {
    SensePeoplePositionGoal,
    SensePeoplePositionIntention,
};
