import * as util from './util';

export default function createSearchMeta(model) {
    return util.getExecFunction(model, (map, page) => {
        const urlSet = util.getParentUrls(page);
        page.meta = {
            breadcrumbs: urlSet.map(url => ({url, title: map.get(url)})),
            fields: {type: 'doc', keywords: page.tags || []}
        };
    });
}