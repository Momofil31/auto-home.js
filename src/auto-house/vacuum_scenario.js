const Clock = require("../utils/Clock");
const {
    VacuumCleaner,
    LearnHouseGoal,
    LearnHouseIntention,
    Move,
    Suck,
    Charge,
    AskRoomStatusGoal,
    AskRoomStatusIntention,
} = require("./devices/VacuumCleaner");
const { House } = require("./House");
const { HouseAgent, SendRoomStateIntention } = require("./agents/HouseAgent");
const { VacuumCleanerAgent } = require("./agents/VacuumCleanerAgent");
const PlanningGoal = require("../pddl/PlanningGoal");
const { TryCleanProcedureGoal, TryCleanProcedureIntention } = require("./helpers/RetryGoal");
const { Postman, PostmanAcceptAllRequest } = require("./helpers/Communication");
let { OnlinePlanning } = require("../pddl/OnlinePlanner")([Move, Suck, Charge]);

global.deviceNextId = 0;

// House, which includes rooms and devices
let house = new House();

// Agents
let houseAgent = new HouseAgent("house_agent", house);
houseAgent.intentions.push(PostmanAcceptAllRequest);
houseAgent.intentions.push(SendRoomStateIntention);
houseAgent.postSubGoal(new Postman());

let vacuumCleanerDevice = new VacuumCleaner(house, "vacuum", "kitchen");
let vacuumCleanerAgent = new VacuumCleanerAgent("vacuum_cleaner", vacuumCleanerDevice);

vacuumCleanerAgent.intentions.push(OnlinePlanning);
vacuumCleanerAgent.intentions.push(TryCleanProcedureIntention);
vacuumCleanerAgent.intentions.push(LearnHouseIntention);
vacuumCleanerAgent.intentions.push(PostmanAcceptAllRequest);
vacuumCleanerAgent.intentions.push(AskRoomStatusIntention);
vacuumCleanerAgent.postSubGoal(new Postman());

// initialize belief state of vacuum cleaner agent
vacuumCleanerAgent.beliefs.declare("in kitchen");
vacuumCleanerAgent.beliefs.declare("full_battery");
vacuumCleanerAgent.beliefs.undeclare("zero_battery");

const learnHouseGoal = new LearnHouseGoal({
    house: house,
    start: vacuumCleanerDevice.in_room,
});

class CleanHouseGoal extends PlanningGoal {
    constructor(house) {
        let goal = [];
        for (let r of Object.values(house.rooms)) {
            if (r.name != "out") {
                goal.push("clean " + r.name);
            }
        }
        super({ goal: goal });
    }
}

class ChargeGoal extends PlanningGoal {
    constructor(device) {
        super({
            goal: ["in " + device.chargingStationRoom, "full_battery"],
        });
    }
}

const cleanHouseGoal = new CleanHouseGoal(house);
const askRoomStatusGoal = new AskRoomStatusGoal({ agent: houseAgent, house: house });

const chargeGoal = new ChargeGoal(vacuumCleanerDevice);

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
                new TryCleanProcedureGoal({
                    goal: { cleanHouseGoal, askRoomStatusGoal, chargeGoal },
                    times: 2,
                }),
            );
        }
    }
    if (time.hh == 9 && time.mm == 0) house.people.bob.moveTo("out");
    if (time.hh == 18 && time.mm == 0) house.people.bob.moveTo("living_room");
});

// Start clock
Clock.startTimer();
