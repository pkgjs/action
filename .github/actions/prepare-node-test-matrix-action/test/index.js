'use strict';

process.on('unhandledRejection', (err) => {

    throw err;
});


const Assert = require('assert');
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
            debug: () => {}
        });
    }
    finally {
        process.stdout.write = originalWrite;
    }

    return output;
};


exports.main = function () {

    const originalEnv = { ...process.env };

    // does not fail with defaults, cannot assert, as output is dependent on date

    Assert.ok(exports.getOutput());

    // input validation

    Assert.throws(() => exports.getOutput(new Date('2021-10-08'), {}));
    Assert.throws(() => exports.getOutput(new Date('2021-10-08'), { engines: {} }));

    process.env = { ...originalEnv, 'INPUT_UPGRADE-POLICY': 'no-such-policy' };
    Assert.throws(() => exports.getOutput());

    // node version ranges

    process.env = { ...originalEnv };
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^14' } }), [
        '::set-output name=node-version::[14]',
        '::set-output name=lts-latest::12',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '*' } }), [
        '::set-output name=node-version::[14,12,10,8,6,4]',
        '::set-output name=lts-latest::12',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^14 || ^12 || ^10' } }), [
        '::set-output name=node-version::[14,12,10]',
        '::set-output name=lts-latest::12',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2010-07-01'), { engines: { node: '*' } }), [
        '::set-output name=node-version::[]',
        '::set-output name=lts-latest::4',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);


    // matrices based on policies on a certain date

    process.env = { ...originalEnv, 'INPUT_UPGRADE-POLICY': 'lts' };
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[14,12,10]',
        '::set-output name=lts-latest::12',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-11-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[15,14,12,10]',
        '::set-output name=lts-latest::14',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-05-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[16,15,14,12,10]',
        '::set-output name=lts-latest::14',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-07-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[16,14,12,10]',
        '::set-output name=lts-latest::14',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-11-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[17,16,14,12,10]',
        '::set-output name=lts-latest::16',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);


    process.env = { ...originalEnv, 'INPUT_UPGRADE-POLICY': 'lts/strict' };
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[12,10]',
        '::set-output name=lts-latest::12',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-11-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[14,12,10]',
        '::set-output name=lts-latest::14',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-05-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[14,12,10]',
        '::set-output name=lts-latest::14',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-07-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[14,12,10]',
        '::set-output name=lts-latest::14',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-11-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[16,14,12,10]',
        '::set-output name=lts-latest::16',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);


    process.env = { ...originalEnv, 'INPUT_UPGRADE-POLICY': 'all' };
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[14,13,12,11,10]',
        '::set-output name=lts-latest::12',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-11-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[15,14,13,12,11,10]',
        '::set-output name=lts-latest::14',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-05-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[16,15,14,13,12,11,10]',
        '::set-output name=lts-latest::14',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-07-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[16,15,14,13,12,11,10]',
        '::set-output name=lts-latest::14',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-11-01'), { engines: { node: '^10' } }), [
        '::set-output name=node-version::[17,16,15,14,13,12,11,10]',
        '::set-output name=lts-latest::16',
        '::set-output name=runs-on::["ubuntu-latest"]'
    ]);

    // runs-on - simple comma separated list
    process.env = { ...originalEnv, 'INPUT_RUNS-ON': 'ubuntu-latest, windows-latest, macos-latest' };
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^14' } }), [
        '::set-output name=node-version::[14]',
        '::set-output name=lts-latest::12',
        '::set-output name=runs-on::["ubuntu-latest","windows-latest","macos-latest"]'
    ]);
};


if (require.main === module) {
    exports.main();
}
