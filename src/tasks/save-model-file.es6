import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import Base from './base';

export default class SaveModelFile extends Base {

    static getLoggerName() {
        return module;
    }

    static getName() {
        return 'save model file';
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        var newModelFilePath = this.getBaseConfig().getModelFilePath(),
            oldModelFilePath = path.join(this.getBaseConfig().getCacheFolder(), 'model.json');

        /**
         * После сравнения старого и нового файла моделей, нужно поместить новый файл модели
         * на место старого. Т.е. нужно скопировать файл модели из директории ./model
         * (можно конфигурировать) в директорию ./cache
         */
        this.logger.debug('Copy new model file:');
        this.logger.debug(`==> from ${newModelFilePath}`);
        this.logger.debug(`==> to ${oldModelFilePath}`);

        return new Promise((resolve, reject) => {
            fs.createReadStream(newModelFilePath)
                .pipe(fs.createWriteStream(oldModelFilePath))
                .on('error', (error) => { reject(error); })
                .on('close', () => { resolve(model); });
        });
    }
}
