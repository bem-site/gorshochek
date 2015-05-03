var path = require('path'),
    vow = require('vow'),
    inherit = require('inherit'),
    fsExtra = require('fs-extra'),
    Base = require('../base');

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
        return 'make base directory';
    },

    getFolderPath: function () {
        return path.resolve('./');
    },

    /**
     * Performs task
     * @returns {Promise}
     */
    run: function () {
        this.logger.info('Start to execute "%s" task', this.getName());

        var dir = this.getFolderPath();
        this.logger.debug('Ensure that directory "%s" exists. Otherwise it will be created', dir);

        fsExtra.ensureDirSync(dir);
        return vow.resolve();
    }
});
