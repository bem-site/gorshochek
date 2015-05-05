var _ = require('lodash'),
    path = require('path'),
    fsExtra = require('fs-extra');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'make cache directory'
};

export default class MakeCacheDirectory extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run() {
        this.beforeRun(this.name);

        /*
        * Нужно убедиться что директория ./cache существуетю Если она не существует, то нужно ее создать.
        * В директории ./cache будут находиться промежуточные и всмопогательные файлы для сборки
        */
        var dir = this.getBaseConfig().getCacheDirPath();
        this.logger.debug(`Ensure that directory "${dir}" exists. Otherwise it will be created`);

        fsExtra.ensureDirSync(dir);
        return Promise.resolve();
    }
}

