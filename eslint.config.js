'use strict';

const HapiPlugin = require('@hapi/eslint-plugin');

const HapiRecommended = HapiPlugin.configs.recommended;

module.exports = [
    ...HapiRecommended
];
