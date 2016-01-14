import _ from 'lodash';
import * as util from 'util';

export default function createSearchMeta(model) {
    return util.getExecFunction(model, (map, page) => {
        const urlSet = util.getParentUrls(page);
        _.chain(page)
            .set('meta.breadcrumbs', urlSet.map(url => ({url, title: map.get(url)})))
            .set('meta.fields', {type: 'doc', keywords: page.tags || []})
            .value();
    });
}
