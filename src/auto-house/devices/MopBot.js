// Device which actually do things in the house
const GenericDevice = require("./GenericDevice");
const Clock = require("../../utils/Clock");

class MopBot extends GenericDevice {
    constructor(house, name, chargingStationRoom, initialLocation) {
        super();
        this.house = house;
        this.name = name;
        this.id = global.deviceNextId++;
        this.set("in_room", initialLocation);
        this.set("battery", 100);
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
    async clean(r) {
        if (this.in_room != r) {
            return false;
        }
        if (this.house.rooms[r].cleanStatus.status != "sucked") {
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

        this.log("cleaning", r);

        let timeRemaining = this.house.rooms[r].clean_time;
        while (timeRemaining) {
            await Clock.global.notifyChange("mm", "waitForCleaning");
            if (timeRemaining > 0) {
                timeRemaining = timeRemaining - Clock.TIME_STEP;
                this.battery -= Clock.TIME_STEP;
            }
        }
        this.house.rooms[r].cleanStatus.status = "clean";
        return true;
    }
    charge() {
        if (this.in_room != this.chargingStationRoom) {
            return false;
        }
        if (this.battery == 100) {
            return false;
        }
        this.charging = true;
        this.log("charging");
        let timeRemaining = 100 - this.battery;
        Clock.global.observe(
            "mm",
            (mm) => {
                timeRemaining = timeRemaining - Clock.TIME_STEP;
                this.battery += Clock.TIME_STEP;
                if (timeRemaining == 0) {
                    this.log("charging completed");
                    this.charging = false;
                    Clock.global.unobserve("mm", "waitForCharging");
                    return;
                }
            },
            "waitForCharging",
        );
    }
}

module.exports = { MopBot };
