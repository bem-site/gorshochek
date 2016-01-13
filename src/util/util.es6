import fs from 'fs';
import path from 'path';
import Q from 'q';
import _ from 'lodash';
import fsExtra from 'fs-extra';

const CACHE_FOLDER = './.builder/cache';
createFolder(CACHE_FOLDER);

export function getCacheFolder() {
    return CACHE_FOLDER;
}

/**
 * Creates folder for given path if it does not exists yet
 * @param {String} folder - path to folder which should be created
 */
export function createFolder(folder) {
    fsExtra.ensureDirSync(folder);
}

export function copyFile(sourcePath, destinationPath) {
    return Q.nfcall(fsExtra.copy, sourcePath, destinationPath);
}

/**
 * Read JSON file from local filesystem
 * @param {String} filePath - path to file
 * @param {*} fallbackValue - value which will be returned if file does not exist on local filesystem
 * @returns {*|Promise.<T>}
 */
export function readJSONFile(filePath, fallbackValue) {
    return Q
        .nfcall(fsExtra.readJSON, filePath, {encoding: 'utf-8'})
        .catch(error => {
            if(!fallbackValue || error.code !== 'ENOENT') {
                console.error(`Can\'t read or parse JSON file ${filePath}`);
                throw error;
            }
            return fallbackValue;
        });
}

/**
 * Reads file from cache folder
 * @param {String} filePath - path to file (relative to cache folder)
 * @param {Boolean} isJSON - use embedded JSON parsing for json files
 * @param {Object|Array} [fallbackValue] if set then fallback value
 * will be returned if file does not exists in cache
 * @returns {Promise}
 */
export function readFileFromCache(filePath, isJSON, fallbackValue) {
    const func = isJSON ? fsExtra.readJSON : fs.readFile;
    filePath = path.join(CACHE_FOLDER, filePath);

    return Q.nfcall(func, filePath, {encoding: 'utf-8'})
        .catch(error => {
            if(!fallbackValue || error.code !== 'ENOENT') {
                console.error(`Error occur while loading file ${filePath} from cache`);
                throw error;
            }
            return fallbackValue;
        });
}

/**
 * Writes file to cache folder
 * @param {String} filePath - path to file (relative to cache folder)
 * @param {String} content of file
 * @returns {Promise}
 */
export function writeFileToCache(filePath, content) {
    filePath = path.join(CACHE_FOLDER, filePath);
    const dirPath = path.dirname(filePath);

    return Q.nfcall(fsExtra.ensureDir, dirPath)
        .then(() => {
            return Q.nfcall(fs.writeFile, filePath, content, {encoding: 'utf-8'});
        })
        .catch(error => {
            console.error(`Error occur while saving file ${filePath} to cache`);
            throw error;
        });
}

/**
 * Processes all pages in model which satisfies to given criteria function
 * @param {Model} model - application model instance
 * @param {Function} criteria - page criteria function
 * @param {Function} processFunc - function which will be applied to each of pages filtered by criteria
 * @param {Number} portionSize - number of portion of pages for parallel operations
 * @returns {Promise}
 */
// TODO разобраться с контекстом выполнения функции
export function processPagesAsync(model, criteria, processFunc, portionSize = 5) {
    criteria = criteria || _.constant(true);

    return _(criteria)
        .thru(model.getPagesByCriteria.bind(model))
        .chunk(portionSize)
        .reduce((prev, portion, index) => {
            return prev.then(() => {
                // this.logger.debug('process portion of pages in range %s - %s',
                    // index * portionSize, (index + 1) * portionSize);
                return Q.allSettled(portion.map(processFunc.bind(this, model)));
            });
        }, Q());
}
