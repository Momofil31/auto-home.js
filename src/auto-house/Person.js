const Observable = require("../utils/Observable");
const { v4: uuidv4 } = require("uuid");
const chalk = require("chalk");
const { personColors: colors } = require("../utils/chalkColors");
let nextId = 0;
class Person extends Observable {
    constructor(house, name, room) {
        super();
        this.house = house; // reference to the house
        this.name = name; // non-observable
        this.id = nextId++ % colors.length;
        this.uuid = uuidv4();
        this.set("in_room", room); // observable
        this.previous_room = room;
        this.set("temperatureFeeling", 0); // 0 -> ok, 1 -> feel hot, -1 -> feel cold
        this.set("wantsToHaveCoffee", false);
        // this.observe( 'in_room', v => console.log(this.name, 'moved to', v) )    // observe
    }
    headerLog(header = "", ...args) {
        process.stdout.cursorTo(0);
        header = "\t\t" + header + " ".repeat(Math.max(50 - header.length, 0));
        console.log(chalk[colors[this.id % colors.length]](header, ...args));
    }

    log(...args) {
        this.headerLog(this.name, ...args);
    }
    headerError(header = "", ...args) {
        process.stderr.cursorTo(0);
        header = "\t\t" + header + " ".repeat(Math.max(50 - header.length, 0));
        console.error(chalk.bold.italic[colors[this.id % colors.length]](header, ...args));
    }
    error(...args) {
        this.headerError(this.name + " " + this.constructor.name, ...args);
    }
    async moveTo(to, useCar = false) {
        if (this.in_room == to) {
            this.log(`stays in ${this.in_room}`);
            return false;
        }
        if (!this.house.rooms[this.in_room].doors_to.includes(to)) {
            this.log(`failed moving from ${this.in_room} to ${to}`);
            return false;
        }
        if (this.in_room == "garage" && to == "out" && useCar) {
            await this.house.devices.car.drive(this);
        } else if (
            this.in_room == "out" &&
            to == "garage" &&
            this.house.devices.car.driver == this
        ) {
            await this.house.devices.car.park();
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
        this.wantsToHaveCoffee = true;
        let res = this.house.devices.fridge.takeFood();
        if (!res) {
            this.error("Cannot have breakfast. Taking food from fridge failed.");
            return false;
        }
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
    setCold() {
        this.temperatureFeeling = -1;
        this.log("is now cold.");
    }
    setHot() {
        this.temperatureFeeling = 1;
        this.log("is now cold.");
    }
    setOkTemperature() {
        this.temperatureFeeling = 0;
        this.log("is now nor hot nor cold.");
    }
}

module.exports = Person;
