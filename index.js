var Model = require('./lib/model'),
    tasks = {};

tasks.core = {};
tasks.core.mergeModels = require('./lib/tasks-core/merge-models');
tasks.core.normalizeModel = require('./lib/tasks-core/normalize-model');
tasks.core.saveModel = require('./lib/tasks-core/save-model');
tasks.core.rsync = require('./lib/tasks-core/rsync');

tasks.docs = {};
tasks.docs.loadFromGithub = require('./lib/tasks-docs/load-from-github');
tasks.docs.loadFromFile = require('./lib/tasks-docs/load-from-file');
tasks.docs.transformMdToHtml = require('./lib/tasks-docs/transform-md-html');

tasks.page = {};
tasks.page.createHeaderTitle = require('./lib/tasks-page/header-title');
tasks.page.createHeaderMeta = require('./lib/tasks-page/header-meta');
tasks.page.createBreadcrumbs = require('./lib/tasks-page/breadcrumbs');
tasks.page.createSearchMeta = require('./lib/tasks-page/search-meta');

tasks.sitemap = {};
tasks.sitemap.createSitemapXML = require('./lib/tasks-sitemap/sitemap-xml');

exports.tasks = tasks;

/**
 * Creates empty model instance
 * @returns {Model}
 */
exports.createModel = function() {
    return new Model();
};
