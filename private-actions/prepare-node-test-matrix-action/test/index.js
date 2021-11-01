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

    // does not fail with defaults

    Assert.ok(exports.getOutput());

    // input validation

    Assert.throws(() => exports.getOutput(new Date('2021-10-08'), {}));
    Assert.throws(() => exports.getOutput(new Date('2021-10-08'), { engines: {} }));

    process.env = { ...originalEnv, INPUT_UPGRADEPOLICY: 'no-such-policy' };
    Assert.throws(() => exports.getOutput());

    // node version ranges

    process.env = { ...originalEnv };
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^14' } }), [
        '::set-output name=matrix::[14]',
        '::set-output name=lts_latest::12'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '*' } }), [
        '::set-output name=matrix::[14,12,10,8,6,4]',
        '::set-output name=lts_latest::12'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^14 || ^12 || ^10' } }), [
        '::set-output name=matrix::[14,12,10]',
        '::set-output name=lts_latest::12'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2010-07-01'), { engines: { node: '*' } }), [
        '::set-output name=matrix::[]',
        '::set-output name=lts_latest::4'
    ]);


    // matrices based on policies on a certain date

    process.env = { ...originalEnv, INPUT_UPGRADEPOLICY: 'lts' };
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[14,12,10]',
        '::set-output name=lts_latest::12'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-11-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[15,14,12,10]',
        '::set-output name=lts_latest::14'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-05-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[16,15,14,12,10]',
        '::set-output name=lts_latest::14'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-07-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[16,14,12,10]',
        '::set-output name=lts_latest::14'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-11-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[17,16,14,12,10]',
        '::set-output name=lts_latest::16'
    ]);


    process.env = { ...originalEnv, INPUT_UPGRADEPOLICY: 'lts/strict' };
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[12,10]',
        '::set-output name=lts_latest::12'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-11-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[14,12,10]',
        '::set-output name=lts_latest::14'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-05-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[14,12,10]',
        '::set-output name=lts_latest::14'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-07-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[14,12,10]',
        '::set-output name=lts_latest::14'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-11-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[16,14,12,10]',
        '::set-output name=lts_latest::16'
    ]);


    process.env = { ...originalEnv, INPUT_UPGRADEPOLICY: 'all' };
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-07-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[14,13,12,11,10]',
        '::set-output name=lts_latest::12'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2020-11-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[15,14,13,12,11,10]',
        '::set-output name=lts_latest::14'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-05-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[16,15,14,13,12,11,10]',
        '::set-output name=lts_latest::14'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-07-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[16,15,14,13,12,11,10]',
        '::set-output name=lts_latest::14'
    ]);
    Assert.deepStrictEqual(exports.getOutput(new Date('2021-11-01'), { engines: { node: '^10' } }), [
        '::set-output name=matrix::[17,16,15,14,13,12,11,10]',
        '::set-output name=lts_latest::16'
    ]);
};


if (require.main === module) {
    exports.main();
}
