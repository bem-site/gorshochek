module.exports = {
    languages: ['ru'],
    logger: {
        level: 'debug'
    },
    modelFilePath: './model/model.json',
    destDir: './data',
    tasks: [
        [require('../../../lib/tasks/make-cache-directory')],
        [require('../../../lib/tasks/make-data-directory')],
        [require('../../../lib/tasks/load-model-files')],
        [require('../../../lib/tasks/merge-models')],
        [require('../../../lib/tasks/save-model-file')],
        [require('../../../lib/tasks/analyze-model')]
    ]
};
