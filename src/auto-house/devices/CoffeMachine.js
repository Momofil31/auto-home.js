const SimpleOnOffDevice = require("./SimpleOnOffDevice");

class CoffeeMachine extends SimpleOnOffDevice {
    static POWER = 15;
    makeCoffee() {
        if (this.status != "on") {
            this.log("Cannot make coffee. Coffee machine is off.");
            return false;
        }
        this.log("Coffee is ready!");
        return true;
    }
}

module.exports = CoffeeMachine;
