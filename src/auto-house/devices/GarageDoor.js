const SimpleOnOffDevice = require("./SimpleOnOffDevice");

class GarageDoor extends SimpleOnOffDevice {
    constructor(house, name) {
        super();
        this.house = house; // reference to the house
        this.name = name; // non-observable
        this.set("status", "open"); // observable
    }
    open() {
        if (this.status != "open") {
            this.status = "open";
            console.log(`${this.name} opened.`);
            return;
        }
        console.error(`${this.name} shutter is already open.`);
    }
    close() {
        if (this.status != "closed") {
            this.status = "closed";
            console.log(`${this.name} shutter closed.`);
            return;
        }
        console.error(`${this.name} shutter is already closed.`);
    }
}

module.exports = GarageDoor;
