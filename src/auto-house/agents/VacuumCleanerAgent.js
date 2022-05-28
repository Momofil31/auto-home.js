const Agent = require("../../bdi/Agent");

class VacuumCleanerAgent extends Agent {
    constructor(name, vacuumCleanerDevice, mopBotAgent) {
        super(name);
        this.device = vacuumCleanerDevice;
        this.mopBotAgent = mopBotAgent;
    }
}

module.exports = {
    VacuumCleanerAgent,
};
