import _ from 'lodash';
import debug from 'debug';
import js2xml from 'js2xmlparser';
import * as baseUtil from '../util';

debug = debug('sitemap-xml');

export default function createSitemapXML(model, options = {}) {
    if(!options.host) {
        throw new Error('Host parameter undefined. It is necessary for sitemap.xml creation');
    }

    const DEFAULT_SEARCH_PARAMS = {changefreq: 'weekly', priority: 0.5};

    function buildSiteMapModel() {
        return model.getPages().reduce((siteMap, page) => {
            const urls = [page.url].concat(page.aliases || []);
            const search = page.search || DEFAULT_SEARCH_PARAMS;

            if(page.published) {
                urls.forEach((url) => {
                    debug(`page: ${options.host + url} ${search.changefreq} ${search.priority}`);
                    siteMap.push(_.extend({loc: options.host + url}, search));
                });
            }
            return siteMap;
        }, []);
    }

    return function() {
        return _(buildSiteMapModel())
            .thru(value => ({url: value}))
            .thru(js2xml.bind(this, 'urlset'))
            .thru(baseUtil.writeFileToCache.bind(null, 'sitemap.xml'))
            .value()
            .thenResolve(model)
            .catch(error => {
                console.error('Error occur while saving sitemap.xml file');
                console.error(error.stack);
                throw error;
            });
    };
}
