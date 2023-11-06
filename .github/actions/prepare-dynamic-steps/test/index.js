'use strict';

const Assert = require('node:assert');
const Fs = require('node:fs');
const Os = require('node:os');
const Path = require('node:path');
const { describe, it, beforeEach } = require('node:test');

const PrepareDynamicStepsAction = require('..');


const expectedResult1 = `
runs:
  using: composite
  steps:
    - run: echo ohai
    - run: echo ohai again
`;

describe('PrepareDynamicStepsAction', () => {

    const originalEnv = { ...process.env };

    let tmpFolder;

    beforeEach(() => {

        tmpFolder = Fs.mkdtempSync(`${Os.tmpdir()}${Path.sep}prepare-dynamic-steps-action-test-`);

        Fs.mkdirSync(tmpFolder, { recursive: true });
        process.chdir(tmpFolder);
    });

    it('creates a file when INPUT_STEPS contains valid yaml', () => {

        process.env = { ...originalEnv, INPUT_PATH: 'test1', INPUT_STEPS: '- run: echo ohai\n- run: echo ohai again' };
        PrepareDynamicStepsAction.main();
        Assert.strictEqual(Fs.readFileSync(Path.join(tmpFolder, '.github', 'tmp', 'test1', 'action.yaml')).toString().trim(), expectedResult1.trim());
    });

    it('throws when INPUT_STEPS contains invalid yaml', () => {

        process.env = { ...originalEnv, INPUT_PATH: 'test2', INPUT_STEPS: '- item\n-invalid' };
        Assert.throws(() => PrepareDynamicStepsAction.main(), { message: 'Invalid `steps` - unable to parse YAML.' });
    });

    it('throws when INPUT_STEPS does not contain an array', () => {

        process.env = { ...originalEnv, INPUT_PATH: 'test3', INPUT_STEPS: 'not an array' };
        Assert.throws(() => PrepareDynamicStepsAction.main(), { message: 'Invalid `steps` - not an array.' });
    });
});
