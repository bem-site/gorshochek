import * as util from './util';

/**
 * Creates advanced meta-information for search service
 * @param {Model} model - application model instance
 * @returns {Function}
 */
export default function createSearchMeta(model) {
    return util.getExecFunction(model, (map, page) => {
        const urlSet = util.getParentUrls(page);
        page.meta = {
            breadcrumbs: urlSet.map(url => ({url, title: map[url]})),
            fields: {type: 'doc', keywords: page.tags || []}
        };
    });
}
