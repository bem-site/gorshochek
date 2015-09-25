import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import vowNode from 'vow-node';
import js2xml from 'js2xmlparser';
import Base from './base';

export default class SitemapXML extends Base {

    /**
     * Returns logger module
     * @returns {module|Object|*}
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
     * Returns hash with:
     * - {String} keys: available languages from common configuration
     * - {String} values: configured hosts per language
     * @returns {Object}
     * @private
     */
    _getHosts() {
        let hosts = this.getTaskConfig().hosts;
        if(!hosts) {
            throw new Error('Hosts undefined');
        }

        if(_.isString(hosts)) {
            hosts = this.getBaseConfig().getLanguages().reduce((prev, lang) => {
                prev[lang] = hosts;
                return prev;
            }, {})
        }

        return hosts;
    }

    /**
     * Builds sitemap json model which can be converted into xml format
     * @param {Model} model - model object
     * @param {Object} hosts - hosts configuration object
     * @param {Array} languages - array of languages
     * @returns {Array}
     * @private
     */
    _buildSiteMapModel(model, hosts, languages) {
        return model.getPages().reduce((siteMap, page) => {
            const urls = [page.url].concat(page.oldUrls || []);
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
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);
        const hosts = this._getHosts();
        const languages = this.getBaseConfig().getLanguages();
        const filePath = path.join(this.getBaseConfig().getDataFolder(), 'sitemap.xml');
        const siteMap = js2xml('urlset', {url: this._buildSiteMapModel(model, hosts, languages)});

        this.logger
            .debug('Save sitemap.xml file:')
            .debug(`==> to ${filePath}`);

        return vowNode.invoke(fs.writeFile, filePath, siteMap)
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

