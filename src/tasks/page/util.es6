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
    // TODO: не хардкодить /, брать из модели
    // TODO: избавиться от вложенного цикла за счет chunks.splice().join('/')
    const DELIMITER = '/';
    const chunks = page.url.split(DELIMITER);
    const result = [DELIMITER];

    for(let i = 1; i < chunks.length; i++) {
        let url = '';
        for(let j = 0; j <= i; j++) {
            chunks[j].length && (url += (DELIMITER + chunks[j]));
        }
        url.length && result.push(url);
    }
    return result;
}

/**
 * Returns execution function
 * @param {Model} model - application model instance
 * @param {Function} pageProcessingFunction - function which should be performed for each of model pages
 * @returns {Function}
 */
export function getExecFunction(model, pageProcessingFunction) {
    return function() {
        model.getPages().forEach(pageProcessingFunction.bind(null, createPageTitlesMap(model.getPages())));
        return Q(model);
    };
}
