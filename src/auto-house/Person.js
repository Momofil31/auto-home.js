const Observable = require("../utils/Observable");
const { v4: uuidv4 } = require("uuid");

class Person extends Observable {
    constructor(house, name, room) {
        super();
        this.house = house; // reference to the house
        this.name = name; // non-observable
        this.uuid = uuidv4();
        this.set("in_room", room); // observable
        this.previous_room = room;
        // this.observe( 'in_room', v => console.log(this.name, 'moved to', v) )    // observe
    }
    log(...args) {
        process.stdout.cursorTo(0);
        process.stdout.write("\t\t" + this.name);
        process.stdout.cursorTo(0);
        console.log("\t\t\t\t\t", ...args);
    }
    moveTo(to) {
        if (this.in_room == to) {
            this.log(`stays in ${this.in_room}`);
            return false;
        }
        if (!this.house.rooms[this.in_room].doors_to.includes(to)) {
            this.log(`failed moving from ${this.in_room} to ${to}`);
            return false;
        }
        // for object: to in this.house.rooms[this.in_room].doors_to
        this.log(`moved from ${this.in_room} to ${to}`);
        this.previous_room = this.in_room;
        this.in_room = to;
        return true;
    }
    eatBreakfast() {
        if (this.in_room != "kitchen") {
            this.log("cannot have breakfast. Not in the kitchen.");
            return false;
        }
        this.house.devices.fridge.takeFood();
        this.house.devices.dishwasher.loadDishes();
        this.log("has eaten breakfast.");
        return true;
    }
    doShopping() {
        this.log("has bought food.");
        this.observe(
            "in_room",
            (in_room) => {
                if (this.in_room != "out" && this.previous_room == "out") {
                    this.log("has put food in fridge");
                    this.house.devices.fridge.refillFood();
                    this.unobserve("in_room", in_room, "doShopping");
                }
            },
            "doShopping",
        );
    }
}

module.exports = Person;
