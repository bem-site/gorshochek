import _ from 'lodash';
import Q from 'q';

export default function createHeaderMeta(model) {
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
    return function() {
        const getKeywords = p => {return p.tags ? p.tags.join(', ') : '';};
        model.getPages().forEach(page => {
            _.chain(page)
                .set('header.meta', _({})
                    .set('ogUrl', page.url)
                    .set('ogType', 'article')
                    .set('description', page.title)
                    .set('ogDescription', page.title)
                    .set('keywords', getKeywords(page))
                    .set('ogKeywords', getKeywords(page))
                    .value())
                .value();
        });
        return Q(model);
    };
}
