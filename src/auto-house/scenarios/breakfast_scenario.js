const { House } = require("../House");
const { SecurityAgent } = require("../agents/SecurityAgent");
const { HouseAgent } = require("../agents/HouseAgent");
const { MakeCoffeeIntention, MakeCoffeeGoal } = require("../devices/CoffeeMachine");
const Clock = require("../../utils/Clock");
const { AlarmIntention, SetupAlarm } = require("../devices/Alarm.js");
const {
    LightsFollowPeopleIntention,
    LightsFollowPeopleGoal,
    LightsFollowShuttersGoal,
    LightsFollowShuttersIntention,
} = require("../devices/Light");
const { ManageShuttersGoal, ManageShuttersIntention } = require("../devices/Shutter");
const { StartDishwasherGoal, StartDishwasherIntention } = require("../devices/Dishwasher");
const { notifyFoodShortageGoal, notifyFoodShortageIntention } = require("../devices/Fridge");

global.deviceNextId = 0;
// House, which includes rooms and devices
let house = new House();
house.people.bob.in_room = "master_bedroom";
house.people.alice.in_room = "bedroom_0";

// Agents
let houseAgent = new HouseAgent("house_agent");

// add intentions
houseAgent.intentions.push(AlarmIntention);
//houseAgent.intentions.push(SensePeoplePositionIntention);
houseAgent.intentions.push(LightsFollowPeopleIntention);
houseAgent.intentions.push(LightsFollowShuttersIntention);
houseAgent.intentions.push(StartDishwasherIntention);
houseAgent.intentions.push(notifyFoodShortageIntention);
houseAgent.intentions.push(MakeCoffeeIntention);

// add goals
houseAgent.postSubGoal(new SetupAlarm({ hh: 6, mm: 55, person: house.people.bob }));
houseAgent.postSubGoal(new SetupAlarm({ hh: 7, mm: 55, person: house.people.alice }));

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
    new MakeCoffeeGoal({ people: house.people, coffee_machine: house.devices.coffee_machine }),
);

let securityAgent = new SecurityAgent("security_agent");
securityAgent.intentions.push(ManageShuttersIntention);

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
    if (time.hh == 7 && time.mm == 0) {
        house.people.bob.moveTo("hallway_upstairs");
        house.people.bob.moveTo("stairs");
        house.people.bob.moveTo("hallway");
        house.people.bob.moveTo("living_room");
        house.people.bob.moveTo("kitchen");
        house.people.bob.eatBreakfast();
    }
    if (time.hh == 8 && time.mm == 0) {
        house.people.alice.moveTo("hallway_upstairs");
        house.people.alice.moveTo("stairs");
        house.people.alice.moveTo("hallway");
        house.people.alice.moveTo("living_room");
        house.people.alice.moveTo("kitchen");
        house.people.alice.eatBreakfast();
    }
    if (time.hh == 22 && time.mm == 0) {
        house.people.bob.moveTo("living_room");
        house.people.bob.moveTo("hallway");
        house.people.bob.moveTo("stairs");
        house.people.bob.moveTo("hallway_upstairs");
        house.people.bob.moveTo("master_bedroom");
    }
    if (time.hh == 22 && time.mm == 30) {
        house.people.alice.moveTo("living_room");
        house.people.alice.moveTo("hallway");
        house.people.alice.moveTo("stairs");
        house.people.alice.moveTo("hallway_upstairs");
        house.people.alice.moveTo("master_bedroom");
    }
});

// Start clock
Clock.startTimer();
