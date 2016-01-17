import Q from 'q';

/**
 * Creates map url -> lang -> title
 * @param {Array} pages - array of model pages
 * @returns {Object}
 * @protected
 */
export function createPageTitlesMap(pages) {
    return pages.reduce((pagesMap, page) => {
        pagesMap.set(page.url, page.title);
        return pagesMap;
    }, new Map());
}

/**
 * Retrieves array with url of given page and all parent urls
 * @param {Object} page - page model object
 * @returns {Array<String>}
 * @protected
 */
export function getParentUrls(page) {
    const DELIMETER = '/';
    const chunks = page.url.split(DELIMETER);
    const result = [DELIMETER];

    for(let i = 1; i < chunks.length; i++) {
        let url = '';
        for(let j = 0; j <= i; j++) {
            chunks[j].length && (url += (DELIMETER + chunks[j]));
        }
        url.length && result.push(url);
    }
    return result;
}

export function getExecFunction(model, pageProcessingFunction) {
    return function() {
        model.getPages().forEach(pageProcessingFunction.bind(null, createPageTitlesMap(model.getPages())));
        return Q(model);
    };
}
