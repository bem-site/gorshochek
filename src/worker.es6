import path from 'path';
import _ from 'lodash';
import vow from 'vow';
import fsExtra from 'fs-extra';
import Version from './model/libraries/version';

/**
 * Reads *.data.json file from
 * @param {String} basePath — base libraries path inside cache folder
 * @param {String} lib — name of library
 * @param {String} version — name of library version
 * @returns {Promise}
 */
var readFile = (basePath, lib, version) => {
    var filePath = path.join(basePath, lib, version, 'storage.data.json');
    return new Promise((resolve, reject) => {
        fsExtra.readJSON(filePath, (error, content) => {
            error ? reject(error) : resolve(content);
        });
    });
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
module.exports = function (data, callback) {
    const PORTION_SIZE = 3;
    var baseUrl = data.baseUrl, // базовый url для библиотек
        basePath = data.basePath, // базовый путь для сохранения файлов внутри директории кэша
        languages = data.languages, // массив с языками
        queue = data.data;

    // делим очередь версий библиотек на порции размером PORTION_SIZE
    queue = _.chunk(queue, PORTION_SIZE);

    // порциями обрабатываем версии библиотек для каждой порции одновременно обрабатываем версии библиотек
    // Открываем скачанный *.json файл
    // Создаем новый объект класса Version и процессим data-файл версии библиотеки
    return queue
        .reduce((prev, portion) => {
            return prev.then(() => {
                return vow.all(portion.map(item => {
                    var lib = item.lib,
                        version = item.version;

                    return readFile(basePath, lib, version)
                        .then((new Version(baseUrl, basePath, lib, version, languages)).processData);
                }));
            });
        }, vow.resolve())
        .then(() => {
            callback(null);
        })
        .fail((error) => {
            callback(error, process.pid);
        });
};
