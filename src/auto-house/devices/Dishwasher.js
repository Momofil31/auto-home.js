const Agent = require("../../bdi/Agent");
const Intention = require("../../bdi/Intention");
const Observable = require("../../utils/Observable");
const Clock = require("../../utils/Clock");
const Goal = require("../../bdi/Goal");
class Dishwasher extends Observable {
    static POWER = 2000; // Watts
    constructor(house, name) {
        super();
        this.house = house;
        this.name = name;
        this.set("load", "empty"); // empty, half of full
        this.set("status", "idle"); // idle or washing
    }

    start() {
        if (this.load == "empty") {
            console.log(`${this.name} ${this.constructor.name} is empty, cannot start washing.`);
            return false;
        }
        if (this.status == "washing") {
            console.log(`${this.name} ${this.constructor.name} is already washing`);
            return false;
        }
        // this agent is not a real agent but only to exploit intentions
        // to stop the washing after 2 hours
        let dishwasherCycle = new Agent("dishwasher cycle");
        dishwasherCycle.intentions.push(DishwashingIntention);
        dishwasherCycle.postSubGoal(
            new DishwasherGoal({ dishwasher: this, hh: Clock.global.hh, mm: Clock.global.mm }),
        );
        this.status = "washing";
        this.house.utilities.electricity.consumption += this.POWER;
    }

    loadDishes() {
        if (this.load == "full") {
            console.log(`${this.name} ${this.constructor.name} is full, cannot load more dishes.`);
            return;
        }
        if (this.load == "empty") {
            this.load = "half";
            console.log(`${this.name} ${this.constructor.name} is half full.`);
            return;
        }
        this.load = "full";
        console.log(`${this.name} ${this.constructor.name} is full.`);
        return;
    }
}
class DishwasherGoal extends Goal {}
class DishwashingIntention extends Intention {
    static applicable(goal) {
        return goal instanceof DishwasherGoal;
    }
    *exec() {
        while (true) {
            yield Clock.global.notifyChange("mm", "dishwashingCycle");
            if (
                Clock.global.hh == this.goal.parameters.hh + 2 &&
                Clock.global.mm == this.goal.parameters.mm
            ) {
                let dishwasher = this.goal.parameters.dishwasher;
                this.log(`${dishwasher.name} ended washing.`);
                dishwasher.status = "idle";
                dishwasher.load = "empty"; // assuming dishes are automatically put away
                dishwasher.house.utilities.electricity.consumption -= dishwasher.POWER;
                break;
            }
        }
    }
}

class StartDishwasherGoal extends Goal {}
class StartDishwasherIntention extends Intention {
    static applicable(goal) {
        return goal instanceof StartDishwasherGoal;
    }
    *exec() {
        let dishwasher = this.goal.parameters.dishwasher;
        while (true) {
            yield dishwasher.notifyChange("load", "startDishwasher");
            let dishwasherLoad = dishwasher.load;
            if (dishwasherLoad == "full") {
                dishwasher.start();
            }
        }
    }
}

module.exports = { Dishwasher, StartDishwasherGoal, StartDishwasherIntention };
