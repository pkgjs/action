'use strict';

const ActionsCore = require('@actions/core');
const Fs = require('node:fs');
const Path = require('node:path');
const Yaml = require('yaml');


exports.main = function () {

    const outputFolder = Path.join('.github', 'tmp', ActionsCore.getInput('path'));

    Fs.mkdirSync(outputFolder, { recursive: true });

    try {
        var steps = Yaml.parse(ActionsCore.getInput('steps'));
    }
    catch (err) {
        throw new Error('Invalid `steps` - unable to parse YAML.');
    }

    if (!Array.isArray(steps)) {
        throw new Error('Invalid `steps` - not an array.');
    }

    const action = {
        runs: {
            using: 'composite',
            steps
        }
    };

    const actionYaml = Yaml.stringify(action);

    const outputPath = Path.join(outputFolder, 'action.yaml');

    console.log(`Writing ${outputPath}...`);
    console.log(actionYaml);
    Fs.writeFileSync(outputPath, actionYaml);
};


if (require.main === module) {
    exports.main();
}
