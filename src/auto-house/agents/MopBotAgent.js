const Agent = require("../../bdi/Agent");

class MopBotAgent extends Agent {
    constructor(name, MopBotDevice) {
        super(name);
        this.device = MopBotDevice;
    }
}

module.exports = {
    MopBotAgent,
};
