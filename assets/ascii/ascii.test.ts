import { readFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";

function getAscii(name: string) {
  const ascii = readFileSync(join(__dirname, `${name}.txt`), "utf8");
  const lines = ascii.split("\n");

  return lines
    .map((line) => {
      // Find the start and end of the bot's face (between the border characters)
      const start = line.indexOf("│") + 1;
      const end = line.lastIndexOf("│");

      if (start === 0 || end === -1) {
        return chalk.gray(line); // Color border lines gray
      }

      // Split the line into border and face parts
      const leftBorder = line.slice(0, start);
      const face = line.slice(start, end);
      const rightBorder = line.slice(end);

      // Color the face blue and borders gray
      return (
        chalk.gray(leftBorder) + chalk.blue(face) + chalk.gray(rightBorder)
      );
    })
    .join("\n");
}

export const BotConfused = getAscii("bot.confused");
export const BotHappy = getAscii("bot.happy");
export const BotSad = getAscii("bot.sad");
