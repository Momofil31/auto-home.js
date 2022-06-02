const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");
const GenericDevice = require("./GenericDevice");

class Fridge extends GenericDevice {
    constructor(house, name) {
        super();
        this.house = house;
        this.name = name;
        this.id = global.deviceNextId++;
        this.set("status", "full"); // empty, half of full
    }
    takeFood() {
        if (this.status == "empty") {
            this.error("is empty, cannot take any food.");
            return false;
        }
        if (this.status == "full") {
            this.status = "half";
            this.log("is now half full.");
            return true;
        }
        this.status = "empty";
        this.log("is now empty.");
        return true;
    }
    refillFood() {
        if (this.status == "full") {
            this.error("is full, cannot load more food.");
            return false;
        }
        if (this.status == "empty") {
            this.status = "half";
            this.log("is now half full.");
            return true;
        }
        this.status = "full";
        this.log("is now full.");
        return true;
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
