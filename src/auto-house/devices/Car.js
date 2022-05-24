const GenericDevice = require("./GenericDevice");
const Clock = require("../../utils/Clock");
const Intention = require("../../bdi/Intention");
const Goal = require("../../bdi/Goal");

class Car extends GenericDevice {
    // duration is from half battery to full
    static SLOW_CHARGING_DURATION = 6; // hours
    static FAST_CHARGING_DURATION = 1; // hours

    static SLOW_CHARGING_POWER = 2500; // Watt
    static FAST_CHARGING_POWER = 4700; // Watt

    constructor(house, name) {
        super();
        this.house = house;
        this.name = name;
        this.id = global.deviceNextId++;
        this.set("driver", null);
        this.set("in", "garage");
        this.set("battery", "full"); // full, low
        this.charging = false;
        this.set("approachingGarage", false);
    }
    #charge(type) {
        if (this.in != "garage") {
            this.error("cannot charge, not in garage.");
            return;
        }
        if (this.battery == "full") {
            this.error("cannot charge, already full battery.");
            return;
        }
        if (this.charging) {
            this.error("cannot charge, already charging.");
            return;
        }
        let chargingDuration =
            type == "slow"
                ? this.constructor.SLOW_CHARGING_DURATION
                : this.constructor.FAST_CHARGING_DURATION;
        let chargingPower =
            type == "slow"
                ? this.constructor.SLOW_CHARGING_POWER
                : this.constructor.FAST_CHARGING_POWER;

        this.log(`started ${type} charging`);
        let startTime = { hh: Clock.global.hh, mm: Clock.global.mm };
        this.charging = true;
        this.house.utilities.electricity.consumption += chargingPower;

        // delay time
        Clock.global.observe(
            "mm",
            (mm) => {
                let time = Clock.global;
                if (time.hh == (startTime.hh + chargingDuration) % 24 && time.mm == startTime.mm) {
                    let car = this;
                    this.log(`ended ${type} charging.`);
                    car.battery = "full";
                    car.charging = false;
                    car.house.utilities.electricity.consumption -= chargingPower;
                    Clock.global.unobserve("mm", mm, `${type}_charging_timer`);
                }
            },
            `${type}_charging_timer`,
        );
    }
    chargeSlow() {
        this.#charge("slow");
    }
    chargeFast() {
        this.#charge("fast");
    }
    drive(person) {
        // assuming that you cannot drive the car until it is fully charged.
        if (this.battery != "full") {
            this.log("cannot drive, car is not charged.");
            return;
        }
        if (this.charging) {
            this.error("cannot drive, car is charging.");
            return;
        }
        if (person.in_room != "garage") {
            this.error("candidate driver not in garage.");
            return;
        }
        this.driver = person;
        this.log(`${person.name} is now in the car.`);

        this.house.devices.garage_door.observe(
            "status",
            (status) => {
                let car = this;
                car.in = "out";
                this.log("Exit the garage.");
                this.house.devices.garage_door.unobserve(
                    "status",
                    status,
                    "waiting_open_garage_door",
                );
            },
            "waiting_open_garage_door",
        );
    }
    async park() {
        if (this.in != "out") {
            this.error("cannot enter garage to park, car is not out of the house.");
            return;
        }

        this.approachingGarage = true;
        let garage_door_status = await this.house.devices.garage_door.notifyChange(
            "status",
            "parking_utility",
        );

        if (garage_door_status != "open") {
            this.error("garage door is not open, cannot park");
            return;
        }
        this.battery = "low";
        this.in = "garage";
        this.approachingGarage = false;
        this.log("car parked succesfully");
        this.log(`${this.driver.name} is now out of the car.`);
        this.driver = null;
    }
}

class ManageCarParkingGoal extends Goal {}

class ManageCarParkingIntention extends Intention {
    static applicable(goal) {
        return goal instanceof ManageCarParkingGoal;
    }
    isDriverAuthorized(driver, authorizedPeople) {
        // linear search
        for (let p of Object.values(authorizedPeople)) {
            if (p.uuid == driver.uuid) {
                return true;
            }
        }
        return false;
    }
    *exec() {
        let manageCarParkingPromises = [];
        let openGarageToEnterPromise = new Promise(async () => {
            while (true) {
                let car = this.goal.parameters.car;
                let garage_door = this.goal.parameters.garage_door;
                let authorizedPeople = this.goal.parameters.authorized_people;

                await car.notifyChange("approachingGarage", "openGarageToEnterPromise");
                if (!car.approachingGarage) continue;
                if (car.in != "out") continue;
                if (!this.isDriverAuthorized(car.driver, authorizedPeople)) continue;

                garage_door.open();
            }
        });
        let openGarageToExitPromise = new Promise(async () => {
            while (true) {
                let car = this.goal.parameters.car;
                let garage_door = this.goal.parameters.garage_door;
                let authorizedPeople = this.goal.parameters.authorized_people;
                await car.notifyChange("driver", "openGarageToExitPromise");

                // open garage door when the driver enters the car like in GTA
                if (car.in != "garage") continue;
                if (car.driver == null) continue;

                // plus security measure to allow only certain people to use the car
                if (!this.isDriverAuthorized(car.driver, authorizedPeople)) continue;
                garage_door.open();
            }
        });
        let closeGarageAfterEnterPromise = new Promise(async () => {
            while (true) {
                let car = this.goal.parameters.car;
                let garage_door = this.goal.parameters.garage_door;
                await car.notifyChange("in", "closeGarageAfterEnterPromise");
                if (car.in != "garage") continue;
                garage_door.close();
            }
        });
        let closeGarageAfterExitPromise = new Promise(async () => {
            while (true) {
                let car = this.goal.parameters.car;
                let garage_door = this.goal.parameters.garage_door;
                await car.notifyChange("in", "closeGarageAfterExitPromise");
                if (car.in != "out") continue;

                garage_door.close();
            }
        });
        manageCarParkingPromises.push(openGarageToEnterPromise);
        manageCarParkingPromises.push(openGarageToExitPromise);
        manageCarParkingPromises.push(closeGarageAfterEnterPromise);
        manageCarParkingPromises.push(closeGarageAfterExitPromise);
        yield Promise.all(manageCarParkingPromises);
    }
}

class ChargeCarGoal extends Goal {}
class ChargeCarIntention extends Intention {
    static applicable(goal) {
        return goal instanceof ChargeCarGoal;
    }
    *exec() {
        let chargeCarPromises = [];
        let chargeSlowCarPromise = new Promise(async () => {
            while (true) {
                let car = this.goal.parameters.car;
                await Clock.global.notifyChange("mm", "chargeSlowCarPromise");
                let time = Clock.global;
                if (time.hh >= 23 || time.hh <= 1) {
                    if (!car.charging && car.in == "garage" && car.battery == "low" ) {
                        car.chargeSlow();
                    }
                }
            }
        });
        let chargeFastCarPromise = new Promise(async () => {
            while (true) {
                let car = this.goal.parameters.car;
                await car.notifyChange("in", "chargeFastCarPromise");
                let time = Clock.global;
                if (time.hh > 6 && time.hh < 18) {
                    if (car.in == "garage" && car.battery == "low") {
                        car.chargeFast();
                    }
                }
            }
        });
        chargeCarPromises.push(chargeSlowCarPromise);
        chargeCarPromises.push(chargeFastCarPromise);
        yield Promise.all(chargeCarPromises);
    }
}

module.exports = {
    Car,
    ManageCarParkingGoal,
    ManageCarParkingIntention,
    ChargeCarGoal,
    ChargeCarIntention,
};
