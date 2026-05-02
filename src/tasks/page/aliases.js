'use strict';

const path = require('path');
const Q = require('q');
const baseUtil = require('../../util');

const debug = require('debug')('page aliases');

/**
 * Creates static HTML redirect pages for page aliases.
 * @param {Model} model - application model instance
 * @param {Object} [options] - task options object
 * @param {String} [options.destination] - output folder path for alias pages (./output by default)
 * @param {Number} [options.concurrency] - number of pages processed at the same time
 * @returns {Function}
 */
module.exports = (model, options) => {
    options = options || {};
    options.destination = options.destination || './output';
    options.concurrency = options.concurrency || 20;

    function hasAliases(page) {
        return baseUtil.isPagePublished(page) && page.aliases && page.aliases.length;
    }

    function createRedirectHtml(page) {
        return [
            '<html>',
            '  <head>',
            `    <title>${page.title}</title>`,
            `    <META http-equiv="refresh" content="0;URL=${page.url}">`,
            '  </head>',
            '  <body></body>',
            '</html>'
        ].join('\n');
    }

    function saveAliasPage(page, alias, html) {
        const filePath = path.join(options.destination, alias, 'index.html');

        debug(`save alias page ${alias} -> ${page.url}: ${filePath}`);
        return baseUtil.writeFile(filePath, html);
    }

    function processPage(model, page) {
        const html = createRedirectHtml(page);

        return Q.all(page.aliases.map(alias => saveAliasPage(page, alias, html)));
    }

    return () => {
        return baseUtil
            .processPagesAsync(model, hasAliases, processPage, options.concurrency)
            .thenResolve(model);
    };
};
