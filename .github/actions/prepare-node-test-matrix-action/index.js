'use strict';

const ActionsCore = require('@actions/core');
const Path = require('node:path');
const Schedule = require('./schedule.json'); // https://raw.githubusercontent.com/nodejs/Release/master/schedule.json
const Semver = require('semver');
const Yaml = require('yaml');


// package.json from the system being tested
const Package = require(Path.join(process.cwd(), 'package.json'));


const internals = {};


internals.setOutput = function (name, value, { debug }) {

    debug('Output', { name, value });
    ActionsCore.setOutput(name, value);
};


internals.isExcluded = function (combo, exclude) {

    return exclude.some((excludedCombo) => {

        return Object.entries(excludedCombo).every(([k, v]) => {

            return combo[k] === v;
        });
    });
};


internals.normalizeRunsOn = function (runsOnInput) {

    if (!runsOnInput || runsOnInput.toLowerCase() === 'ubuntu-latest') {
        return [null];
    }

    const runsOnParsed = Yaml.parse(ActionsCore.getInput('runs-on'));

    if (Array.isArray(runsOnParsed)) {
        return runsOnParsed;
    }

    return runsOnParsed.split(/[,\s]+/);
};


exports.main = function ({ now = new Date(), pkg = Package, debug = console.info } = {}) {

    if (!pkg.engines?.node) {
        throw new Error('`engines.node` range not defined in `package.json`.');
    }

    debug(`Found node version range: ${pkg.engines.node}`);

    const minVersion = Semver.minVersion(pkg.engines.node);
    debug(`Minimum major in the supported range: ${minVersion.major}`);

    const upgradePolicy = ActionsCore.getInput('upgrade-policy') || 'lts';
    if (upgradePolicy !== 'lts' && upgradePolicy !== 'lts/strict' && upgradePolicy !== 'all') {
        throw new Error(`No such upgrade policy: ${upgradePolicy}`);
    }

    const today = now.toISOString().substr(0, 10);

    const runsOn = internals.normalizeRunsOn(ActionsCore.getInput('runs-on'));

    const includeInput = Yaml.parse(ActionsCore.getInput('include') || '[]');
    const include = [];

    includeInput.forEach((matrixCombo) => {

        const experimental = matrixCombo.experimental ? 'experimental' : null;

        if (matrixCombo['runs-on'] !== undefined) {
            include.push({
                'node-version': matrixCombo['node-version'],
                'runs-on': matrixCombo['runs-on'],
                experimental
            });
        }
        else {
            runsOn.forEach((os) => {

                include.push({
                    'node-version': matrixCombo['node-version'],
                    'runs-on': os,
                    experimental
                });
            });
        }
    });

    const exclude = Yaml.parse(ActionsCore.getInput('exclude') || '[]');

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

            if (!isLtsStarted) {
                debug(`${version} - experimental: not yet LTS.`);
                include.unshift(...runsOn
                    .map((os) => {

                        return {
                            'node-version': versionNumber,
                            'runs-on': os,
                            experimental: 'experimental'
                        };
                    })
                    .filter((combo) => !internals.isExcluded(combo, exclude))
                );
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
    internals.setOutput('node-version', JSON.stringify(sorted), { debug });
    internals.setOutput('lts-latest', ltsLatest, { debug });

    internals.setOutput('runs-on', JSON.stringify(runsOn), { debug });

    internals.setOutput('include', JSON.stringify(include), { debug });
    internals.setOutput('exclude', JSON.stringify(exclude), { debug });
};


if (require.main === module) {
    exports.main();
}
