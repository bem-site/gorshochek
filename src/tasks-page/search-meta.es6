import _ from 'lodash';
import Q from 'q';
import * as util from 'util';

export default function createSearchMeta(model) {

    function processFunc(map, page) {
        const urlSet = util.getParentUrls(page);
        _.chain(page)
            .set('meta.breadcrumbs', urlSet.map(url => ({url, title: map.get(url)})))
            .set('meta.fields', {type: 'doc', keywords: page.tags || []})
            .value();
    }

    return function() {
        model.getPages().forEach(processFunc.bind(null, util.createPageTitlesMap(model.getPages())));
        return Q(model);
    };
}
