var Builder = require('../lib/index'),

    dataPath = './data',
    cachePath = './.builder/cache',
// token = '7a073062f4280dd2ef3b7c0472b08ba295e3c8ed',
// hosts = { en: 'https://bem.info', ru: 'https://ru.bem.info' },
// peoplesUrl = 'https://raw.githubusercontent.com/bem/bem-method/bem-info-data/people/people.json',
    builder;

builder = Builder.init('debug')
    .setLanguages(['en', 'ru'])
    .setModelFilePath('./model/model.json')
    .setDataFolder(dataPath)
    .setCacheFolder(cachePath)
    .addTask(require('./lib/tasks/make-directory'), { path: cachePath })
    .addTask(require('./lib/tasks/make-directory'), { path: dataPath })
    .addTask(require('./lib/tasks/load-model-files'))
    .addTask(require('./lib/tasks/merge-models'))
    .addTask(require('./lib/tasks/save-model-file'))
    .addTask(require('./lib/tasks/analyze-model'))
    /*
     .addTask(require('../lib/tasks/collect-meta'))
     .addTask(require('../lib/tasks/load-people-gh'), { url: peoplesUrl })
     .addTask(require('../lib/tasks/create-person-pages'), { baseUrl: '/authors', type: 'authors' })
     .addTask(require('../lib/tasks/create-person-pages'), { baseUrl: '/translators', type: 'translators' })
     .addTask(require('../lib/tasks/create-tag-pages'), { baseUrl: '/tags' })
     */
    .addTask(require('./lib/tasks/make-pages-cache'))
    /*
     .addTask(require('../lib/tasks/docs-load-gh'), { token: token })
     .addTask(require('../lib/tasks/docs-md-html'))
     .addTask(require('../lib/tasks/build-sitemap-xml'), { hosts: hosts })
     */
    .addTask(require('./lib/tasks/save-data-file'));

builder.run();

