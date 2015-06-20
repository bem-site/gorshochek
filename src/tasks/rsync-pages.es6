import fs from 'fs';
import path from 'path';
import Rsync from 'rsync';
import _ from 'lodash';
import Base from './base';

export default class RsyncPages extends Base {

    static getLoggerName() {
        return module;
    }

    static getName() {
        return 'synchronize pages with data folder';
    }

    /**
     * Debug handler
     * @param {Buffer} data
     * @private
     */
    _onDebug(data) {
        this.logger.debug(data.toString());
    }

    /**
     * Warning handler
     * @param {Buffer} data
     * @private
     */
    _onWarn(data) {
        this.logger.warn(data.toString());
    }

    /**
     * Error handler function. Allow to log error message and code
     * @param {Error} error object
     * @param {Number} code - exit code number
     * @private
     */
    _onError(error, code) {
        this.logger.error(`Error occur while make rsync operation: ${error.message}`);
        this.logger.error(`Rsync exit with code: ${code}`);
    }

    /**
     * Generates rsync options
     * @returns {Object} - rsync options object
     * @private
     */
    _getOptions() {
        var syncOptions = _(this.getBaseConfig().getCacheFolder())
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
                    destination: this.getBaseConfig().getDataFolder(), //целевая папака
                    flags: 'rd' //рекурсивно и с учетом директорий
                }
            })
            .value();

        // добавление в exclude из переданных опций
        // exclude - это паттерны файлов которые должны быть исключены из процесса синхронизации
        if (this.getTaskConfig().exclude) {
            syncOptions.exclude = [].concat(this.getTaskConfig().exclude);
        }

        // добавление в include из переданных опций
        // include - это паттерны файлов которые должны быть включены в процесс синхронизации
        // даже если они находятся в списке exclude.
        if (this.getTaskConfig().include) {
            syncOptions.include = [].concat(this.getTaskConfig().include);
        }

        return syncOptions;
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        // более подробно про rsync можно прочитать здесь http://linux.about.com/library/cmd/blcmdl1_rsync.htm
        var sync = Rsync.build(this._getOptions());

        sync.set('delete'); // удалять файлы в целевой папке если их уже нет в исходной
        sync.set('delete-excluded'); // удалять файлы в целевой папке если их добавили в exclude
        sync.set('force'); //удалять директории даже если они содержат файлы

        // выводим полный текст комманды в консоль
        this.logger.debug(`rsync command: => ${sync.command()}`);

        return new Promise((resolve, reject) => {
            sync.execute((error, code) => {
                if (error || code !== 0) {
                    this._onError(error, code);
                    reject(error);
                } else {
                    this.logger.info('Successfully finish rsync operation for page files');
                    resolve(model);
                }
            }, this._onDebug.bind(this), this._onWarn.bind(this));
        });
    }
}
