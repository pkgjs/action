'use strict';

process.on('unhandledRejection', (err) => {

    throw err;
});


const Assert = require('assert');
const Fs = require('fs');
const Path = require('path');
const PrepareDynamicStepsAction = require('..');


const expectedResult1 = `
runs:
  using: composite
  steps:
    - run: echo ohai
    - run: echo ohai again
`;


exports.main = function () {

    const originalEnv = { ...process.env };

    const tmpFolder = Path.join(__dirname, '.tmp', `${Date.now()}`);

    try {

        Fs.mkdirSync(tmpFolder, { recursive: true });
        process.chdir(tmpFolder);

        process.env = { ...originalEnv, INPUT_PATH: 'test1', INPUT_STEPS: '- run: echo ohai\n- run: echo ohai again' };
        PrepareDynamicStepsAction.main();
        Assert.strictEqual(Fs.readFileSync(Path.join(tmpFolder, '.github', 'tmp', 'test1', 'action.yaml')).toString().trim(), expectedResult1.trim());

        process.env = { ...originalEnv, INPUT_PATH: 'test2', INPUT_STEPS: '- item\n-invalid' };
        Assert.throws(() => PrepareDynamicStepsAction.main(), { message: 'Invalid `steps` - unable to parse YAML.' });

        process.env = { ...originalEnv, INPUT_PATH: 'test3', INPUT_STEPS: 'not an array' };
        Assert.throws(() => PrepareDynamicStepsAction.main(), { message: 'Invalid `steps` - not an array.' });
    }
    finally {
        Fs.rmSync(Path.join(__dirname, '.tmp'), { recursive: true });
    }
};


if (require.main === module) {
    exports.main();
}
