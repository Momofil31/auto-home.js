const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");
const GenericDevice = require("./GenericDevice");

class Thermostat extends GenericDevice {
    constructor(house, name) {
        super();
        this.name = name;
        this.house = house;
        this.id = global.deviceNextId++;
        this.rooms = this.house.rooms;
    }

    /**
     * Repeats some text a given number of times.
     *
     * @param {string} roomName - The room name
     * @param {number} temperature - Temperature to set
     */
    setTemperature(roomName, temperature = 18) {
        let room = this.getRoom(roomName);
        if (room == null || room == undefined) {
            this.error(`room ${roomName} not found.`);
            return;
        }
        if (room.temperature.degrees == temperature) {
            this.error(`temperature of room ${room.name} already at ${temperature} degrees.`);
            return;
        }
        if (room.temperature.degrees < temperature) {
            this.log(
                `temperature of room ${room.name} increased to ${temperature} degrees. Heating started.`,
            );
            room.temperature.degrees = temperature;
            return;
        }
        if (room.temperature.degrees > temperature) {
            this.log(
                `temperature of room ${room.name} decreased to ${temperature} degrees. Air conditioner started.`,
            );
            room.temperature.degrees = temperature;
            return;
        }
    }
    getRoom(roomName) {
        let rooms = this.house.rooms;
        for (let r of Object.values(rooms)) {
            if (r.name == roomName) {
                return r;
            }
        }
        return null;
    }
}

class ManageThermostatGoal extends Goal {}
class ManageThermostatIntention extends Intention {
    static applicable(goal) {
        return goal instanceof ManageThermostatGoal;
    }
    *exec() {
        let people = this.goal.parameters.people;
        let thermostat = this.goal.parameters.thermostat;
        let adjustThermostatPromises = [];
        for (let p of Object.values(people)) {
            let adjustThermostatPromise = new Promise(async (res) => {
                while (true) {
                    // close when every person is out or past some our
                    await p.notifyChange("temperatureFeeling", "manageThermostat");
                    let temperatureFeeling = p.temperatureFeeling;

                    // if person is cold or hot adjust temperature of the room they're in
                    if (temperatureFeeling != 0) {
                        let currentTemp = thermostat.getRoom(p.in_room).temperature.degrees;
                        let newTemp = temperatureFeeling > 0 ? currentTemp - 2 : currentTemp + 2;
                        thermostat.setTemperature(p.in_room, newTemp);
                        p.setOkTemperature();
                    }
                }
            });
            adjustThermostatPromises.push(adjustThermostatPromise);
        }

        yield Promise.all(adjustThermostatPromises);
    }
}

module.exports = { Thermostat, ManageThermostatGoal, ManageThermostatIntention };
