var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'make directory'
};

export default class MakeDirectory extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        /*
         * Нужно убедиться что директория ./cache существуетю Если она не существует, то нужно ее создать.
         * В директории ./cache будут находиться промежуточные и всмопогательные файлы для сборки
         */
        var dir = this.getTaskConfig().path;
        this.logger.debug(`Ensure that directory "${dir}" exists. Otherwise it will be created`);

        return new Promise((resolve, reject) => {
            fs.mkdir(dir, error => {
                if(!error || (error && error.code === 'EEXIST')) {
                    resolve(model);
                } else {
                    this.logger.error('Directory creation error occur %s', dir);
                    this.logger.error(error.message);
                    reject(error);
                }
            });
        });
    }
}


