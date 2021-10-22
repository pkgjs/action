'use strict';

process.on('unhandledRejection', (err) => {

    throw err;
});


const Path = require('path');
const Schedule = require('./schedule.json'); // https://raw.githubusercontent.com/nodejs/Release/master/schedule.json
const Semver = require('semver');


// package.json from the system being tested
const Package = require(Path.join(process.cwd(), 'package.json'));


exports.main = function ({ now = new Date(), pkg = Package, debug = console.info, setOutput = console.log } = {}) {

    if (!pkg.engines || !pkg.engines.node) {
        throw new Error('`engines.node` range not defined in `package.json`.');
    }

    debug(`Found node version range: ${pkg.engines.node}`);

    const minVersion = Semver.minVersion(pkg.engines.node);
    debug(`Minimum major in the supported range: ${minVersion.major}`);

    const upgradePolicy = process.env.INPUT_UPGRADEPOLICY || 'lts';
    if (upgradePolicy !== 'lts' && upgradePolicy !== 'lts/strict' && upgradePolicy !== 'all') {
        throw new Error(`No such upgrade policy: ${upgradePolicy}`);
    }

    const today = now.toISOString().substr(0, 10);

    const versions = [];
    let ltsLatest = 4; // oldest LTS - avoid returning undefined here

    for (const [version, meta] of Object.entries(Schedule)) {

        if (version.startsWith('v0.')) {
            debug(`${version} - skipping: too old.`);
            continue; // ignore 0.x - they're irrelevant at this point
        }

        const versionNumber = parseInt(version.substr(1), 10);
        const isLtsStarted = meta.lts && meta.lts <= today;
        const isCurrent = meta.end >= today;

        if (isLtsStarted && ltsLatest < versionNumber) {
            ltsLatest = versionNumber;
        }

        if (meta.start > today) {
            debug(`${version} - skipping: not released yet.`);
            continue; // not released yet
        }

        if (versionNumber < minVersion.major) {
            debug(`${version} - skipping: unsupported.`);
            continue; // unsupported
        }

        if (upgradePolicy === 'lts') {
            if (!isLtsStarted && !isCurrent) {
                debug(`${version} - skipping: not LTS.`);
                continue;
            }
        }

        if (upgradePolicy === 'lts/strict') {
            if (!isLtsStarted) {
                debug(`${version} - skipping: not LTS.`);
                continue;
            }
        }

        debug(`${version}`);
        versions.push(versionNumber);
    }

    const sorted = versions.sort((a, b) => b - a);
    setOutput(`::set-output name=matrix::${JSON.stringify(sorted)}`);
    setOutput(`::set-output name=lts_latest::${ltsLatest}`);
};


if (require.main === module) {
    exports.main();
}
