const House = require("./House");
const Agent = require("../bdi/Agent");
const Clock = require("../utils/Clock");
const { AlarmIntention, SetupAlarm } = require("./devices/Alarm.js");
const {
    LightsFollowPeopleIntention,
    LightsFollowPeopleGoal,
    LightsFollowShuttersGoal,
    LightsFollowShuttersIntention,
} = require("./devices/Light");
const {
    SensePeoplePositionIntention,
    SensePeoplePositionGoal,
} = require("./sensors/PeoplePositionSensor");
const { ManageShuttersGoal, ManageShuttersIntention } = require("./devices/Shutter");

// House, which includes rooms and devices
let house = new House();

// Agents
let houseAgent = new Agent("house agent");

// add intentions
houseAgent.intentions.push(AlarmIntention);
houseAgent.intentions.push(SensePeoplePositionIntention);
houseAgent.intentions.push(LightsFollowPeopleIntention);
houseAgent.intentions.push(LightsFollowShuttersIntention);

// add goals
houseAgent.postSubGoal(new SetupAlarm({ hh: 6, mm: 15 }));
houseAgent.postSubGoal(new SensePeoplePositionGoal(house.people));
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

let securityAgent = new Agent("security agent");
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
    if (time.hh == 6 && time.mm == 30) house.people.bob.moveTo("kitchen");
    if (time.hh == 6 && time.mm == 35) house.people.bob.eatBreakfast();
    if (time.hh == 8 && time.mm == 0) house.people.bob.moveTo("living_room");
    if (time.hh == 8 && time.mm == 0) house.people.bob.moveTo("out");
    if (time.hh == 18 && time.mm == 0) house.people.bob.moveTo("living_room");
    if (time.hh == 18 && time.mm == 10) house.people.bob.moveTo("hallway");
    if (time.hh == 18 && time.mm == 10) house.people.bob.moveTo("bathroom_0");
    if (time.hh == 18 && time.mm == 30) house.people.bob.moveTo("hallway");
    if (time.hh == 18 && time.mm == 35) house.people.bob.moveTo("garage");
    if (time.hh == 18 && time.mm == 45) house.people.bob.moveTo("hallway");
    if (time.hh == 19 && time.mm == 0) house.people.bob.moveTo("living_room");
    if (time.hh == 20 && time.mm == 0) house.people.bob.moveTo("kitchen");
    if (time.hh == 21 && time.mm == 0) house.people.bob.moveTo("living_room");
});

// Start clock
Clock.startTimer();