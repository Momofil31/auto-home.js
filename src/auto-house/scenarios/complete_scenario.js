const { House } = require("../House");
const Agent = require("../../bdi/Agent");
const { HouseAgent } = require("../agents/HouseAgent");
const Clock = require("../../utils/Clock");
const Person = require("../Person");
const { AlarmIntention, SetupAlarm } = require("../devices/Alarm.js");
const {
    LightsFollowPeopleIntention,
    LightsFollowPeopleGoal,
    LightsFollowShuttersGoal,
    LightsFollowShuttersIntention,
} = require("../devices/Light");
const { ManageShuttersGoal, ManageShuttersIntention } = require("../devices/Shutter");
const { StartDishwasherGoal, StartDishwasherIntention } = require("../devices/Dishwasher");
const { SecurityAlarmIntention, SecurityAlarmGoal } = require("../Security");
const { notifyFoodShortageGoal, notifyFoodShortageIntention } = require("../devices/Fridge");
const { ManageThermostatIntention, ManageThermostatGoal } = require("../devices/Thermostat");
const {
    ManageCarParkingIntention,
    ManageCarParkingGoal,
    ChargeCarGoal,
    ChargeCarIntention,
} = require("../devices/Car");
const { Postman, PostmanAcceptAllRequest } = require("../helpers/Communication");
const { Move, Charge, Suck, Clean } = require("../agents/pddlActions");
const {
    MopCleaningProcedureIntention,
    AskHouseConfigurationIntention,
    AskRoomStatusIntention,
    AskToCleanIntention,
    SendRoomStateIntention,
    LearnHouseGoal,
    LearnHouseIntention,
    VacuumCleaningProcedureGoal,
    VacuumCleaningProcedureIntention,
    SendHouseConfigurationIntention,
} = require("../agents/AgentIntentions");
// Devices
const { VacuumCleaner } = require("../devices/VacuumCleaner");
const { MopBot } = require("../devices/MopBot");
// Agents
const { VacuumCleanerAgent } = require("../agents/VacuumCleanerAgent");
const { MopBotAgent } = require("../agents/MopBotAgent");
// Plannning
let { OnlinePlanning: VacuumCleanerPlanning } = require("../../pddl/OnlinePlanner")([
    Move,
    Suck,
    Charge,
]);
let { OnlinePlanning: MopBotPlanning } = require("../../pddl/OnlinePlanner")([Move, Clean, Charge]);

global.deviceNextId = 0;
// House, which includes rooms and devices
let house = new House();
house.people.bob.in_room = "master_bedroom";
house.people.alice.in_room = "bedroom_0";

// Agents
let houseAgent = new HouseAgent("house_agent", house);

// add intentions
houseAgent.intentions.push(AlarmIntention);
//houseAgent.intentions.push(SensePeoplePositionIntention);
houseAgent.intentions.push(LightsFollowPeopleIntention);
houseAgent.intentions.push(LightsFollowShuttersIntention);
houseAgent.intentions.push(StartDishwasherIntention);
houseAgent.intentions.push(notifyFoodShortageIntention);
houseAgent.intentions.push(ManageThermostatIntention);
houseAgent.intentions.push(ChargeCarIntention);
houseAgent.intentions.push(PostmanAcceptAllRequest);
houseAgent.intentions.push(SendRoomStateIntention);

// add goals
houseAgent.postSubGoal(new Postman());
houseAgent.postSubGoal(new SetupAlarm({ hh: 7, mm: 0, person: house.people.bob }));
houseAgent.postSubGoal(new SetupAlarm({ hh: 8, mm: 0, person: house.people.alice }));

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

// MOP BOT AGENT
let mopBotDevice = new MopBot(house, "mopbot", "kitchen", "kitchen");
let mopBotAgent = new MopBotAgent("mopbot", mopBotDevice);

mopBotAgent.beliefs.declare("in kitchen");
mopBotAgent.beliefs.declare("full_battery");
mopBotAgent.beliefs.undeclare("zero_battery");

mopBotAgent.intentions.push(MopBotPlanning);
mopBotAgent.intentions.push(PostmanAcceptAllRequest);
mopBotAgent.intentions.push(MopCleaningProcedureIntention);
mopBotAgent.intentions.push(AskHouseConfigurationIntention);
mopBotAgent.postSubGoal(new Postman());

// VACUUM CLEANER AGENT
let vacuumCleanerDevice = new VacuumCleaner(house, "vacuum", "kitchen", "kitchen");
let vacuumCleanerAgent = new VacuumCleanerAgent("vacuum_cleaner", vacuumCleanerDevice, mopBotAgent);

// initialize belief state of vacuum cleaner agent
vacuumCleanerAgent.beliefs.declare("in kitchen");
vacuumCleanerAgent.beliefs.declare("full_battery");
vacuumCleanerAgent.beliefs.undeclare("zero_battery");

