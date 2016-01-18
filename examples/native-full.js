var Q = require('q'),
    gorshochek = require('../index'),
    // TODO: get via ENV vars
    token = '54fa292690dc4b5410bb' + '57d08170f11d32691633';

var model = gorshochek.createModel(),
    tasks = gorshochek.tasks;

// TODO: run everything possible in parallel

Q()
    .then(tasks.core.mergeModels(model, {modelPath: './examples/model.ru.json'}))
    .then(tasks.core.normalizeModel(model))
    .then(tasks.docs.loadFromGithub(model, {token: token}))
    .then(tasks.docs.loadFromFile(model))
    .then(tasks.docs.transformMdToHtml(model))
    .then(tasks.page.createHeaderTitle(model))
    .then(tasks.page.createHeaderMeta(model))
    .then(tasks.page.createBreadcrumbs(model))
    .then(tasks.sitemap.createSitemapXML(model, {host: 'https://ru.bem.info'}))
    .then(tasks.core.saveModel(model))
    .then(tasks.core.rsync(model, {
        dest: './data',
        exclude: ['*.meta.json', 'model.json', '*.md']
    }));
