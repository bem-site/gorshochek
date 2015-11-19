import path from 'path';
import _ from 'lodash';
import Q from 'q';
import fsExtra from 'fs-extra';
import Version from './model/version';

/**
 * Reads *.data.json file from
 * @param {String} basePath — base libraries path inside cache folder
 * @param {String} lib — name of library
 * @param {String} version — name of library version
 * @returns {Promise}
 */
const readFile = (basePath, lib, version) => {
    return Q.nfcall(fsExtra.readJSON, path.join(basePath, lib, version, 'storage.data.json'));
};

/**
 * Exports function that performs processing of array of library versions
 * @param {Object} data — object which contains all necessary parameters
 * @param {String} data.baseUrl — base libraries url
 * @param {String} data.basePath — base libraries path inside cache folder
 * @param {Object[]} data.data — array of library version objects
 * @param {String[]} data.languages — array of languages
 * @param {Function} callback function
 * @returns {Promise}
 */
module.exports = function(data, callback) {
    const PORTION_SIZE = 3;
    const baseUrl = data.baseUrl; // базовый url для библиотек
    const basePath = data.basePath; // базовый путь для сохранения файлов внутри директории кэша
    const languages = data.languages; // массив с языками
    let queue = data.data;

    // делим очередь версий библиотек на порции размером PORTION_SIZE
    queue = _.chunk(queue, PORTION_SIZE);

    // порциями обрабатываем версии библиотек для каждой порции одновременно обрабатываем версии библиотек
    // Открываем скачанный *.json файл
    // Создаем новый объект класса Version и процессим data-файл версии библиотеки
    return queue
        .reduce((prev, portion) => {
            return prev.then(() => {
                return Q.all(portion.map(item => {
                    const lib = item.lib;
                    const version = item.version;

                    return readFile(basePath, lib, version)
                        .then((new Version(baseUrl, basePath, lib, version, languages)).processData);
                }));
            });
        }, Q())
        .then(() => {
            callback(null);
        })
        .fail((error) => {
            callback(error, process.pid);
        });
};
