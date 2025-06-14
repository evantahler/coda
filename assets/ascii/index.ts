import { readFileSync } from "fs";
import { join } from "path";

function getAscii(name: string) {
  return readFileSync(join(__dirname, `${name}.txt`), "utf8");
}

export const BotConfused = getAscii("bot.confused");
export const BotHappy = getAscii("bot.happy");
export const BotSad = getAscii("bot.sad");
