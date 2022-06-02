const { House } = require("../House");
const Agent = require("../../bdi/Agent");
const { HouseAgent } = require("../agents/HouseAgent");
const Clock = require("../../utils/Clock");
const Person = require("../Person");
const {
    LightsFollowPeopleIntention,
    LightsFollowPeopleGoal,
    LightsFollowShuttersGoal,
    LightsFollowShuttersIntention,
} = require("../devices/Light");
const { ManageShuttersGoal, ManageShuttersIntention } = require("../devices/Shutter");
const { SecurityAlarmIntention, SecurityAlarmGoal } = require("../Security");

global.deviceNextId = 0;
// House, which includes rooms and devices
let house = new House();
house.people.bob.in_room = "living_room";
delete house.people.alice;

// Agents
let houseAgent = new HouseAgent("house_agent", house);

// add intentions
houseAgent.intentions.push(LightsFollowPeopleIntention);
houseAgent.intentions.push(LightsFollowShuttersIntention);

// add goals

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
securityAgent.intentions.push(SecurityAlarmIntention);

// add goals
securityAgent.postSubGoal(
    new ManageShuttersGoal({
        people: house.people,
        lights: house.devices.lights,
        shutters: house.devices.shutters,
    }),
);

let burglar = new Person(house, "Burglar", house.rooms.out.name);
securityAgent.postSubGoal(
    new SecurityAlarmGoal({ people: { ...house.people, burglar }, house: house }),
);

// Simulated Daily/Weekly schedule
Clock.global.observe("mm", () => {
    var time = Clock.global;
    if (time.hh == 8 && time.mm == 0) {
        house.people.bob.moveTo("out");
    }

    // Burglar comes in the house
    if (time.hh == 12 && time.mm == 0) burglar.moveTo("living_room");
    if (time.hh == 12 && time.mm == 5) burglar.moveTo("out");

    if (time.hh == 18 && time.mm == 0) {
        house.people.bob.moveTo("living_room");
    }
});

// Start clock
Clock.startTimer();
