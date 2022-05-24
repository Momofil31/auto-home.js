const Intention = require("../../bdi/Intention");
// const Observable = require("../../utils/Observable");
const Clock = require("../../utils/Clock");
const Goal = require("../../bdi/Goal");
// const chalk = require("chalk");
// const { deviceColors: colors } = require("../../utils/chalkColors");
const GenericDevice = require("./GenericDevice");

class Dishwasher extends GenericDevice {
    static POWER = 2000; // Watts
    static WASHING_DURATION = 2; // hours
    constructor(house, name) {
        super();
        this.house = house;
        this.name = name;
        this.id = global.deviceNextId++;
        this.set("load", "empty"); // empty, half of full
        this.set("status", "idle"); // idle or washing
    }
    start() {
        if (this.load == "empty") {
            this.error("is empty, cannot start washing.");
            return false;
        }
        if (this.status == "washing") {
            this.error("is already washing");
            return false;
        }
        let startTime = { hh: Clock.global.hh, mm: Clock.global.mm };
        this.log("started washing.");
        this.status = "washing";
        this.house.utilities.electricity.consumption += this.constructor.POWER;

        Clock.global.observe(
            "mm",
            (mm) => {
                let time = Clock.global;
                if (
                    time.hh == (startTime.hh + this.constructor.WASHING_DURATION) % 24 &&
                    time.mm == startTime.mm
                ) {
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
            this.error("is full, cannot load more dishes.");
            return;
        }
        if (this.load == "empty") {
            this.load = "half";
            this.log("is now half full.");
            return;
        }
        this.load = "full";
        this.log("is now full.");
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
