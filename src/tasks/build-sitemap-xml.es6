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

    _getHosts() {
        var hosts = this.getTaskConfig().hosts

        if (!hosts) {
            throw new Error('Hosts undefined');
        }

        if (_.isString(hosts)) {
            hosts = this.getBaseConfig().getLanguages().reduce((prev, lang) => {
                prev[lang] = hosts;
                return prev;
            }, {})
        }

        return hosts;
    }

    _getDefaultSearchParams() {
        return { changefreq: 'weekly', priority: 0.5 };
    }

    _getSitemapXmlFilePath() {
        return path.join(this.getBaseConfig().getDestinationDirPath(), 'sitemap.xml');
    }

    _buildSiteMapModel(model, hosts, languages) {
        return model.getPages().reduce((siteMap, page) => {
            var urls = [page.url].concat(page.oldUrls),
                search = page.search || this._getDefaultSearchParams();
            languages.forEach((lang) => {
                urls.forEach((url) => {
                    if (page[lang].published) {
                        this.logger.verbose(`page: ${hosts[lang] + url} ${search.changefreq} ${search.priority}`)
                        siteMap.push(_.extend({ loc: hosts[lang] + url }, search));
                    }
                });
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

        var hosts = this._getHosts(),
            languages = this.getBaseConfig().getLanguages(),
            siteMap = js2xml('urlset', { url: this._buildSiteMapModel(model, hosts, languages) });

        this.logger.debug('Save sitemap.xml file:');
        this.logger.debug(`==> to ${this._getSitemapXmlFilePath()}`);

        return new Promise((resolve, reject) => {
            fs.writeFile(this._getSitemapXmlFilePath(), siteMap, (error) => {
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

