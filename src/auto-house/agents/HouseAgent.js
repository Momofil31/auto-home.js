const Agent = require("../../bdi/Agent");
class HouseAgent extends Agent {
    constructor(name, house) {
        super(name);
        this.house = house;
    }
}

module.exports = { HouseAgent };
