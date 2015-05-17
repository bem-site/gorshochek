var hosts = { en: 'https://bem.info', ru: 'https://ru.bem.info' },
    peoplesUrl = 'https://raw.githubusercontent.com/bem/bem-method/bem-info-data/people/people.json';

module.exports = {
    languages: ['ru', 'en'],
    logger: {
        level: 'debug'
    },
    modelFilePath: './model/model.json',
    destDir: './data',
    tasks: [
        [require('../lib/tasks/make-cache-directory')],
        [require('../lib/tasks/make-data-directory')],
        [require('../lib/tasks/load-model-files')],
        [require('../lib/tasks/merge-models')],
        [require('../lib/tasks/save-model-file')],
        [require('../lib/tasks/analyze-model')],
        [require('../lib/tasks/collect-meta')],
        [require('../lib/tasks/load-people'), { url: peoplesUrl }],
        [require('../lib/tasks/create-person-pages'), { baseUrl: '/authors', type: 'authors' }],
        [require('../lib/tasks/create-person-pages'), { baseUrl: '/translators', type: 'translators' }],
        [require('../lib/tasks/create-tag-pages'), { baseUrl: '/tags' }],
        [require('../lib/tasks/build-sitemap-xml'), { hosts: hosts }],
        [require('../lib/tasks/save-data-file')]
    ]
};
