const SimpleOnOffDevice = require("./SimpleOnOffDevice");
const Intention = require("../../bdi/Intention");
const Goal = require("../../bdi/Goal");
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

class MakeCoffeeGoal extends Goal {}
class MakeCoffeeIntention extends Intention {
    static applicable(goal) {
        return goal instanceof MakeCoffeeGoal;
    }
    *exec() {
        let peopleCoffeeDesirePromises = [];
        let coffee_machine = this.goal.parameters.coffee_machine;
        let people = this.goal.parameters.people;
        for (let p of Object.values(people)) {
            let peopleCoffeeDesirePromise = new Promise(async (res) => {
                while (true) {
                    await p.notifyChange("wantsToHaveCoffee", "MakeCoffee");
                    if (p.wantsToHaveCoffee == true) {
                        this.log(p.name + " wants to have coffee");
                        coffee_machine.status = "on";
                        coffee_machine.makeCoffee();
                        coffee_machine.status = "off";
                        p.wantsToHaveCoffee = false;
                    }
                }
            });

            peopleCoffeeDesirePromises.push(peopleCoffeeDesirePromise);
        }
        yield Promise.all(peopleCoffeeDesirePromises);
    }
}

module.exports = { CoffeeMachine, MakeCoffeeGoal, MakeCoffeeIntention };
