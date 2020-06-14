#!/usr/bin/env node

import { green, red } from "chalk";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { safeLoad } from "js-yaml";
import path from "path";
import { fileURLToPath } from "url";
import { Builder, Parser } from "xml2js";
import yargs from "yargs";

// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { argv } = yargs
  .usage("Usage: $0 -p [str] -t [str]")
  .options({
    p: {
      alias: "path",
      type: "string",
      describe: "Path to profile",
      demandOption: true,
    },
    t: {
      alias: "theme",
      type: "string",
      describe: "Name of theme",
      demandOption: true,
    },
  })
  .conflicts("s", "p")
  .conflicts("s", "t");

const themePath = `${path.join(__dirname, "..")}/themes/${argv.t}.yml`;
const profilePath = argv.p;

const checkPaths = () => {
  if (!existsSync(themePath)) {
    console.log(red("Not a valid theme!"));
    process.exit();
  }

  if (!existsSync(profilePath)) {
    console.log(red("Can't find profile!"));
    process.exit();
  }
};

const writeProfile = async () => {
  const parser = new Parser();
  const builder = new Builder();

  const theme = safeLoad(readFileSync(themePath, "utf8"));
  const profile = readFileSync(profilePath);

  try {
    const result = await parser.parseStringPromise(profile);

    Object.keys(theme).forEach((key) => {
      result.MudletPackage.HostPackage[0].Host[0][key] = theme[key];
    });

    writeFileSync(profilePath, builder.buildObject(result));
    console.log(green("Profile updated!"));
  } catch (err) {
    console.log(red("Can't parse profile!"));
    process.exit();
  }
};

if (argv.p && argv.t) {
  checkPaths();
  writeProfile();
}
