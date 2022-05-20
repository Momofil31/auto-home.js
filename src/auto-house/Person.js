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
    moveTo(to) {
        if (this.in_room == to) {
            console.log(`${this.name} \t stays in ${this.in_room}`);
            return false;
        }
        if (!this.house.rooms[this.in_room].doors_to.includes(to)) {
            console.log(`${this.name} \t failed moving from ${this.in_room} to ${to}`);
            return false;
        }
        // for object: to in this.house.rooms[this.in_room].doors_to
        console.log(`${this.name} \t moved from ${this.in_room} to ${to}`);
        this.previous_room = this.in_room;
        this.in_room = to;
        return true;
    }
    eatBreakfast() {
        if (this.in_room != "kitchen") {
            console.log(`${this.name} cannot have breakfast. Not in the kitchen.`);
            return false;
        }
        this.house.devices.dishwasher.loadDishes();
        console.log(`${this.name} has eaten breakfast and put dirty dishes in the dishwasher.`);
        return true;
    }
}

module.exports = Person;
