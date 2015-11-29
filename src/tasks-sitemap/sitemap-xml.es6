import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import Q from 'q';
import js2xml from 'js2xmlparser';
import Base from '../tasks-core/base';

export default class SitemapXML extends Base {

    /**
     * Constructor
     * @param {Config} baseConfig common configuration instance
     * @param {Object} taskConfig special task configuration object
     */
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig);

        let hosts = this.getTaskConfig().hosts;
        if(!hosts) {
            throw new Error('Hosts undefined');
        }

        if(_.isString(hosts)) {
            hosts = this.getBaseConfig().getLanguages().reduce((prev, lang) => {
                prev[lang] = hosts;
                return prev;
            }, {});
        }

        this._hosts = hosts;
    }

    /**
     * Returns logger module
     * @returns {module|Object|*}
     * @static
     */
    static getLoggerName() {
        return module;
    }

    /**
     * Returns name of task
     * @returns {String}
     * @static
     */
    static getName() {
        return 'build sitemap xml';
    }

    /**
     * Returns object with default search params
     * @returns {{changefreq: String, priority: Number}}
     * @private
     */
    static _getDefaultSearchParams() {
        return {changefreq: 'weekly', priority: 0.5};
    }

    /**
     * Builds sitemap json model which can be converted into xml format
     * @param {Object} hosts - hosts configuration object
     * @param {Array} languages - array of languages
     * @param {Model} model - model object
     * @returns {Array}
     * @private
     */
    _buildSiteMapModel(hosts, languages, model) {
        return model.getPages().reduce((siteMap, page) => {
            const urls = [page.url].concat(page.aliases || []);
            const search = page.search || this.constructor._getDefaultSearchParams();

            languages.forEach((lang) => {
                if(page[lang] && page[lang].published) {
                    urls.forEach((url) => {
                        this.logger.verbose(`page: ${hosts[lang] + url} ${search.changefreq} ${search.priority}`);
                        siteMap.push(_.extend({loc: hosts[lang] + url}, search));
                    });
                }
            });
            return siteMap;
        }, []);
    }

    /**
     * Saves sitemap into sitemap.xml file inside data folder
     * @param {String} siteMap xml representation
     * @returns {Promise}
     * @private
     */
    _saveSiteMapXML(siteMap) {
        const filePath = path.join(this.getBaseConfig().getDataFolder(), 'sitemap.xml');
        this.logger.debug('Save sitemap.xml file:').debug(`==> to ${filePath}`);
        return Q.nfcall(fs.writeFile, filePath, siteMap);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        return _.chain(model)
            .thru(this._buildSiteMapModel.bind(this, this._hosts, this.getBaseConfig().getLanguages()))
            .thru(value => {return {url: value};})
            .thru(js2xml.bind(this, 'urlset'))
            .thru(this._saveSiteMapXML.bind(this))
            .value()
            .then(() => {
                this.logger.info('sitemap.xml file has been successfully saved to local filesystem');
                return model;
            })
            .catch(error => {
                this.logger
                    .error('Error occur while saving sitemap.xml file')
                    .error(error.message);
                throw error;
            });
    }
}

