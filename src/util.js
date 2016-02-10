import fs from 'fs';
import path from 'path';
import Q from 'q';
import _ from 'lodash';
import fsExtra from 'fs-extra';

const debug = require('debug')('util');

/**
 * Returns path to cache folder
 * It can be set as process environment variable
 * By default it is pointed to ./.builder/cache relative to current working directory
 * @returns {String}
 */
export function getCacheFolder() {
    return process.env.GORSHOCHEK_CACHE_FOLDER || './.builder/cache';
}

/**
 * Creates folder for given path if it does not exists yet
 * @param {String} folder - path to folder which should be created
 */
export function createFolder(folder) {
    debug(`create folder: ${folder}`);
    fsExtra.ensureDirSync(folder);
}

/**
 * Copies file from sourcePath to destinationPath
 * @param {String} sourcePath - source file path
 * @param {String} destinationPath - destination file path
 */
export function copyFile(sourcePath, destinationPath) {
    debug(`copy file from: ${sourcePath} to: ${destinationPath}`);
    return Q.denodeify(fsExtra.copy)(sourcePath, destinationPath);
}

/**
 * Reads file from local filesystem.
 * @param {Function} method - function which is used for reading
 * @param {String} filePath - path to file
 * @param {*} [fallbackValue] - value which will be returned if file does not exist on local filesystem
 * @returns {*|Promise.<T>}
 * @private
 */
function _readFile(method, filePath, fallbackValue) {
    return Q.denodeify(method)(filePath, {encoding: 'utf-8'})
        .catch(error => {
            if(fallbackValue && error.code === 'ENOENT') {
                return fallbackValue;
            }
            console.error(`Can\'t read file ${filePath}`);
            throw error;
        });
}

/**
 * Reads file from local filesystem
 * @param {String} filePath - path to file on local filesystem
 * @param {*} [fallbackValue] - value which will be returned if file does not exist on local filesystem
 * @returns {*|Promise.<T>}
 */
export function readFile(filePath, fallbackValue) {
    debug(`read file from: ${filePath}`);
    return _readFile(fs.readFile, filePath, fallbackValue);
}

/**
 * Read JSON file from local filesystem
 * @param {String} filePath - path to file
 * @param {*} [fallbackValue] - value which will be returned if file does not exist on local filesystem
 * @returns {*|Promise.<T>}
 */
export function readJSONFile(filePath, fallbackValue) {
    debug(`read JSON file from: ${filePath}`);
    return _readFile(fsExtra.readJSON, filePath, fallbackValue);
}

/**
 * Reads file from cache folder
 * @param {String} filePath - path to file (relative to cache folder)
 * @param {Object|Array} [fallbackValue] value which will be returned if file does not exist on local filesystem
 * @returns {Promise}
 */
export function readFileFromCache(filePath, fallbackValue) {
    debug(`read file from cache: ${filePath}`);
    return (path.extname(filePath) === '.json' ?
        readJSONFile : readFile)(path.join(getCacheFolder(), filePath), fallbackValue);
}

/**
 * Writes file to cache folder
 * @param {String} filePath - path to file (relative to cache folder)
 * @param {String} content of file
 * @returns {Promise}
 */
export function writeFileToCache(filePath, content) {
    debug(`write file to cache: ${filePath}`);
    return writeFile(path.join(getCacheFolder(), filePath), content);
}

/**
 * Writes file to local filesystem
 * @param {String} filePath - path to file
 * @param {String} content - content of file
 * @returns {Promise}
 */
export function writeFile(filePath, content) {
    debug(`write file to: ${filePath}`);
    const dirPath = path.dirname(filePath);
    return Q.denodeify(fsExtra.ensureDir)(dirPath)
        .then(() => {
            return Q.denodeify(fs.writeFile)(filePath, content, {encoding: 'utf-8'});
        })
        .catch(error => {
            console.error(`Error occured while saving file ${filePath}`);
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
export function processPagesAsync(model, criteria, processFunc, portionSize = 5) {
    criteria = criteria || (() => true);

    return _(model.getPages())
        .filter(criteria)
        .chunk(portionSize)
        .reduce((prev, portion, index) => {
            return prev.then(() => {
                debug('process portion of pages in range: %s - %s', index * portionSize, (index + 1) * portionSize);
                return Q.allSettled(portion.map(processFunc.bind(null, model)));
            });
        }, Q());
}

// try to create cache folder on initialization
createFolder(getCacheFolder());
