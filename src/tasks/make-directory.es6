import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import mkdirp from 'mkdirp';
import Base from './base';

export default class MakeDirectory extends Base {

    static getLoggerName() {
        return module;
    }

    static getName() {
        return 'make directory';
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun();

        /*
         * Нужно убедиться что директория существует Если она не существует, то нужно ее создать.
         */
        var dir = this.getTaskConfig().path;
        this.logger.debug(`Ensure that directory "${dir}" exists. Otherwise it will be created`);

        return new Promise((resolve, reject) => {
            mkdirp(dir, (error) => {
                if(error) {
                    this.logger.error('Directory creation error occur %s', dir);
                    this.logger.error(error.message);
                    reject(error);
                } else {
                    resolve(model);
                }
            });
        });
    }
}


