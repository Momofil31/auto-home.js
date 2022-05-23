const Observable = require("../../utils/Observable");
const chalk = require("chalk");
const { deviceColors: colors } = require("../../utils/chalkColors");

class GenericDevice extends Observable {
    constructor() {
        super();
    }
    headerLog(header = "", ...args) {
        process.stdout.cursorTo(0);
        header = "\t\t" + header + " ".repeat(Math.max(50 - header.length, 0));
        console.log(chalk[colors[this.id % colors.length]](header, ...args));
    }
    log(...args) {
        this.headerLog(this.name + " " + this.constructor.name, ...args);
    }
    headerError(header = "", ...args) {
        process.stderr.cursorTo(0);
        header = "\t\t" + header + " ".repeat(Math.max(50 - header.length, 0));
        console.error(chalk.bold.italic[colors[this.id % colors.length]](header, ...args));
    }
    error(...args) {
        this.headerError(this.name + " " + this.constructor.name, ...args);
    }
}

module.exports = GenericDevice;
