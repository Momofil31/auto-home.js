const Agent = require("../../bdi/Agent");
const Intention = require("../../bdi/Intention");
const Goal = require("../../bdi/Goal");

class HouseAgent extends Agent {
    constructor(name, house) {
        super(name);
        this.house = house;
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
                    }
                }
            });

            peopleCoffeeDesirePromises.push(peopleCoffeeDesirePromise);
        }
        yield Promise.all(peopleCoffeeDesirePromises);
    }
}

module.exports = { HouseAgent, MakeCoffeeGoal, MakeCoffeeIntention };
