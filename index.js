exports.Builder = require('./lib/index');

exports.tasks = {
    core: {
        Base: require('./lib/tasks-core/base'),
        Init: require('./lib/tasks-core/init'),
        RsyncCacheData: require('./lib/tasks-core/rsync-cache-data')
    },
    docs: {
        LoadFromGithub: require('./lib/tasks-docs/load-from-github'),
        LoadFromFile: require('./lib/tasks-docs/load-from-file'),
        TransformBase: require('./lib/tasks-docs/transform-base'),
        TransformMdToHtml: require('./lib/tasks-docs/transform-md-to-html')
    },
    libraries: {},
    page: {
        Base: require('./lib/tasks-page/base'),
        Breadcrumbs: require('./lib/tasks-page/breadcrumbs'),
        HeaderMeta: require('./lib/tasks-page/header-meta'),
        HeaderTitle: require('./lib/tasks-page/header-title'),
        SearchMeta: require('./lib/tasks-page/search-meta')
    },
    sitemap: {
        SitemapXML: require('./lib/tasks-sitemap/sitemap-xml')
    }
};
