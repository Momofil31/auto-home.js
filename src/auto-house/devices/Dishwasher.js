const Agent = require("../../bdi/Agent");
const Intention = require("../../bdi/Intention");
const Observable = require("../../utils/Observable");
const Clock = require("../../utils/Clock");
const Goal = require("../../bdi/Goal");
class Dishwasher extends Observable {
    static POWER = 2000; // Watts
    static WASHING_DURATION = 2; // hours
    constructor(house, name) {
        super();
        this.house = house;
        this.name = name;
        this.set("load", "empty"); // empty, half of full
        this.set("status", "idle"); // idle or washing
    }
    log(...args) {
        process.stdout.cursorTo(0);
        process.stdout.write("\t\t" + this.name);
        process.stdout.cursorTo(0);
        console.log("\t\t\t\t\t", ...args);
    }
    start() {
        if (this.load == "empty") {
            this.log(`${this.constructor.name} is empty, cannot start washing.`);
            return false;
        }
        if (this.status == "washing") {
            this.log(`${this.constructor.name} is already washing`);
            return false;
        }
        let startTime = { hh: Clock.global.hh, mm: Clock.global.mm };
        this.log(`${this.constructor.name} started washing.`);
        this.status = "washing";
        this.house.utilities.electricity.consumption += this.constructor.POWER;

        Clock.global.observe(
            "mm",
            (mm) => {
                let time = Clock.global;
                if (time.hh == startTime.hh + this.constructor.WASHING_DURATION && time.mm == startTime.mm) {
                    let dishwasher = this;
                    this.log(`${dishwasher.constructor.name} ended washing.`);
                    dishwasher.status = "idle";
                    dishwasher.load = "empty"; // assuming dishes are automatically put away
                    dishwasher.house.utilities.electricity.consumption -= this.constructor.POWER;
                    Clock.global.unobserve("mm", mm, "washingcycle_timer");
                }
            },
            "washingcycle_timer",
        );
    }

    loadDishes() {
        if (this.load == "full") {
            this.log(`${this.constructor.name} is full, cannot load more dishes.`);
            return;
        }
        if (this.load == "empty") {
            this.load = "half";
            this.log(`${this.constructor.name} is half full.`);
            return;
        }
        this.load = "full";
        this.log(`${this.constructor.name} is full.`);
        return;
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
