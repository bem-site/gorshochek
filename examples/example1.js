var tasks = require('../index').tasks,
    Builder = require('../index').Builder,

    dataPath = './data',
    cachePath = './.builder/cache',
    builder;

builder = Builder.init('debug')
    .setLanguages(['en', 'ru'])
    .setModelFilePath('./model/model.json')
    .setDataFolder(dataPath)
    .setCacheFolder(cachePath)
    .addTask(tasks.MakeDirectory, { path: cachePath })
    .addTask(tasks.MakeDirectory, { path: dataPath })
    .addTask(tasks.LoadModelFiles)
    .addTask(tasks.MergeModels)
    .addTask(tasks.SaveModelFile)
    .addTask(tasks.AnalyzeModel)
    .addTask(tasks.MakePagesCache)
    .addTask(tasks.SaveDataFile);

builder.run();
