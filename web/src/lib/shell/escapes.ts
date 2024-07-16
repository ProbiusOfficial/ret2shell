export const ESC = "\u001B[";
export const OSC = "\u001B]";
export const BEL = "\u0007";
export const SEP = ";";

export const cursorTo = (x: number, y?: number) => {
  if (typeof y !== "number") {
    return `${ESC}${x + 1}G`;
  }

  // return ESC + (y + 1) + SEP + (x + 1) + "H";
  return `${ESC}${y + 1}${SEP}${x + 1}H`;
};

export const cursorMove = (x: number, y: number) => {
  let returnValue = "";

  if (x < 0) {
    // returnValue += ESC + -x + "D";
    returnValue += `${ESC}${-x}D`;
  } else if (x > 0) {
    // returnValue += ESC + x + "C";
    returnValue += `${ESC}${x}C`;
  }

  if (y < 0) {
    returnValue += `${ESC}${-y}A`;
  } else if (y > 0) {
    returnValue += `${ESC}${y}B`;
  }

  return returnValue;
};

// export const cursorUp = (count = 1) => ESC + count + "A";
export const cursorUp = (count = 1) => `${ESC}${count}A`;
export const cursorUp1 = `${ESC}A`;
// export const cursorDown = (count = 1) => ESC + count + "B";
export const cursorDown = (count = 1) => `${ESC}${count}B`;
export const cursorDown1 = `${ESC}B`;
// export const cursorForward = (count = 1) => ESC + count + "C";
export const cursorForward = (count = 1) => `${ESC}${count}C`;
export const cursorForward1 = `${ESC}C`;
// export const cursorBackward = (count = 1) => ESC + count + "D";
export const cursorBackward = (count = 1) => `${ESC}${count}D`;
export const cursorBackward1 = `${ESC}D`;

// export const cursorLeft = ESC + "G";
export const cursorLeft = `${ESC}G`;
// export const cursorSavePosition = isTerminalApp ? "\u001B7" : ESC + "s";
export const cursorSavePosition = `${ESC}s`;
// export const cursorRestorePosition = isTerminalApp ? "\u001B8" : ESC + "u";
export const cursorRestorePosition = `${ESC}u`;
// export const cursorGetPosition = ESC + "6n";
export const cursorGetPosition = `${ESC}6n`;
// export const cursorNextLine = ESC + "E";
export const cursorNextLine = `${ESC}E`;
// export const cursorPrevLine = ESC + "F";
export const cursorPrevLine = `${ESC}F`;
// export const cursorHide = ESC + "?25l";
export const cursorHide = `${ESC}?25l`;
// export const cursorShow = ESC + "?25h";
export const cursorShow = `${ESC}?25h`;

export const eraseLines = (count: number) => {
  let clear = "";

  for (let i = 0; i < count; i++) {
    clear += eraseLine + (i < count - 1 ? cursorUp() : "");
  }

  if (count) {
    clear += cursorLeft;
  }

  return clear;
};

// export const eraseEndLine = ESC + "K";
export const eraseEndLine = `${ESC}K`;
// export const eraseStartLine = ESC + "1K";
export const eraseStartLine = `${ESC}1K`;
// export const eraseLine = ESC + "2K";
export const eraseLine = `${ESC}2K`;
// export const eraseDown = ESC + "J";
export const eraseDown = `${ESC}J`;
// export const eraseUp = ESC + "1J";
export const eraseUp = `${ESC}1J`;
// export const eraseScreen = ESC + "2J";
export const eraseScreen = `${ESC}2J`;
// export const scrollUp = ESC + "S";
export const scrollUp = `${ESC}S`;
// export const scrollDown = ESC + "T";
export const scrollDown = `${ESC}T`;

export const clearScreen = "\u001Bc";

// 1. Erases the screen (Only done in case `2` is not supported)
// 2. Erases the whole screen including scrollback buffer
// 3. Moves cursor to the top-left position
// More info: https://www.real-world-systems.com/docs/ANSIcode.html
export const clearTerminal = `${eraseScreen}${ESC}3J${ESC}H`;

// export const enterAlternativeScreen = ESC + "?1049h";
export const enterAlternativeScreen = `${ESC}?1049h`;
// export const exitAlternativeScreen = ESC + "?1049l";
export const exitAlternativeScreen = `${ESC}?1049l`;

export const beep = BEL;

export const home = `${ESC}H`;
export const end = `${ESC}F`;

export const link = (text: string, url: string) =>
  [OSC, "8", SEP, SEP, url, BEL, text, OSC, "8", SEP, SEP, BEL].join("");
