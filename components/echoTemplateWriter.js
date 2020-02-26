// @ts-nocheck
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const _ = require("lodash");
const mkdirp = require("mkdirp");
const path = require("path");

const { commonFilesWriter } = require("./commonFilesWriter");

// generators/app/templates folder name
const GENERATOR_TEMPLATE_NAME = "echo";

const LANG_TS = "typescript";

/**
 * Write the files that are specific to the echo bot template
 *
 * @param {Generator} gen Yeoman's generator object
 * @param {String} templatePath file path to write the generated code
 */
const writeEchoTemplateFiles = (generator, templatePath) => {
  const DEPLOYMENT_SCRIPTS = 0;
  const DEPLOYMENT_MSBOT = 1;
  const TS_SRC_FOLDER = "src";
  const folders = ["deploymentScripts"];
  const extension =
    _.toLower(generator.templateConfig.language) === "javascript" ? "js" : "ts";
  const srcFolder =
    _.toLower(generator.templateConfig.language) === "javascript"
      ? ""
      : TS_SRC_FOLDER;

  // create the echo bot folder structure common to both languages
  if (_.toLower(generator.templateConfig.language) === LANG_TS) {
    for (let cnt = 0; cnt < folders.length; ++cnt) {
      mkdirp.sync(folders[cnt]);
    }
  }
  // create a src directory if we are generating TypeScript
  if (_.toLower(generator.templateConfig.language) === LANG_TS) {
    mkdirp.sync(TS_SRC_FOLDER);
  }

  // create a responders directory if we are generating TypeScript
  if (_.toLower(generator.templateConfig.language) === LANG_TS) {
    mkdirp.sync(TS_SRC_FOLDER + "/responders");
  }

  let sourcePath = path.join(templatePath, folders[DEPLOYMENT_SCRIPTS]);
  let destinationPath = path.join(
    generator.destinationPath(),
    folders[DEPLOYMENT_SCRIPTS]
  );
  // if we're writing out TypeScript, then we need to add a webConfigPrep.js
  if (_.toLower(generator.templateConfig.language) === LANG_TS) {
    generator.fs.copy(
      path.join(sourcePath, "webConfigPrep.js"),
      path.join(destinationPath, "webConfigPrep.js")
    );
  }

  // write out the index.js and bot.js
  destinationPath = path.join(generator.destinationPath(), srcFolder);

  // gen the main index file
  generator.fs.copyTpl(
    generator.templatePath(path.join(templatePath, `index.${extension}`)),
    path.join(destinationPath, `index.${extension}`),
    {
      botname: generator.templateConfig.botname
    }
  );

  // gen the main bot activity router
  generator.fs.copy(
    generator.templatePath(path.join(templatePath, `bot.${extension}`)),
    path.join(destinationPath, `bot.${extension}`)
  );

  // gen the main bot activity router
  generator.fs.copy(
    generator.templatePath(path.join(templatePath, `bot.${extension}`)),
    path.join(destinationPath, `bot.${extension}`)
  );

  const respondersFromPath = templatePath + "/responders";
  const respondersToPath = destinationPath + "/responders";

  generator.fs.copy(
    generator.templatePath(
      path.join(respondersFromPath, `initCocoResponder.${extension}`)
    ),
    path.join(respondersToPath, `initCocoResponder.${extension}`)
  );
  generator.fs.copy(
    generator.templatePath(
      path.join(respondersFromPath, `initWatsonResponder.${extension}`)
    ),
    path.join(respondersToPath, `initWatsonResponder.${extension}`)
  );
  generator.fs.copy(
    generator.templatePath(
      path.join(respondersFromPath, `initDefaultResponder.${extension}`)
    ),
    path.join(respondersToPath, `initDefaultResponder.${extension}`)
  );
};

/**
 * Write project files for Echo template
 *
 * @param {Generator} generator Yeoman's generator object
 */
module.exports.echoTemplateWriter = generator => {
  // build the path to the echo template source folder
  const templatePath = path.join(
    generator.templatePath(),
    GENERATOR_TEMPLATE_NAME
  );

  // write files common to all our template options
  commonFilesWriter(generator, templatePath);

  // write files specific to the echo bot template
  writeEchoTemplateFiles(generator, templatePath);
};
