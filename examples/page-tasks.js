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
    .addTask(tasks.page.HeaderTitle)
    .addTask(tasks.page.HeaderMeta)
    .addTask(tasks.page.Breadcrumbs)
    .addTask(tasks.core.RsyncCacheData);

builder.run();

