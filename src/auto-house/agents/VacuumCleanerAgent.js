const Agent = require("../../bdi/Agent");

class VacuumCleanerAgent extends Agent {
    constructor(name, vacuumCleanerDevice) {
        super(name);
        this.vacuumCleanerDevice = vacuumCleanerDevice;
    }
}

module.exports = { VacuumCleanerAgent };
