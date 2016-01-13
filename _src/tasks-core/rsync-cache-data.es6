import fs from 'fs';
import path from 'path';
import Rsync from 'rsync';
import _ from 'lodash';
import Q from 'q';
import Base from './base';

export default class RsyncCacheData extends Base {

    static getLoggerName() {
        return module;
    }

    static getName() {
        return 'rsync-cache-data';
    }

    /**
     * Generates rsync options
     * @returns {Object} - rsync options object
     * @private
     */
    _getOptions() {
        return _(this.getBaseConfig().getCacheFolder())
            .thru(fs.readdirSync)
            .filter(item => item !== 'model.json')
            .map(item => path.join(this.getBaseConfig().getCacheFolder(), item))
            .thru(sources => {
                return {
                    source: sources, // все папки откуда нужно совершить rsync
                    destination: this.getBaseConfig().getDataFolder(), // целевая папака
                    flags: 'rd' // рекурсивно и с учетом директорий
                };
            })
            .tap(options => {
                if(this.getTaskConfig().exclude) {
                    options.exclude = [].concat(this.getTaskConfig().exclude);
                }
            })
            .value();
    }

    _syncPageFiles(model) {
        // более подробно про rsync можно прочитать здесь http://linux.about.com/library/cmd/blcmdl1_rsync.htm
        const sync = Rsync.build(this._getOptions());
        const onDebug = (data) => {
            this.logger.debug(data.toString());
        };
        const onWarn = (data) => {
            this.logger.warn(data.toString());
        };
        const onError = (error, code) => {
            this.logger
                .error(`Error occur while make rsync operation: ${error.message}`)
                .error(`Rsync exit with code: ${code}`);
        };

        sync.set('delete'); // удалять файлы в целевой папке если их уже нет в исходной
        sync.set('delete-excluded'); // удалять файлы в целевой папке если их добавили в exclude
        sync.set('force'); // удалять директории даже если они содержат файлы

        // выводим полный текст комманды в консоль
        this.logger.debug(`rsync command: => ${sync.command()}`);

        return new Promise((resolve, reject) => {
            sync.execute((error, code) => {
                if(error || code !== 0) {
                    error = error || new Error('rsync error with code ' + code);
                    onError(error, code);
                    reject(error);
                } else {
                    this.logger.info('Successfully finish rsync operation for page files');
                    resolve(model);
                }
            }, onDebug.bind(this), onWarn.bind(this));
        });
    }

    _saveDataFile(model) {
        const dataFilePath = path.join(this.getBaseConfig().getDataFolder(), 'data.json');

        this.logger.debug('Save data file:').debug(`==> to ${dataFilePath}`);
        return Q.nfcall(fs.writeFile, dataFilePath, JSON.stringify(model.getPages()))
            .catch(error => {
                this.logger
                    .error('Error occur while saving data.json file').error(error.message);
                throw error;
            });
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        return Q.all([
            this._syncPageFiles(model),
            this._saveDataFile(model)
        ]).thenResolve(model);
    }
}
