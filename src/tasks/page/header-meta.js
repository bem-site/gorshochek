import Q from 'q';

/*
 Для каждой страницы создаем
 поле header.meta в котором находится структура содержащая мета-информацию для header страницы.
 - ogUrl
 - ogType
 - description
 - ogDescription
 - keywords
 - ogKeywords
 */

/**
 * Returns function for page header meta creation
 * @param {Model} model - application model instance
 * @returns {Function}
 */
export default function createHeaderMeta(model) {
    return function() {
        const getKeywords = p => {return p.tags ? p.tags.join(', ') : '';};
        model.getPages().forEach(page => {
            page.header || (page.header = {});
            page.header.meta = {
                ogUrl: page.url,
                ogType: 'article',
                description: page.title,
                ogDescription: page.title,
                keywords: getKeywords(page),
                ogKeywords: getKeywords(page)
            };
        });

        return Q(model);
    };
}
