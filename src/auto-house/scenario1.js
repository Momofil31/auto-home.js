const { House } = require("./House");
const Agent = require("../bdi/Agent");
const { HouseAgent } = require("./agents/HouseAgent");
const Clock = require("../utils/Clock");
const Person = require("./Person");
const { AlarmIntention, SetupAlarm } = require("./devices/Alarm.js");
const {
    LightsFollowPeopleIntention,
    LightsFollowPeopleGoal,
    LightsFollowShuttersGoal,
    LightsFollowShuttersIntention,
} = require("./devices/Light");
const { ManageShuttersGoal, ManageShuttersIntention } = require("./devices/Shutter");
const { StartDishwasherGoal, StartDishwasherIntention } = require("./devices/Dishwasher");
const { SecurityAlarmIntention, SecurityAlarmGoal } = require("./Security");
const { notifyFoodShortageGoal, notifyFoodShortageIntention } = require("./devices/Fridge");
const { ManageThermostatIntention, ManageThermostatGoal } = require("./devices/Thermostat");
const {
    ManageCarParkingIntention,
    ManageCarParkingGoal,
    ChargeCarGoal,
    ChargeCarIntention,
} = require("./devices/Car");

global.deviceNextId = 0;
// House, which includes rooms and devices
let house = new House();

// Agents
let houseAgent = new HouseAgent("house_agent");

// add intentions
houseAgent.intentions.push(AlarmIntention);
//houseAgent.intentions.push(SensePeoplePositionIntention);
houseAgent.intentions.push(LightsFollowPeopleIntention);
houseAgent.intentions.push(LightsFollowShuttersIntention);
houseAgent.intentions.push(StartDishwasherIntention);
houseAgent.intentions.push(notifyFoodShortageIntention);
houseAgent.intentions.push(ManageThermostatIntention);
houseAgent.intentions.push(ChargeCarIntention);

// add goals
houseAgent.postSubGoal(new SetupAlarm({ hh: 6, mm: 15, person: house.people.bob }));
//houseAgent.postSubGoal(new SensePeoplePositionGoal(house.people));
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
houseAgent.postSubGoal(new StartDishwasherGoal({ dishwasher: house.devices.dishwasher }));
houseAgent.postSubGoal(new notifyFoodShortageGoal({ fridge: house.devices.fridge }));
houseAgent.postSubGoal(
    new ManageThermostatGoal({ people: house.people, thermostat: house.devices.thermostat }),
);
houseAgent.postSubGoal(new ChargeCarGoal({ car: house.devices.car }));

let securityAgent = new Agent("security_agent");
// add intentions
securityAgent.intentions.push(ManageShuttersIntention);
securityAgent.intentions.push(SecurityAlarmIntention);
securityAgent.intentions.push(ManageCarParkingIntention);

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
    if (time.hh == 6 && time.mm == 30) house.people.bob.moveTo("kitchen");
    if (time.hh == 6 && time.mm == 35) house.people.bob.eatBreakfast();
    if (time.hh == 8 && time.mm == 0) house.people.bob.moveTo("living_room");
    if (time.hh == 8 && time.mm == 0) house.people.bob.moveTo("hallway");
    if (time.hh == 8 && time.mm == 0) house.people.bob.moveTo("garage");
    if (time.hh == 8 && time.mm == 0) house.people.bob.moveTo("out", true);
    if (time.hh == 12 && time.mm == 0) burglar.moveTo("living_room");
    if (time.hh == 12 && time.mm == 5) burglar.moveTo("out");
    if (time.hh == 17 && time.mm == 45) house.people.bob.doShopping("out");
    if (time.hh == 18 && time.mm == 0) house.people.bob.moveTo("garage");
    if (time.hh == 18 && time.mm == 10) house.people.bob.moveTo("hallway");
    if (time.hh == 18 && time.mm == 10) house.people.bob.moveTo("bathroom_0");
    if (time.hh == 18 && time.mm == 30) house.people.bob.moveTo("hallway");
    if (time.hh == 18 && time.mm == 35) house.people.bob.moveTo("garage");
    if (time.hh == 18 && time.mm == 45) house.people.bob.moveTo("hallway");
    if (time.hh == 19 && time.mm == 0) house.people.bob.moveTo("living_room");
    if (time.hh == 19 && time.mm == 5) house.people.bob.setCold();
    if (time.hh == 19 && time.mm == 20) house.people.bob.setHot();
    if (time.hh == 20 && time.mm == 0) house.people.bob.moveTo("kitchen");
    if (time.hh == 21 && time.mm == 0) house.people.bob.moveTo("living_room");
});

// Start clock
Clock.startTimer();