// Add vacuum cleaner intentions
vacuumCleanerAgent.intentions.push(VacuumCleanerPlanning);
vacuumCleanerAgent.intentions.push(PostmanAcceptAllRequest);
vacuumCleanerAgent.intentions.push(VacuumCleaningProcedureIntention);
vacuumCleanerAgent.intentions.push(LearnHouseIntention);
vacuumCleanerAgent.intentions.push(AskRoomStatusIntention);
vacuumCleanerAgent.intentions.push(AskToCleanIntention);
vacuumCleanerAgent.intentions.push(SendHouseConfigurationIntention);
vacuumCleanerAgent.postSubGoal(new Postman());

const learnHouseGoal = new LearnHouseGoal({
    house: house,
    start: vacuumCleanerDevice.in_room,
});

vacuumCleanerAgent.postSubGoal(learnHouseGoal);

// Simulated Daily/Weekly schedule
Clock.global.observe("mm", () => {
    var time = Clock.global;
    // Working days
    if (time.dd >= 0 && time.dd < 6) {
        // ------- BOB schedule -------
        if (time.hh == 7 && time.mm == 0) {
            house.people.bob.moveTo("hallway_upstairs");
            house.people.bob.moveTo("stairs");
            house.people.bob.moveTo("hallway");
            house.people.bob.moveTo("living_room");
            house.people.bob.moveTo("kitchen");
            house.people.bob.eatBreakfast();
        }
        if (time.hh == 8 && time.mm == 0) {
            house.people.bob.moveTo("living_room");
            house.people.bob.moveTo("hallway");
            house.people.bob.moveTo("garage");
            house.people.bob.moveTo("out", true);
        }
        if (time.dd % 2 == 0 && time.hh == 17 && time.mm == 45) house.people.bob.doShopping();
        if (time.hh == 18 && time.mm == 0) {
            house.people.bob.moveTo("garage");
        }
        if (time.hh == 18 && time.mm == 5) {
            house.people.bob.moveTo("hallway");
            house.people.bob.moveTo("living_room");
            house.people.bob.moveTo("kitchen");
        }
        if (time.hh == 18 && time.mm == 10) {
            house.people.bob.setHot();
        }
        if (time.hh == 21 && time.mm == 0) {
            house.people.bob.moveTo("living_room");
        }
        if (time.hh == 22 && time.mm == 0) {
            house.people.bob.moveTo("hallway");
            house.people.bob.moveTo("stairs");
            house.people.bob.moveTo("hallway_upstairs");
            house.people.bob.moveTo("master_bedroom");
        }
        // ------- BOB schedule -------

        // ------- ALICE schedule -------
        if (time.hh == 8 && time.mm == 0) {
            house.people.alice.moveTo("hallway_upstairs");
            house.people.alice.moveTo("stairs");
            house.people.alice.moveTo("hallway");
            house.people.alice.moveTo("living_room");
            house.people.alice.moveTo("kitchen");
            house.people.alice.eatBreakfast();
        }
        if (time.hh == 9 && time.mm == 0) {
            house.people.alice.moveTo("living_room");
            house.people.alice.moveTo("out");
        }
        if (time.hh == 19 && time.mm == 0) {
            house.people.alice.moveTo("living_room");
            house.people.alice.moveTo("kitchen");
        }
        if (time.hh == 21 && time.mm == 0) {
            house.people.alice.moveTo("living_room");
        }
        if (time.hh == 22 && time.mm == 0) {
            house.people.alice.moveTo("living_room");
        }
        if (time.hh == 22 && time.mm == 30) {
            house.people.alice.moveTo("hallway");
            house.people.alice.moveTo("stairs");
            house.people.alice.moveTo("hallway_upstairs");
            house.people.alice.moveTo("bedroom_0");
        }
        // ------- ALICE schedule -------

        // have dinner both bob and alice
        if (time.hh == 20 && time.mm == 0) {
            // have dinner not implemented
            house.people.bob.setCold();
        }

        // Burglar comes in the house
        if (time.dd == 2 && time.hh == 12 && time.mm == 0) burglar.moveTo("living_room");
        if (time.dd == 2 && time.hh == 12 && time.mm == 5) burglar.moveTo("out");
    }
    // ------- CLEANING schedule -------
    if (time.dd == 0 || time.dd == 3) {
        if (time.hh == 0 && time.mm == 0) {
            house.setRandomRoomsDirty();
        }
        if (time.hh == 8 && time.mm == 30) {
            if (learnHouseGoal.achieved) {
                vacuumCleanerAgent.postSubGoal(
                    new VacuumCleaningProcedureGoal({ houseAgent, times: 2 }),
                );
            }
        }
    }
});

// Start clock
Clock.startTimer();
