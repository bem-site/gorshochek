exports.Builder = require('./lib/index');

exports.tasks = {
    Base: require('./lib/tasks/base'),
    Init: require('./lib/tasks/init'),
    Finalize: require('./lib/tasks/finalize')
};
