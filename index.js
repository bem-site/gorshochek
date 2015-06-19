exports.Builder = require('./lib/index');

exports.tasks = {
    Base: require('./lib/tasks/base'),
    AnalyzeModel: require('./lib/tasks/analyze-model'),
    LoadModelFiles: require('./lib/tasks/load-model-files'),
    MakeDirectory: require('./lib/tasks/make-directory'),
    MakePagesCache: require('./lib/tasks/make-pages-cache'),
    MergeModels: require('./lib/tasks/merge-models'),
    RsyncPages: require('./lib/tasks/rsync-pages'),
    SaveDataFile: require('./lib/tasks/save-data-file'),
    SaveModelFile: require('./lib/tasks/save-model-file')
};
