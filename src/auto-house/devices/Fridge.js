const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");
const Observable = require("../../utils/Observable");

class Fridge extends Observable {
    constructor(house, name) {
        super();
        this.house = house;
        this.name = name;
        this.set("status", "full"); // empty, half of full
    }
    log(...args) {
        process.stdout.cursorTo(0);
        process.stdout.write("\t\t" + this.name);
        process.stdout.cursorTo(0);
        console.log("\t\t\t\t\t", ...args);
    }
    takeFood() {
        if (this.status == "empty") {
            this.log(`${this.constructor.name} is empty, cannot take any food.`);
            return false;
        }
        if (this.status == "full") {
            this.status = "half";
            this.log(`${this.constructor.name} is now half full.`);
            return;
        }
        this.status = "half";
        this.log(`${this.constructor.name} is now empty.`);
        return;
    }
    refillFood() {
        if (this.status == "full") {
            this.log(`${this.constructor.name} is full, cannot load more food.`);
            return;
        }
        if (this.status == "empty") {
            this.status = "half";
            this.log(`${this.constructor.name} is now half full.`);
            return;
        }
        this.status = "full";
        this.log(`${this.constructor.name} is now full.`);
        return;
    }
}

class notifyFoodShortageGoal extends Goal {}

class notifyFoodShortageIntention extends Intention {
    static applicable(goal) {
        return goal instanceof notifyFoodShortageGoal;
    }
    *exec() {
        let fridge = this.goal.parameters.fridge;
        while (true) {
            yield fridge.notifyChange("status", "notifyFoodShortage");
            let fridgeStatus = fridge.status;
            if (fridgeStatus == "half" || fridgeStatus == "empty") {
                this.log(
                    `SMARTPHONE NOTIFICATION: ${fridge.name} is now half full. Please, do the shopping.`,
                );
            }
        }
    }
}

module.exports = { Fridge, notifyFoodShortageGoal, notifyFoodShortageIntention };
