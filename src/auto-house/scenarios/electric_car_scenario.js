const { House } = require("../House");
const Agent = require("../../bdi/Agent");
const { HouseAgent } = require("../agents/HouseAgent");
const Clock = require("../../utils/Clock");
const {
    LightsFollowPeopleIntention,
    LightsFollowPeopleGoal,
    LightsFollowShuttersGoal,
    LightsFollowShuttersIntention,
} = require("../devices/Light");
const { ManageShuttersGoal, ManageShuttersIntention } = require("../devices/Shutter");
const {
    ManageCarParkingIntention,
    ManageCarParkingGoal,
    ChargeCarGoal,
    ChargeCarIntention,
} = require("../devices/Car");

global.deviceNextId = 0;
// House, which includes rooms and devices
let house = new House();
delete house.people.alice;

// Agents
let houseAgent = new HouseAgent("house_agent");

houseAgent.intentions.push(LightsFollowPeopleIntention);
houseAgent.intentions.push(LightsFollowShuttersIntention);
houseAgent.intentions.push(ChargeCarIntention);

houseAgent.postSubGoal(
    new LightsFollowPeopleGoal({
        people: house.people,
        lights: house.devices.lights,
        shutters: house.devices.shutters,
    }),
);
houseAgent.postSubGoal(
    new LightsFollowShuttersGoal({
        people: house.people,
        lights: house.devices.lights,
        shutters: house.devices.shutters,
    }),
);
houseAgent.postSubGoal(new ChargeCarGoal({ car: house.devices.car }));

let securityAgent = new Agent("security_agent");
// add intentions
securityAgent.intentions.push(ManageShuttersIntention);
securityAgent.intentions.push(ManageCarParkingIntention);
// add goals
securityAgent.postSubGoal(
    new ManageShuttersGoal({
        people: house.people,
        lights: house.devices.lights,
        shutters: house.devices.shutters,
    }),
);
securityAgent.postSubGoal(
    new ManageCarParkingGoal({
        car: house.devices.car,
        garage_door: house.devices.garage_door,
        authorized_people: house.people,
    }),
);

// Simulated Daily/Weekly schedule
Clock.global.observe("mm", () => {
    var time = Clock.global;
    // if (time.hh == 6 && time.mm == 0) house.devices.lights["kitchen"].switchOn();
    if (time.dd == 0 && time.hh == 6 && time.mm == 30) house.people.bob.moveTo("hallway");
    if (time.dd == 0 && time.hh == 8 && time.mm == 0) {
        house.people.bob.moveTo("garage");
        house.people.bob.moveTo("out", true);
    }
    if (time.dd == 0 && time.hh == 18 && time.mm == 0) house.people.bob.moveTo("garage", true);
    if (time.dd == 0 && time.hh == 18 && time.mm == 10) {
        house.people.bob.moveTo("hallway");
        house.people.bob.moveTo("living_room");
    }
    if (time.dd == 1 && time.hh == 6 && time.mm == 30) house.people.bob.moveTo("hallway");
    if (time.dd == 1 && time.hh == 8 && time.mm == 0) {
        house.people.bob.moveTo("garage");
        house.people.bob.moveTo("out", true);
    }
    if (time.dd == 1 && time.hh == 12 && time.mm == 0) house.people.bob.moveTo("garage", true);
    if (time.dd == 1 && time.hh == 12 && time.mm == 10) {
        house.people.bob.moveTo("hallway");
        house.people.bob.moveTo("living_room");
    }
});

// Start clock
Clock.startTimer();
