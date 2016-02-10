const Model = require('./lib/model');

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
            saveModel: require('./lib/tasks/core/save-model'),
            rsync: require('./lib/tasks/core/rsync')
        },
        docs: {
            loadSourceFromGithub: require('./lib/tasks/docs/load-from-github'),
            loadSourceFromLocal: require('./lib/tasks/docs/load-from-file'),
            transformMdToHtml: require('./lib/tasks/docs/transform-md-html')
        },
        meta: {
            generateTagPages: require('./lib/tasks/meta/tags')
        },
        page: {
            createHeaderTitle: require('./lib/tasks/page/header-title'),
            createHeaderMeta: require('./lib/tasks/page/header-meta'),
            createBreadcrumbs: require('./lib/tasks/page/breadcrumbs'),
            createSearchMeta: require('./lib/tasks/page/search-meta')
        },
        override: {
            overrideDocLinks: require('./lib/tasks/override/override-docs')
        },
        sitemap: {
            createSitemapXML: require('./lib/tasks/sitemap/sitemap-xml')
        }
    }
};
