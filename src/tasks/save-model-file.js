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
        return 'save model file';
    },

    /**
     * Performs task
     * @returns {Promise}
     */
    run: function (model) {
        this.logger.info('Start to execute "%s" task', this.getName());

        var newModelFilePath = this.getBaseConfig().getModelFilePath(),
            oldModelFilePath = path.join(this.getBaseConfig().getCacheDirPath(), 'model.json');

        this.logger.debug('Copy new model file from %s to %s', newModelFilePath, oldModelFilePath);
        fsExtra.copySync(newModelFilePath, oldModelFilePath);
        return vow.resolve(model);
    }
});

