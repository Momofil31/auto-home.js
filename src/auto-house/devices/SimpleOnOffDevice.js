const Observable = require("../../utils/Observable");

class SimpleOnOffDevice extends Observable {
    static POWER = 10; // Watts
    constructor(house, name) {
        super();
        this.house = house; // reference to the house
        this.name = name; // non-observable
        this.set("status", "off"); // observable
    }
    log(...args) {
        process.stdout.cursorTo(0);
        process.stdout.write("\t\t" + this.name);
        process.stdout.cursorTo(0);
        console.log("\t\t\t\t\t", ...args);
    }
    switchOn() {
        if (this.status == "on") {
            this.log(`${this.constructor.name} is already on.`);
            return false;
        }
        this.status = "on";
        this.house.utilities.electricity.consumption += this.constructor.POWER;
        this.log(`${this.constructor.name} switched on.`);
        return true;
    }
    switchOff() {
        if (this.status == "off") {
            this.log(`${this.constructor.name} is already off.`);
            return false;
        }
        this.status = "off";
        this.house.utilities.electricity.consumption -= this.constructor.POWER;
        this.log(`${this.constructor.name} switched off.`);
        return true;
    }
}

module.exports = SimpleOnOffDevice;
