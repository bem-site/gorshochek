import Q from 'q';

/**
 * Creates map url -> lang -> title
 * @param {Array} pages - array of model pages
 * @returns {Object}
 * @protected
 */
export function createPageTitlesMap(pages) {
    return pages.reduce((pagesMap, page) => {
        pagesMap[page.url] = page.title;
        return pagesMap;
    }, {});
}

/**
 * Retrieves array with url of given page and all parent urls
 * @param {Object} page - page model object
 * @returns {Array<String>}
 * @protected
 */
export function getParentUrls(page) {
    const chunks = page.url.split('/');
    // TODO: не хардкодить /, брать из модели
    const result = ['/'];

    // TODO: избавиться от вложенного цикла за счет chunks.splice().join('/')
    for(let i = 1, url = ''; i < chunks.length; i++) {
        for(let j = 0; j <= i; j++) {
            chunks[j] && (url += ('/' + chunks[j]));
        }
        result.push(url);
    }
    return result;
}

export function getExecFunction(model, pageProcessingFunction) {
    return function() {
        model.getPages().forEach(pageProcessingFunction.bind(null, createPageTitlesMap(model.getPages())));
        return Q(model);
    };
}
