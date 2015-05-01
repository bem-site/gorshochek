var path = require('path'),
    vow = require('vow'),
    inherit = require('inherit'),
    fsExtra = require('fs-extra'),
    Base = require('./base');

module.exports = inherit(Base, {

    logger: undefined,

    __constructor: function (baseConfig, taskConfig) {
        this.__base(baseConfig, taskConfig);
        this.logger = this.createLogger(module);
        this.logger.info('Initialize "%s" task successfully', this.getName());
    },

    /**
     * Returns name of current task
     * @returns {string} - name of task
     */
    getName: function () {
        return 'make destination directory';
    },

    /**
     * Performs task
     * @returns {Promise}
     */
    run: function () {
        var dir;

        this.logger.info('Start to execute "%s" task', this.getName());

        dir = this.getBaseConfig().getDestinationDirPath();
        dir = path.resolve(dir);

        this.logger.debug('Ensure that directory "%s" exists. Otherwise it will be created', dir);

        fsExtra.ensureDirSync(dir);
        return vow.resolve();
    }
});
