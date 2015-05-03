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
        return 'load model files';
    },

    /**
     * Performs task
     * @returns {Promise}
     */
    run: function () {
        var newModelFilePath = path.resolve(this.getBaseConfig().getModelFilePath()),
            oldModelFilePath = path.resolve(this.getBaseConfig().getCacheDirPath, 'model.json'),
            newModel,
            oldModel;

        try {
            newModel = fsExtra.readJSONSync(newModelFilePath);
        } catch (error) {
            this.logger.error('Can\'t read or parse model file "%s"', newModelFilePath);
            throw error;
        }

        try {
            oldModel = fsExtra.readJSONSync(oldModelFilePath);
        } catch (error) {
            this.logger.warn('Can\'t read or parse model file "%s". New model will be created', newModelFilePath);
            oldModel = [];
        }

        return vow.resolve({ newModel: newModel, oldModel: oldModel });
    }
});
