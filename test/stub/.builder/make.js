var dataPath = './data',
    cachePath = './cache',
    hosts = { en: 'https://my.site.com', ru: 'https://my.site.ru' },
    peoplesUrl = 'https://raw.githubusercontent.com/bem/bem-method/bem-info-data/people/people.json';

module.exports = {
    languages: ['ru', 'en'],
    logger: {
        level: 'debug'
    },
    modelFilePath: './model/model.json',
    cacheDir: cachePath,
    dataDir: dataPath,
    tasks: [
        [require('../../../lib/tasks/make-directory'), { path: cachePath }],
        [require('../../../lib/tasks/make-directory'), { path: dataPath }],
        [require('../../../lib/tasks/load-model-files')],
        [require('../../../lib/tasks/merge-models')],
        [require('../../../lib/tasks/save-model-file')],
        [require('../../../lib/tasks/analyze-model')],
        [require('../../../lib/tasks/collect-meta')],
        [require('../../../lib/tasks/load-people-gh'), { url: peoplesUrl }],
        [require('../../../lib/tasks/create-person-pages'), { baseUrl: '/authors', type: 'authors' }],
        [require('../../../lib/tasks/create-person-pages'), { baseUrl: '/translators', type: 'translators' }],
        [require('../../../lib/tasks/create-tag-pages'), { baseUrl: '/tags' }],
        [require('../../../lib/tasks/build-sitemap-xml'), { hosts: hosts }],
        [require('../../../lib/tasks/save-data-file')]
    ]
};
