const Goal = require("../../bdi/Goal");
const Intention = require("../../bdi/Intention");
const Clock = require("../../utils/Clock");

class SetupAlarm extends Goal {}

class AlarmIntention extends Intention {
    static applicable(goal) {
        return goal instanceof SetupAlarm;
    }
    *exec() {
        while (true) {
            yield Clock.global.notifyChange("mm", "alarm");
            if (
                Clock.global.hh == this.goal.parameters.hh &&
                Clock.global.mm == this.goal.parameters.mm
            ) {
                this.log(
                    `ALARM, it's ${this.goal.parameters.hh < 10 ? "0" : ""}${
                        this.goal.parameters.hh
                    }:${this.goal.parameters.mm < 10 ? "00" : this.goal.parameters.mm}`,
                );
            }
        }
    }
}

module.exports = { SetupAlarm, AlarmIntention };
