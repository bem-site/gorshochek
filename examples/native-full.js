var Q = require('q'),
    gorshochek = require('../index'),
    token = process.env.TOKEN;

var model = gorshochek.createModel(),
    tasks = gorshochek.tasks;

// TODO: run everything possible in parallel

Q()
    .then(tasks.core.mergeModels(model, {modelPath: './examples/model.ru.json'}))
    .then(tasks.core.normalizeModel(model))
    .then(tasks.meta.tags(model))
    .then(tasks.docs.loadFromGithub(model, {token: token}))
    .then(tasks.docs.loadFromFile(model))
    .then(tasks.docs.transformMdToHtml(model))
    .then(tasks.page.createHeaderTitle(model))
    .then(tasks.page.createHeaderMeta(model))
    .then(tasks.page.createBreadcrumbs(model))
    .then(tasks.override.overrideDocLinks(model))
    .then(tasks.sitemap.createSitemapXML(model, {host: 'https://ru.bem.info'}))
    .then(tasks.core.saveModel(model))
    .then(tasks.core.rsync(model, {
        dest: './data',
        exclude: ['*.meta.json', 'model.json', '*.md']
    }));
