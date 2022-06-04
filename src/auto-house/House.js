const Observable = require("../utils/Observable");
const Person = require("./Person");
const { Light } = require("./devices/Light");
const { Shutter } = require("./devices/Shutter");
const { CoffeeMachine } = require("./devices/CoffeeMachine");
const GarageDoor = require("./devices/GarageDoor");
const { Dishwasher } = require("./devices/Dishwasher");
const { Fridge } = require("./devices/Fridge");
const Temperature = require("./helpers/Temperature");
const { Thermostat } = require("./devices/Thermostat");
const { Car } = require("./devices/Car");
const chalk = require("chalk");
const { deviceColors: colors } = require("../utils/chalkColors");

class House {
    static DIRTINESS = 0; // between 0 and 1
    constructor() {
        this.name = "house";
        this.id = global.deviceNextId++;
        this.rooms = {
            kitchen: {
                name: "kitchen",
                doors_to: ["living_room"],
                temperature: new Temperature(),
                cleanStatus: new Observable({ status: "clean" }),
                suck_time: 25,
                clean_time: 30,
            },
            living_room: {
                name: "living_room",
                doors_to: ["kitchen", "hallway", "out"],
                temperature: new Temperature(),
                cleanStatus: new Observable({ status: "clean" }),
                suck_time: 20,
                clean_time: 25,
            },
            garage: {
                name: "garage",
                doors_to: ["hallway", "out"],
                temperature: new Temperature(),
                cleanStatus: new Observable({ status: "clean" }),
                suck_time: 20,
                clean_time: 25,
            },
            bathroom_0: {
                name: "bathroom_0",
                doors_to: ["hallway"],
                temperature: new Temperature(),
                cleanStatus: new Observable({ status: "clean" }),
                suck_time: 10,
                clean_time: 15,
            },
            utility_room: {
                name: "utility_room",
                doors_to: ["hallway"],
                temperature: new Temperature(),
                cleanStatus: new Observable({ status: "clean" }),
                suck_time: 5,
                clean_time: 5,
            },
            hallway: {
                name: "hallway",
                doors_to: ["bathroom_0", "living_room", "garage", "stairs", "utility_room"],
                temperature: new Temperature(),
                cleanStatus: new Observable({ status: "clean" }),
                suck_time: 5,
                clean_time: 5,
            },
            stairs: {
                name: "stairs",
                doors_to: ["hallway", "hallway_upstairs"],
                temperature: new Temperature(),
                cleanStatus: new Observable({ status: "clean" }),
                suck_time: 5,
                clean_time: 5,
            },
            hallway_upstairs: {
                name: "hallway_upstairs",
                doors_to: ["stairs", "master_bedroom", "bedroom_0", "bedroom_1", "bathroom_1"],
                temperature: new Temperature(),
                cleanStatus: new Observable({ status: "clean" }),
                suck_time: 5,
                clean_time: 5,
            },
            master_bedroom: {
                name: "master_bedroom",
                doors_to: ["hallway_upstairs"],
                temperature: new Temperature(),
                cleanStatus: new Observable({ status: "clean" }),
                suck_time: 15,
                clean_time: 20,
            },
            bedroom_0: {
                name: "bedroom_0",
                doors_to: ["hallway_upstairs"],
                temperature: new Temperature(),
                cleanStatus: new Observable({ status: "clean" }),
                suck_time: 10,
                clean_time: 15,
            },
            bedroom_1: {
                name: "bedroom_1",
                doors_to: ["hallway_upstairs"],
                temperature: new Temperature(),
                cleanStatus: new Observable({ status: "clean" }),
                suck_time: 10,
                clean_time: 15,
            },
            bathroom_1: {
                name: "bathroom_1",
                doors_to: ["hallway_upstairs"],
                temperature: new Temperature(),
                cleanStatus: new Observable({ status: "clean" }),
                suck_time: 10,
                clean_time: 15,
            },
            out: {
                name: "out",
                doors_to: ["living_room", "garage"],
                temperature: new Temperature(),
            },
        };
        this.people = {
            bob: new Person(this, "Bob", this.rooms.living_room.name),
            alice: new Person(this, "Alice", this.rooms.living_room.name),
        };
        this.devices = {
            shutters: {
                kitchen: new Shutter(this, "kitchen"),
                living_room: new Shutter(this, "living_room"),
                bathroom_0: new Shutter(this, "bathroom_0"),
                stairs: new Shutter(this, "stairs"),
                bathroom_1: new Shutter(this, "bathroom_1"),
                master_bedroom: new Shutter(this, "master_bedroom"),
                bedroom_0: new Shutter(this, "bedroom_0"),
                bedroom_1: new Shutter(this, "bedroom_1"),
            },
            lights: {
                kitchen: new Light(this, "kitchen"),
                living_room: new Light(this, "living_room"),
                garage: new Light(this, "garage"),
                bathroom_0: new Light(this, "bathroom_0"),
                hallway: new Light(this, "hallway"),
                stairs: new Light(this, "stairs"),
                hallway_upstairs: new Light(this, "hallway_upstairs"),
                bathroom_1: new Light(this, "bathroom_1"),
                master_bedroom: new Light(this, "master_bedroom"),
                bedroom_0: new Light(this, "bedroom_0"),
                bedroom_1: new Light(this, "bedroom_1"),
                utility_room: new Light(this, "utility_room"),
            },
            coffee_machine: new CoffeeMachine(this, "coffee_machine"),
            dishwasher: new Dishwasher(this, "dishwasher"),
            fridge: new Fridge(this, "fridge"),
            garage_door: new GarageDoor(this, "garage"),
            thermostat: new Thermostat(this, "thermostat"),
            car: new Car(this, "car"),
        };
        this.utilities = {
            electricity: new Observable({ consumption: 0 }),
        };
    }
    headerLog(header = "", ...args) {
        process.stdout.cursorTo(0);
        header = "\t\t" + header + " ".repeat(Math.max(50 - header.length, 0));
        console.log(chalk[colors[this.id % colors.length]](header, ...args));
    }
    log(...args) {
        this.headerLog(this.name + " " + this.constructor.name, ...args);
    }
    headerError(header = "", ...args) {
        process.stderr.cursorTo(0);
        header = "\t\t" + header + " ".repeat(Math.max(50 - header.length, 0));
        console.error(chalk.bold.italic[colors[this.id % colors.length]](header, ...args));
    }
    error(...args) {
        this.headerError(this.name + " " + this.constructor.name, ...args);
    }
    setRandomRoomsDirty() {
        for (let r of Object.values(this.rooms)) {
            if (r.name != "out") {
                r.cleanStatus.status =
                    Math.random() > this.constructor.DIRTINESS ? "dirty" : "clean";
            }
        }
        this.log("set random rooms dirty");
    }
}

module.exports = { House };
