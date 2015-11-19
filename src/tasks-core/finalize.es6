import fs from 'fs';
import path from 'path';
import Rsync from 'rsync';
import _ from 'lodash';
import Q from 'q';
import Base from './base';

export default class Finalize extends Base {

    static getLoggerName() {
        return module;
    }

    static getName() {
        return 'finalize';
    }

    /**
     * Generates rsync options
     * @returns {Object} - rsync options object
     * @private
     */
    _getOptions() {
        return _(this.getBaseConfig().getCacheFolder())
            .thru(folder => {
                return fs.readdirSync(folder);
            })
            .filter(item => {
                return item !== 'model.json';
            })
            .map(item => {
                return path.join(this.getBaseConfig().getCacheFolder(), item);
            })
            .thru(sources => {
                return {
                    source: sources, // все папки откуда нужно совершить rsync
                    destination: this.getBaseConfig().getDataFolder(), // целевая папака
                    flags: 'rd' // рекурсивно и с учетом директорий
                };
            })
            .tap(options => {
                // добавление в exclude из переданных опций
                // exclude - это паттерны файлов которые должны быть исключены из процесса синхронизации
                if(this.getTaskConfig().exclude) {
                    options.exclude = [].concat(this.getTaskConfig().exclude);
                }
            })
            .tap(options => {
                // добавление в include из переданных опций
                // include - это паттерны файлов которые должны быть включены в процесс синхронизации
                // даже если они находятся в списке exclude.
                if(this.getTaskConfig().include) {
                    options.include = [].concat(this.getTaskConfig().include);
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
        this.beforeRun(this.name);

        return Promise.all([
            this._syncPageFiles(model),
            this._saveDataFile(model)
        ]);
    }
}
