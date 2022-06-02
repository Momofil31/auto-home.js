// Utility
const Clock = require("../../utils/Clock");
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
const { House } = require("../House");
const { VacuumCleaner } = require("../devices/VacuumCleaner");
const { MopBot } = require("../devices/MopBot");
// Agents
const { HouseAgent } = require("../agents/HouseAgent");
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

let house = new House();
delete house.people.alice;

// HOUSE AGENT
let houseAgent = new HouseAgent("house_agent", house);
houseAgent.intentions.push(PostmanAcceptAllRequest);
houseAgent.intentions.push(SendRoomStateIntention);
houseAgent.postSubGoal(new Postman());

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
Clock.global.observe("mm", async () => {
    var time = Clock.global;
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
    if (time.hh == 9 && time.mm == 0) house.people.bob.moveTo("out");
    if (time.hh == 18 && time.mm == 0) house.people.bob.moveTo("living_room");
});

// Start clock
Clock.startTimer();
