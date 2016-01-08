var tasks = require('../index').tasks,
    Builder = require('../index').Builder,

    dataPath = './data',
    cachePath = './.builder/cache',
    builder;

builder = Builder.init('debug')
    .setModelFilePath('./examples/model.ru.json')
    .setDataFolder(dataPath)
    .setCacheFolder(cachePath)
    .addTask(tasks.core.Init)
    .addTask(tasks.sitemap.SitemapXML, {host: 'https://ru.bem.info'})
    .addTask(tasks.core.RsyncCacheData);

builder.run();

