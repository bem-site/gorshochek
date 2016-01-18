var Model = require('./lib/model');

module.exports = {
    /**
     * Creates empty model instance
     * @returns {Model}
     */
    createModel: function() {
        return new Model();
    },
    tasks: {
        core: {
            mergeModels: require('./lib/tasks/core/merge-models'),
            normalizeModel: require('./lib/tasks/core/normalize-model'),
            saveModel: require('./lib/tasks/core/save-model'),
            rsync: require('./lib/tasks/core/rsync')
        },
        docs: {
            loadFromGithub: require('./lib/tasks/docs/load-from-github'),
            loadFromFile: require('./lib/tasks/docs/load-from-file'),
            transformMdToHtml: require('./lib/tasks/docs/transform-md-html')
        },
        page: {
            createHeaderTitle: require('./lib/tasks/page/header-title'),
            createHeaderMeta: require('./lib/tasks/page/header-meta'),
            createBreadcrumbs: require('./lib/tasks/page/breadcrumbs'),
            createSearchMeta: require('./lib/tasks/page/search-meta')
        },
        sitemap: {
            createSitemapXML: require('./lib/tasks-sitemap/sitemap-xml')
        }
    }
};
