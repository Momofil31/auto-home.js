const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");
const Observable = require("../../utils/Observable");
const chalk = require("chalk");
const { deviceColors: colors } = require("../../utils/chalkColors");

let nextId = 0;
class Fridge extends Observable {
    constructor(house, name) {
        super();
        this.house = house;
        this.name = name;
        this.id = global.deviceNextId++;
        this.set("status", "full"); // empty, half of full
    }
    headerError(header = "", ...args) {
        process.stderr.cursorTo(0);
        header = "\t\t" + header + " ".repeat(Math.max(50 - header.length, 0));
        console.error(chalk.bold.italic[colors[this.id % colors.length]](header, ...args));
    }
    error(...args) {
        this.headerError(this.name + " " + this.constructor.name, ...args);
    }
    headerLog(header = "", ...args) {
        process.stdout.cursorTo(0);
        header = "\t\t" + header + " ".repeat(Math.max(50 - header.length, 0));
        console.log(chalk[colors[this.id % colors.length]](header, ...args));
    }
    log(...args) {
        this.headerLog(this.name + " " + this.constructor.name, ...args);
    }
    takeFood() {
        if (this.status == "empty") {
            this.error("is empty, cannot take any food.");
            return false;
        }
        if (this.status == "full") {
            this.status = "half";
            this.log("is now half full.");
            return;
        }
        this.status = "half";
        this.log("is now empty.");
        return;
    }
    refillFood() {
        if (this.status == "full") {
            this.error("is full, cannot load more food.");
            return;
        }
        if (this.status == "empty") {
            this.status = "half";
            this.log("is now half full.");
            return;
        }
        this.status = "full";
        this.log("is now full.");
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
