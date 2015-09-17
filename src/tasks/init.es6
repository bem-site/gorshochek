import path from 'path';
import Base from './base';

export default class Init extends Base {

    static getLoggerName() {
        return module;
    }

    /**
     * Returns name of task
     * @returns {string}
     */
    static getName() {
        return 'init';
    }

    /**
     * Creates folder
     * @param {String} dir - path to directory which should be created
     * @returns {Init}
     * @private
     */
    _makeFolder(dir) {
        /*
         * Нужно убедиться что директория существует Если она не существует, то нужно ее создать.
         */
        this.logger.debug(`Ensure that directory "${dir}" exists. Otherwise it will be created`);
        this.fsExtra.ensureDirSync(dir);
        return this;
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun();

        try {
            this
                ._makeFolder(this.getBaseConfig().getCacheFolder())
                ._makeFolder(this.getBaseConfig().getDataFolder());

            const newModelFilePath = this.getBaseConfig().getModelFilePath();
            const oldModelFilePath = path.join(this.getBaseConfig().getCacheFolder(), 'model.json');

            /**
             * Есть 2 файла моделей:
             * 1. Текущая модель (с предыдущей сборки)
             * 2. Новая модель (с последними обновлениями)
             * Модель №1 загружается из папки ./model (можно сконфигурировать)
             * Модель №2 загружается из кэша (./.builder/cache/model.json)
             * Если новая модель отстутсвует, то все плохо. Сборка прекращает свое выполнение
             * Старая модель может отсутствовать (случай первого запуска).
             * В этом случае старая модель инициализаируется пустой
             */
            try {
                model.setNewModel(this.fsExtra.readJSONSync(newModelFilePath));
            } catch (error) {
                const errorMessage = `Can\'t read or parse model file "${newModelFilePath}"`;
                this.logger.error(errorMessage);
                throw(new Error(errorMessage));
            }

            try {
                model.setOldModel(this.fsExtra.readJSONSync(oldModelFilePath));
            } catch (error) {
                this.logger.warn(`Can\'t read or parse model file "${newModelFilePath}". New model will be created instead`);
                model.setOldModel([]);
            }

            model.merge();

            ['added', 'modified', 'removed'].forEach(type => {
                model.getChanges().pages[type].forEach(item => {
                    this.logger.debug(`Page with url: ${item.url} was ${type}`);
                });
            });

            /**
             * После сравнения старого и нового файла моделей, нужно поместить новый файл модели
             * на место старого. Т.е. нужно скопировать файл модели из директории ./model
             * (можно конфигурировать) в директорию ./cache
             */
            this.logger
                .info('Models were merged successfully')
                .debug('Copy new model file:')
                .debug(`==> from ${newModelFilePath}`)
                .debug(`==> to ${oldModelFilePath}`);

            this.fsExtra.copySync(newModelFilePath, oldModelFilePath);

            model.normalize(this.getBaseConfig().getLanguages());

            return Promise.resolve(model);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
