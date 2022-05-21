const Observable = require("../../utils/Observable");
const chalk = require("chalk");
const { deviceColors: colors } = require("../../utils/chalkColors");

class SimpleOnOffDevice extends Observable {
    static POWER = 10; // Watts
    constructor(house, name) {
        super();
        this.house = house; // reference to the house
        this.name = name; // non-observable
        this.id = global.deviceNextId++;
        this.set("status", "off"); // observable
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
    switchOn() {
        if (this.status == "on") {
            this.error("is already on.");
            return false;
        }
        this.status = "on";
        this.house.utilities.electricity.consumption += this.constructor.POWER;
        this.log("switched on.");
        return true;
    }
    switchOff() {
        if (this.status == "off") {
            this.error("is already off.");
            return false;
        }
        this.status = "off";
        this.house.utilities.electricity.consumption -= this.constructor.POWER;
        this.log("switched off.");
        return true;
    }
}

module.exports = SimpleOnOffDevice;
