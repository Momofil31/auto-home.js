const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");
const Clock = require("../../utils/Clock");
const Observable = require("../../utils/Observable");

class Shutter extends Observable {
    constructor(house, name) {
        super();
        this.house = house; // reference to the house
        this.name = name; // non-observable
        this.set("status", "down"); // observable
    }
    moveUp() {
        if (this.status != "up") {
            this.status = "up";
            console.log(`${this.name} shutter moved up.`);
            return;
        }
        console.log(`${this.name} shutter is already up.`);
    }
    moveDown() {
        if (this.status != "down") {
            this.status = "down";
            console.log(`${this.name} shutter moved down.`);
            return;
        }
        console.log(`${this.name} shutter is already down.`);
    }
}

class ManageShuttersGoal extends Goal {}
class ManageShuttersIntention extends Intention {
    static applicable(goal) {
        return goal instanceof ManageShuttersGoal;
    }
    *exec() {
        let shutters = this.goal.parameters.shutters;
        let people = this.goal.parameters.people;
        let shuttersPromises = [];
        for (let p of Object.values(people)) {
            let shutterPersonPromise = new Promise(async (res) => {
                while (true) {
                    // close when every person is out or past some our
                    await p.notifyChange("in_room", "manageShutter");
                    let new_room = p.in_room;
                    let prev_room = p.previous_room;
                    if (new_room == "out" && this.isEverybodyOut(people)) {
                        for (let s of Object.values(shutters)) {
                            if (s.status == "up") {
                                s.moveDown();
                            }
                        }
                    } else if (prev_room == "out" && Clock.global.hh <= 22 && Clock.global.hh >= 7) {
                        for (let s of Object.values(shutters)) {
                            if (s.status == "down") {
                                s.moveUp();
                            }
                        }
                    }
                }
            });
            shuttersPromises.push(shutterPersonPromise);
        }
        let shutterHourPromise = new Promise(async (res) => {
            while (true) {
                await Clock.global.notifyChange("hh", "manageShutter");
                let hh = Clock.global.hh;
                if (hh == 22) {
                    for (let s of Object.values(shutters)) {
                        if (s.status == "up") {
                            s.moveDown();
                        }
                    }
                }
                if (hh == 7 && !this.isEverybodyOut(people)) {
                    for (let s of Object.values(shutters)) {
                        if (s.status == "down") {
                            s.moveUp();
                        }
                    }
                }
            }
        });
        shuttersPromises.push(shutterHourPromise);
        yield Promise.all(shuttersPromises);
    }
    isEverybodyOut(people) {
        return !Object.values(people).find((p) => {
            return p.in_room != "out";
        });
    }
}

module.exports = { Shutter, ManageShuttersGoal, ManageShuttersIntention };
