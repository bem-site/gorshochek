import fs from 'fs';
import path from 'path';
import Base from './base';

export default class SaveModelFile extends Base {

    static getLoggerName() {
        return module;
    }

    static getName() {
        return 'save data file';
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        var dataFilePath = path.join(this.getBaseConfig().getDataFolder(), 'data.json');

        this.logger.debug('Save data file:');
        this.logger.debug(`==> to ${dataFilePath}`);

        return new Promise((resolve, reject) => {
            fs.writeFile(dataFilePath, JSON.stringify(model.getPages()), (error) => {
                if (error) {
                    this.logger.error('Error occur while saving data.json file');
                    this.logger.error(error.message);
                    return reject(error);
                }
                this.logger.info('Data file has been successfully saved to local filesystem');
                return resolve(model);
            });
        });
    }
}
