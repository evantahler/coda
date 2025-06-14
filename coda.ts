import { program } from "commander";
import { EOL } from "os";

import * as pkg from "./package.json";
import { BotHappy } from "./assets/ascii";

program
  .version(pkg.version)
  .name(pkg.name)
  .description(pkg.description + EOL + EOL + BotHappy);

program.parse();
