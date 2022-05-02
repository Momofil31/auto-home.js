const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");
const SimpleOnOffDevice = require("./SimpleOnOffDevice");
const Clock = require("../../utils/Clock");

class Light extends SimpleOnOffDevice {
    static POWER = 4; // Watts
}

class LightsFollowPeopleGoal extends Goal {}

class LightsFollowPeopleIntention extends Intention {
    static applicable(goal) {
        return goal instanceof LightsFollowPeopleGoal;
    }
    *exec() {
        let lights = this.goal.parameters.lights;
        let shutters = this.goal.parameters.shutters;
        let people = this.goal.parameters.people;
        let followPeoplePromises = [];
        for (let p of Object.values(people)) {
            let followPersonPromise = new Promise(async (res) => {
                while (true) {
                    await p.notifyChange("in_room", "lightFollowPerson");
                    let new_room = p.in_room;
                    let previous_room = p.previous_room;
                    if (
                        Clock.global.hh > 7 &&
                        Clock.global.hh < 19 &&
                        new_room in shutters &&
                        shutters[new_room].status == "up"
                    ) {
                        // light hours
                        continue;
                    }
                    if (new_room in lights && lights[new_room].status != "on") {
                        lights[new_room].switchOn();
                    }
                    // if nobody is in the previous room switchOff light
                    if (!this.isSomeoneInRoom(people, previous_room)) {
                        if (previous_room in lights && lights[previous_room].status != "off") {
                            lights[previous_room].switchOff();
                        }
                    }
                }
            });
            followPeoplePromises.push(followPersonPromise);
        }
        yield Promise.all(followPeoplePromises);
    }
    isSomeoneInRoom(people, room) {
        Object.values(people).find((p) => {
            return p.in_room == room;
        });
    }
}

class LightsFollowShuttersGoal extends Goal {}

class LightsFollowShuttersIntention extends Intention {
    static applicable(goal) {
        return goal instanceof LightsFollowShuttersGoal;
    }
    isSomeoneInRoom(people, room) {
        Object.values(people).find((p) => {
            return p.in_room == room;
        });
    }
    *exec() {
        let lights = this.goal.parameters.lights;
        let shutters = this.goal.parameters.shutters;
        let people = this.goal.parameters.people;
        let followPeoplePromises = [];
        for (let s of Object.values(shutters)) {
            let followShutterPromise = new Promise(async (res) => {
                while (true) {
                    await s.notifyChange("status", "lightFollowShutter");
                    let status = s.status;
                    if (Clock.global.hh >= 7 && Clock.global.hh <= 19 && status == "up") {
                        // light hours -> turn off lights if were on
                        for (let l of Object.values(lights)) {
                            if (l.status == "on") {
                                l.switchOff();
                            }
                        }
                    } else if (status == "down" && this.isSomeoneInRoom(people, s)) {
                        for (let l of Object.values(lights)) {
                            if (l.status == "off") {
                                l.switchOn();
                            }
                        }
                    }
                }
            });
            followPeoplePromises.push(followShutterPromise);
        }
        yield Promise.all(followPeoplePromises);
    }
}

module.exports = {
    Light,
    LightsFollowPeopleGoal,
    LightsFollowPeopleIntention,
    LightsFollowShuttersGoal,
    LightsFollowShuttersIntention,
};
