'use strict';

const Assert = require('node:assert');
const { describe, it } = require('node:test');


const PrepareNodeTextMatrixAction = require('../index');


exports.getOutput = function (now, pkg) {

    const output = [];

    // hijack process.stdout.write, which is used by @actions/core
    const originalWrite = process.stdout.write;
    process.stdout.write = function (line) {

        line = line.trim();
        if (line) {
            output.push(line);
        }
    };

    try {
        PrepareNodeTextMatrixAction.main({
            now,
            pkg,
            debug: () => {
            }
        });
    }
    finally {
        process.stdout.write = originalWrite;
    }

    return output;
};

describe('PrepareNodeTextMatrixAction', () => {

    delete process.env.GITHUB_OUTPUT;

    const originalEnv = { ...process.env };

    it('does not fail with defaults, cannot assert, as output is dependent on date', () => {

        Assert.ok(exports.getOutput());
    });

    it('throws when `engines` undefined', () => {

        Assert.throws(() => exports.getOutput(new Date('2021-10-08'), {}), { message: '`engines.node` range not defined in `package.json`.' });
        Assert.throws(() => exports.getOutput(new Date('2021-10-08'), { engines: {} }), { message: '`engines.node` range not defined in `package.json`.' });
    });

    it('throws when upgrade policy is invalid', () => {

        process.env = {
            ...originalEnv,
            'INPUT_UPGRADE-POLICY': 'no-such-policy'
        };
        Assert.throws(() => exports.getOutput(), { message: 'No such upgrade policy: no-such-policy' });
    });

    it('includes correct version ranges based on date', () => {

        process.env = {
            ...originalEnv
        };
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^14' } }), [
            '::set-output name=node-version::[]',
            '::set-output name=lts-latest::12',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[{"node-version":14,"runs-on":null,"experimental":"experimental"}]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '*' } }), [
            '::set-output name=node-version::[12,10,8,6,4]',
            '::set-output name=lts-latest::12',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[{"node-version":14,"runs-on":null,"experimental":"experimental"}]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^14 || ^12 || ^10' } }), [
            '::set-output name=node-version::[12,10]',
            '::set-output name=lts-latest::12',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[{"node-version":14,"runs-on":null,"experimental":"experimental"}]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2010-07-01'), { engines: { node: '*' } }), [
            '::set-output name=node-version::[]',
            '::set-output name=lts-latest::4',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[]',
            '::set-output name=exclude::[]'
        ]);
    });

    it('constructs correct matrix for `lts` policy', () => {

        process.env = {
            ...originalEnv,
            'INPUT_UPGRADE-POLICY': 'lts'
        };
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[12,10]',
            '::set-output name=lts-latest::12',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[{"node-version":14,"runs-on":null,"experimental":"experimental"}]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-11-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[14,12,10]',
            '::set-output name=lts-latest::14',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[{"node-version":15,"runs-on":null,"experimental":"experimental"}]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2021-05-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[14,12,10]',
            '::set-output name=lts-latest::14',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[{"node-version":16,"runs-on":null,"experimental":"experimental"},{"node-version":15,"runs-on":null,"experimental":"experimental"}]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2021-07-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[14,12,10]',
            '::set-output name=lts-latest::14',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[{"node-version":16,"runs-on":null,"experimental":"experimental"}]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2021-11-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[16,14,12,10]',
            '::set-output name=lts-latest::16',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[{"node-version":17,"runs-on":null,"experimental":"experimental"}]',
            '::set-output name=exclude::[]'
        ]);
    });

    it('constructs correct matrix for `lts/strict` policy', () => {

        process.env = {
            ...originalEnv,
            'INPUT_UPGRADE-POLICY': 'lts/strict'
        };
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[12,10]',
            '::set-output name=lts-latest::12',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-11-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[14,12,10]',
            '::set-output name=lts-latest::14',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2021-05-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[14,12,10]',
            '::set-output name=lts-latest::14',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2021-07-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[14,12,10]',
            '::set-output name=lts-latest::14',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2021-11-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[16,14,12,10]',
            '::set-output name=lts-latest::16',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[]',
            '::set-output name=exclude::[]'
        ]);
    });

    it('constructs correct matrix for `all` policy', () => {

        process.env = {
            ...originalEnv,
            'INPUT_UPGRADE-POLICY': 'all'
        };
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[14,13,12,11,10]',
            '::set-output name=lts-latest::12',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-11-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[15,14,13,12,11,10]',
            '::set-output name=lts-latest::14',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2021-05-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[16,15,14,13,12,11,10]',
            '::set-output name=lts-latest::14',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2021-07-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[16,15,14,13,12,11,10]',
            '::set-output name=lts-latest::14',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[]',
            '::set-output name=exclude::[]'
        ]);
        Assert.deepStrictEqual(exports.getOutput(new Date('2021-11-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[17,16,15,14,13,12,11,10]',
            '::set-output name=lts-latest::16',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[]',
            '::set-output name=exclude::[]'
        ]);
    });

    it('recognizes the default runs-on value regardless of case', () => {

        process.env = {
            ...originalEnv,
            'INPUT_RUNS-ON': 'ubuntu-LATEST'
        };
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^14' } }), [
            '::set-output name=node-version::[]',
            '::set-output name=lts-latest::12',
            '::set-output name=runs-on::[null]',
            '::set-output name=include::[{"node-version":14,"runs-on":null,"experimental":"experimental"}]',
            '::set-output name=exclude::[]'
        ]);
    });

    it('sets runs-on from a simple comma separated list', () => {

        process.env = {
            ...originalEnv,
            'INPUT_RUNS-ON': 'ubuntu-latest, windows-latest, macos-latest'
        };
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^14' } }), [
            '::set-output name=node-version::[]',
            '::set-output name=lts-latest::12',
            '::set-output name=runs-on::["ubuntu-latest","windows-latest","macos-latest"]',
            '::set-output name=include::[{"node-version":14,"runs-on":"ubuntu-latest","experimental":"experimental"},{"node-version":14,"runs-on":"windows-latest","experimental":"experimental"},{"node-version":14,"runs-on":"macos-latest","experimental":"experimental"}]',
            '::set-output name=exclude::[]'
        ]);
    });

    it('sets runs-on from a YAML array', () => {

        process.env = {
            ...originalEnv,
            'INPUT_RUNS-ON': '- ubuntu-latest\n- windows-latest\n- macos-latest\n'
        };
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^14' } }), [
            '::set-output name=node-version::[]',
            '::set-output name=lts-latest::12',
            '::set-output name=runs-on::["ubuntu-latest","windows-latest","macos-latest"]',
            '::set-output name=include::[{"node-version":14,"runs-on":"ubuntu-latest","experimental":"experimental"},{"node-version":14,"runs-on":"windows-latest","experimental":"experimental"},{"node-version":14,"runs-on":"macos-latest","experimental":"experimental"}]',
            '::set-output name=exclude::[]'
        ]);
    });

    it('ensures `experimental` and `runs-on` values are set when they are missing in the `include` matrix', () => {

        process.env = {
            ...originalEnv,
            'INPUT_RUNS-ON': '- ubuntu-latest\n- windows-latest\n- macos-latest\n',
            'INPUT_INCLUDE': '- node-version: 15\n  runs-on: ubuntu-latest\n- node-version: 13'
        };
        Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^14' } }), [
            '::set-output name=node-version::[]',
            '::set-output name=lts-latest::12',
            '::set-output name=runs-on::["ubuntu-latest","windows-latest","macos-latest"]',
            '::set-output name=include::[{"node-version":14,"runs-on":"ubuntu-latest","experimental":"experimental"},{"node-version":14,"runs-on":"windows-latest","experimental":"experimental"},{"node-version":14,"runs-on":"macos-latest","experimental":"experimental"},{"node-version":15,"runs-on":"ubuntu-latest","experimental":null},{"node-version":13,"runs-on":"ubuntu-latest","experimental":null},{"node-version":13,"runs-on":"windows-latest","experimental":null},{"node-version":13,"runs-on":"macos-latest","experimental":null}]',
            '::set-output name=exclude::[]'
        ]);
    });

    it('excludes non-LTS experimental when explicitly requested', () => {

        process.env = {
            ...originalEnv,
            'INPUT_RUNS-ON': '- ubuntu-latest\n- windows-latest\n- macos-latest\n',
            'INPUT_EXCLUDE': '- node-version: 17\n  runs-on: ubuntu-latest'
        };
        Assert.deepStrictEqual(exports.getOutput(new Date('2021-11-01'), { engines: { node: '^10' } }), [
            '::set-output name=node-version::[16,14,12,10]',
            '::set-output name=lts-latest::16',
            '::set-output name=runs-on::["ubuntu-latest","windows-latest","macos-latest"]',
            // node 17 on ubuntu latest explicitly excluded
            '::set-output name=include::[{"node-version":17,"runs-on":"windows-latest","experimental":"experimental"},{"node-version":17,"runs-on":"macos-latest","experimental":"experimental"}]',
            '::set-output name=exclude::[{"node-version":17,"runs-on":"ubuntu-latest"}]'
        ]);
    });
});
