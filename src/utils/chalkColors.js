const colors = [
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
    "blackBright",
    "greenBright",
    "yellowBright",
    "blueBright",
    "magentaBright",
    "cyanBright",
    "whiteBright",
];

const agentColors = colors.slice(0, 5);

const deviceColors = colors.slice(5, 12);

const personColors = colors.slice(12);

module.exports = { agentColors, deviceColors, personColors };
