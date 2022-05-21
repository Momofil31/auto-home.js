const Observable = require("../../utils/Observable");

class SimpleOnOffDevice extends Observable {
    static POWER = 10; // Watts
    constructor(house, name) {
        super();
        this.house = house; // reference to the house
        this.name = name; // non-observable
        this.set("status", "off"); // observable
    }
    switchOn() {
        if (this.status == "on") {
            console.log(`${this.name} ${this.constructor.name} is already on.`);
            return false;
        }
        this.status = "on";
        this.house.utilities.electricity.consumption += this.constructor.POWER;
        console.log(`${this.name} ${this.constructor.name} switched on.`);
        return true;
    }
    switchOff() {
        if (this.status == "off") {
            console.log(`${this.name} ${this.constructor.name} is already off.`);
            return false;
        }
        this.status = "off";
        this.house.utilities.electricity.consumption -= this.constructor.POWER;
        console.log(`${this.name} ${this.constructor.name} switched off.`);
        return true;
    }
}

module.exports = SimpleOnOffDevice;
