var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    js2xml = require('js2xmlparser');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'build sitemap xml'
};

export default class BuildSitemapXML extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    /**
     * Returns hash with:
     * - {String} keys: available languages from common configuration
     * - {String} values: configured hosts per language
     * @returns {Object}
     * @private
     */
    _getHosts() {
        // Достаем конфигурацию хостов из конфигурационнго объекта данной задачи
        var hosts = this.getTaskConfig().hosts

        // Хосты - это обязательный параметр.
        // Если они отсутствуют, то бросается соответствующее исключение
        if (!hosts) {
            throw new Error('Hosts undefined');
        }

        // Параметр хостов может быть как обхектом так и строкой
        // В случае стоки, превращаем ее в объект где данная строка
        // является значением к ключам которыми являются языки
        if (_.isString(hosts)) {
            hosts = this.getBaseConfig().getLanguages().reduce((prev, lang) => {
                prev[lang] = hosts;
                return prev;
            }, {})
        }

        return hosts;
    }

    /**
     * Returns object with default search params
     * @returns {{changefreq: string, priority: number}}
     * @private
     */
    _getDefaultSearchParams() {
        // параметры поисковой индексации по умолчанию
        return { changefreq: 'weekly', priority: 0.5 };
    }

    /**
     * Returns path where sitemap.xml file should be placed in
     * @returns {string|*}
     * @private
     */
    _getSiteMapXmlFilePath() {
        // путь по которому будет сохранен файл sitemap.xml
        return path.join(this.getBaseConfig().getDestinationDirPath(), 'sitemap.xml');
    }

    /**
     *
     * @param {Model} model - model object
     * @param {Object} hosts - hosts configuration object
     * @param {Array} languages - array of languages
     * @returns {Object}
     * @private
     */
    _buildSiteMapModel(model, hosts, languages) {
        /*
        * В цикле перебираются все страницы
        * Для каждой страницы строится результирующий массив из url и oldUrls
        * Так как для страницы могут быть заданы специальные настройки поисковой индексации,
        * то происходит проверка по результатам которой берутся индивидуальные поисковые настройки
        * страницы или настройки по умолчанию.
        * Для каждого языковой версии каждой страницы при условии, что эта страница является
        * видимой (published == true), в итоговый массив sitemap добавляется объект:
        * { loc: host[lang] + url, changefreq: '...', priority: 'число от 0 до 1.0'},
        * где: host[lang] + url - полный адрес страницы включая протокол, хост и.т.д.
        */
        return model.getPages().reduce((siteMap, page) => {
            var urls = [page.url].concat(page.oldUrls),
                search = page.search || this._getDefaultSearchParams();

            languages.forEach((lang) => {
                if (page[lang] && page[lang].published) {
                    urls.forEach((url) => {
                        this.logger.verbose(`page: ${hosts[lang] + url} ${search.changefreq} ${search.priority}`)
                        siteMap.push(_.extend({ loc: hosts[lang] + url }, search));
                    });
                }
            });
            return siteMap;
        }, []);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        // построенная в _buildSiteMapModel js модель sitemap.xml файла
        // преобразуется в xml формат с помощью модуля js2xml
        var hosts = this._getHosts(),
            languages = this.getBaseConfig().getLanguages(),
            siteMap = js2xml('urlset', { url: this._buildSiteMapModel(model, hosts, languages) });

        this.logger.debug('Save sitemap.xml file:');
        this.logger.debug(`==> to ${this._getSiteMapXmlFilePath()}`);

        // содержимое sitemap.xml сохраняется в соответствующий файл
        return new Promise((resolve, reject) => {
            fs.writeFile(this._getSiteMapXmlFilePath(), siteMap, (error) => {
                if (error) {
                    this.logger.error('Error occur while saving sitemap.xml file');
                    this.logger.error(error.message);
                    return reject(error);
                }
                this.logger.info('sitemap.xml file has been successfully saved to local filesystem');
                return resolve(model);
            });
        });
    }
}

