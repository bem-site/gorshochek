import path from 'path';
import _ from 'lodash';
import fsExtra from 'fs-extra';
import Base from './base';

export default class LoadModelFiles extends Base {

    static getLoggerName() {
        return module;
    }

    static getName() {
        return 'load model files';
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
         * Есть 2 файла моделей:
         * 1. Текущая модель (с предыдущей сборки)
         * 2. Новая модель (с последними обновлениями)
         * Модель №1 загружается из папки ./model (можно сконфигурировать)
         * Модель №2 загружается из кэша (./cache/model.json)
         * Если новая модель отстутсвует, то все плохо. Сборка прекращает свое выполнение
         * Старая модель может отсутствовать (случай первого запуска).
         * В этом случае старая модель инициализаируется пустой
         */
        try {
            model.setNewModel(fsExtra.readJSONSync(newModelFilePath));
        } catch (error) {
            let errorMessage = `Can\'t read or parse model file "${newModelFilePath}"`;
            this.logger.error(errorMessage);
            return Promise.reject(new Error(errorMessage));
        }

        try {
            model.setOldModel(fsExtra.readJSONSync(oldModelFilePath));
        } catch (error) {
            this.logger.warn(`Can\'t read or parse model file "${newModelFilePath}". New model will be created instead`);
            model.setOldModel([]);
        }

        return Promise.resolve(model);
    }
}
