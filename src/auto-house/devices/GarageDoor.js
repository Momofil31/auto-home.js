const SimpleOnOffDevice = require("./SimpleOnOffDevice");

class GarageDoor extends SimpleOnOffDevice {
    constructor(house, name) {
        super();
        this.house = house; // reference to the house
        this.name = name; // non-observable
        this.id = global.deviceNextId++;
        this.set("status", "closed"); // observable
    }
    open() {
        if (this.status != "open") {
            this.status = "open";
            this.log("opened.");
            return;
        }
        this.error("is already open.");
    }
    close() {
        if (this.status != "closed") {
            this.status = "closed";
            this.log("closed.");
            return;
        }
        this.error("is already closed.");
    }
}

module.exports = GarageDoor;
