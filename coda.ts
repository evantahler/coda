import { program } from "commander";
import { EOL } from "os";

import { BotHappy } from "./assets/ascii/ascii.test";
import * as pkg from "./package.json";

program
  .version(pkg.version)
  .name(pkg.name)
  .description(pkg.description + EOL + EOL + BotHappy);

program.parse();
