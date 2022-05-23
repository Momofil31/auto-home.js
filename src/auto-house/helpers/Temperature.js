const Observable = require("../../utils/Observable");

class Temperature extends Observable {
    constructor(degrees = 18) {
        super();
        this.set("degrees", degrees);
    }
}

module.exports = Temperature;
