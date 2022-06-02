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

global.deviceNextId = 0;
// House, which includes rooms and devices
let house = new House();
house.people.bob.in_room = "master_bedroom";
delete house.people.alice;

// Agents
let houseAgent = new HouseAgent("house_agent");

houseAgent.intentions.push(LightsFollowPeopleIntention);
houseAgent.intentions.push(LightsFollowShuttersIntention);

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

let securityAgent = new Agent("security_agent");
// add intentions
securityAgent.intentions.push(ManageShuttersIntention);

// add goals
securityAgent.postSubGoal(
    new ManageShuttersGoal({
        people: house.people,
        lights: house.devices.lights,
        shutters: house.devices.shutters,
    }),
);

// Simulated Daily/Weekly schedule
Clock.global.observe("mm", () => {
    var time = Clock.global;
    // if (time.hh == 6 && time.mm == 0) house.devices.lights["kitchen"].switchOn();
    if (time.hh == 6 && time.mm == 30) {
        house.people.bob.moveTo("hallway_upstairs");
        house.people.bob.moveTo("stairs");
        house.people.bob.moveTo("hallway");
        house.people.bob.moveTo("living_room");
        house.people.bob.moveTo("kitchen");
    }
    if (time.hh == 8 && time.mm == 0) house.people.bob.moveTo("living_room");
    if (time.hh == 8 && time.mm == 0) house.people.bob.moveTo("hallway");
    if (time.hh == 8 && time.mm == 0) house.people.bob.moveTo("garage");
    if (time.hh == 8 && time.mm == 0) house.people.bob.moveTo("out");
    if (time.hh == 18 && time.mm == 0) house.people.bob.moveTo("garage");
    if (time.hh == 18 && time.mm == 10) house.people.bob.moveTo("hallway");
    if (time.hh == 18 && time.mm == 10) house.people.bob.moveTo("bathroom_0");
    if (time.hh == 18 && time.mm == 30) house.people.bob.moveTo("hallway");
    if (time.hh == 18 && time.mm == 35) house.people.bob.moveTo("garage");
    if (time.hh == 18 && time.mm == 45) house.people.bob.moveTo("hallway");
    if (time.hh == 19 && time.mm == 0) house.people.bob.moveTo("living_room");
    if (time.hh == 20 && time.mm == 0) house.people.bob.moveTo("kitchen");
    if (time.hh == 21 && time.mm == 0) house.people.bob.moveTo("living_room");
    if (time.hh == 22 && time.mm == 0) {
        house.people.bob.moveTo("living_room");
        house.people.bob.moveTo("hallway");
        house.people.bob.moveTo("stairs");
        house.people.bob.moveTo("hallway_upstairs");
        house.people.bob.moveTo("bathroom");
    }
    if (time.hh == 22 && time.mm == 30) {
        house.people.bob.moveTo("hallway_upstairs");
        house.people.bob.moveTo("master_bedroom");
    }
});

// Start clock
Clock.startTimer();
