const Observable = require("../utils/Observable");
const Person = require("./Person");
const { Light } = require("./devices/Light");
const { Shutter } = require("./devices/Shutter");
const CoffeMachine = require("./devices/CoffeMachine");
const GarageDoor = require("./devices/GarageDoor");
const { Dishwasher } = require("./devices/Dishwasher");
const { Fridge } = require("./devices/Fridge");

class House {
    constructor() {
        this.rooms = {
            kitchen: { name: "kitchen", doors_to: ["living_room"] },
            living_room: {
                name: "living_room",
                doors_to: ["kitchen", "hallway", "out"],
            },
            garage: { name: "garage", doors_to: ["hallway"] },
            bathroom_0: { name: "bathroom_0", doors_to: ["hallway"] },
            hallway: { name: "hallway", doors_to: ["bathroom_0", "living_room", "garage"] },
            out: { name: "out", doors_to: ["living_room"] },
        };
        this.people = {
            bob: new Person(this, "Bob", this.rooms.living_room.name),
        };
        this.devices = {
            shutters: {
                kitchen: new Shutter(this, "kitchen"),
                living_room: new Shutter(this, "living_room"),
                bathroom_0: new Shutter(this, "bathroom_0"),
            },
            lights: {
                kitchen: new Light(this, "kitchen"),
                living_room: new Light(this, "living_room"),
                garage: new Light(this, "garage"),
                bathroom_0: new Light(this, "bathroom_0"),
                hallway: new Light(this, "hallway"),
            },
            coffee_machine: new CoffeMachine(this, "coffee_machine"),
            dishwasher: new Dishwasher(this, "dishwasher"),
            fridge: new Fridge(this, "fridge"),
            garage_door: new GarageDoor(this, "garage"),
        };
        this.utilities = {
            electricity: new Observable({ consumption: 0 }),
        };
    }
}

module.exports = House;
