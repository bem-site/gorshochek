var tasks = require('../index').tasks,
    Builder = require('../index').Builder,

    dataPath = './data',
    cachePath = './.builder/cache',
    builder;

var token = '54fa' + '2926' + '90dc' + '4b54' + '10bb' + '57d0' + '8170' + 'f11d' + '3269' + '1633';

builder = Builder.init('debug')
    .setModelFilePath('./examples/model.ru.json')
    .setDataFolder(dataPath)
    .setCacheFolder(cachePath)
    .addTask(tasks.core.Init)
    .addTask(tasks.docs.LoadFromGithub, {token: token})
    .addTask(tasks.docs.LoadFromFile)
    .addTask(tasks.docs.TransformMdToHtml)
    .addTask(tasks.page.HeaderTitle)
    .addTask(tasks.page.HeaderMeta)
    .addTask(tasks.page.Breadcrumbs)
    .addTask(tasks.sitemap.SitemapXML, {host: 'https://ru.bem.info'})
    .addTask(tasks.core.RsyncCacheData, {exclude: ['*.md', '*.meta.json']});

builder.run();
