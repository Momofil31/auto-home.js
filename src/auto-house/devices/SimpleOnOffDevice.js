const GenericDevice = require("./GenericDevice");

class SimpleOnOffDevice extends GenericDevice {
    static POWER = 10; // Watts
    constructor(house, name) {
        super();
        this.house = house; // reference to the house
        this.name = name; // non-observable
        this.id = global.deviceNextId++;
        this.set("status", "off"); // observable
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
