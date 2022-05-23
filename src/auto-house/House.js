const Observable = require("../utils/Observable");
const Person = require("./Person");
const { Light } = require("./devices/Light");
const { Shutter } = require("./devices/Shutter");
const CoffeMachine = require("./devices/CoffeMachine");
const GarageDoor = require("./devices/GarageDoor");
const { Dishwasher } = require("./devices/Dishwasher");
const { Fridge } = require("./devices/Fridge");
const Temperature = require("./helpers/Temperature");
const { Thermostat } = require("./devices/Thermostat");

class House {
    constructor() {
        this.rooms = {
            kitchen: { name: "kitchen", doors_to: ["living_room"], temperature: new Temperature() },
            living_room: {
                name: "living_room",
                doors_to: ["kitchen", "hallway", "out"],
                temperature: new Temperature(),
            },
            garage: { name: "garage", doors_to: ["hallway"], temperature: new Temperature() },
            bathroom_0: {
                name: "bathroom_0",
                doors_to: ["hallway"],
                temperature: new Temperature(),
            },
            hallway: {
                name: "hallway",
                doors_to: ["bathroom_0", "living_room", "garage"],
                temperature: new Temperature(),
            },
            out: { name: "out", doors_to: ["living_room"], temperature: new Temperature() },
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
            thermostat: new Thermostat(this, "thermostat"),
        };
        this.utilities = {
            electricity: new Observable({ consumption: 0 }),
        };
    }
}

module.exports = House;
