// Device which actually do things in the house
const GenericDevice = require("./GenericDevice");
const Clock = require("../../utils/Clock");

class VacuumCleaner extends GenericDevice {
    static BATTERY_AUTONOMY = 200; // MINUTES
    constructor(house, name, chargingStationRoom, initialLocation) {
        super();
        this.house = house;
        this.name = name;
        this.id = global.deviceNextId++;
        this.set("in_room", initialLocation);
        this.set("battery", this.constructor.BATTERY_AUTONOMY);
        this.set("charging", false);
        this.chargingStationRoom = chargingStationRoom;
    }
    move(from, to) {
        if (this.in_room == to) {
            return false;
        }
        if (this.in_room != from) {
            return false;
        }
        if (to == "out") {
            return false;
        }
        if (!this.house.rooms[from].doors_to.includes(to)) {
            return false;
        }
        if (this.charging) {
            return false;
        }
        this.in_room = to;
        this.log("move", from, to);
        return true;
    }
    async suck(r) {
        if (this.in_room != r) {
            return false;
        }
        if (this.house.rooms[r].cleanStatus.status != "dirty") {
            return false;
        }
        if (this.charging) {
            return false;
        }
        // check if there is a person in room.
        for (let p of Object.values(this.house.people)) {
            if (p.in_room == r.name) {
                return false;
            }
        }
        this.log("suck", r);
        // TODO wait finishing sucking. Each suck should depend on in_room each room has different time encoded in house.
        let timeRemaining = this.house.rooms[r].suck_time;
        while (timeRemaining) {
            await Clock.global.notifyChange("mm", "waitForSucking");
            if (timeRemaining > 0) {
                timeRemaining = timeRemaining - Clock.TIME_STEP;
                this.battery -= Clock.TIME_STEP;
                if (this.battery <= 0) {
                    this.log("action failed: no battery");
                    this.battery = 0;
                }
            }
        }
        this.house.rooms[r].cleanStatus.status = "sucked";
        return true;
    }
    charge() {
        if (this.in_room != this.chargingStationRoom) {
            return false;
        }
        if (this.battery == this.constructor.BATTERY_AUTONOMY) {
            return false;
        }
        this.charging = true;
        this.log("charging");
        let timeRemaining = this.constructor.BATTERY_AUTONOMY - this.battery;
        Clock.global.observe(
            "mm",
            (mm) => {
                timeRemaining = timeRemaining - Clock.TIME_STEP;
                this.battery += Clock.TIME_STEP;
                if (timeRemaining == 0) {
                    this.log("charging completed");
                    Clock.global.unobserve("mm", "waitForCharging");
                    this.charging = false;
                    return true;
                }
            },
            "waitForCharging",
        );
        return true;
    }
}

module.exports = { VacuumCleaner };
