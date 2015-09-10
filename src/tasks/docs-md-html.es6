import path from 'path';
import vow from 'vow';
import mdToHtml from 'bem-md-renderer';
import DocsBase from './docs-base';

export default class DocsMdToHtml extends DocsBase {

    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {string}
     */
    static getName() {
        return 'docs markdown to html';
    }

    /**
     * Returns number of page per portion for processing
     * @returns {number}
     */
    static getPortionSize() {
        return 20;
    }

    /**
     * Returns true if page[language] exists and have contentFile
     * pointed to *.md file. Otherwise returns false
     * @param {Object} page - page object
     * @param {String} language version
     * @returns {Boolean}
     * @private
     */
    getCriteria(page, language) {
        var contentFile;

        // проверяем существование языковой версии страницы
        if (!page[language]) {
            return false;
        }

        // проверяем поле contentFile. Оно должно существовать и значением
        // этого поля должен быть относительный путь оканчивающийся на .md
        contentFile = page[language].contentFile;
        return !!contentFile && !!contentFile.match(/\.md$/);
    }

    /**
     * Transforms markdown text into html syntax with help of marked library
     * wrapped into https://github.com/bem-site/bem-md-renderer npm package
     * @param {Object} page - page object
     * @param {String} language version
     * @param {String} md - text in markdown syntax
     * @returns {Promise}
     * @private
     */
    _mdToHtml(page, language, md) {
        // переводим содежимое *.md файла в html синтаксис с помощью bem-md-renderer
        return new Promise((resolve, reject) => {
            mdToHtml.render(md, (error, html) => {
                if (error) {
                    this.logger.error(
                        `Error occur while transform md -> html for page: ${page.url} and language ${language}`);
                    this.logger.error(error.message);
                    reject(error);
                }else {
                    resolve(html);
                }
            });
        });
    }

    /**
     * Transform md content of page source file into html syntax
     * @param {Model} model - data model
     * @param {Object} page - page object
     * @param {Array} languages - configured languages array
     * @returns {Promise}
     * @private
     */
    processPage(model, page, languages) {
        return vow.allResolved(languages.map((language) => {
            var hasMdFile = this.getCriteria(page, language),
                mdFilePath,
                mdFileDirectory,
                htmlFilePath;

            // Проверяем на наличие правильного поля contentFile
            // это сделано потому, что предварительный фильтр мог сработать
            // для страниц у которых только часть из языковых версий удовлетворяла критерию
            if (!hasMdFile) {
                return Promise.resolve(page);
            }

            this.logger.debug(`md -> html for language: => ${language} and page with url: => ${page.url}`);

            // допустим был файл /foo/bar/en.md
            // будет /foo/bar/en.html

            mdFilePath = page[language].contentFile;
            mdFileDirectory = path.dirname(mdFilePath);
            htmlFilePath = path.join(mdFileDirectory, language + '.html');

            // последовательно:
            // 1. считываем файл
            // 2. конвертируем его в html синтаксис
            // 3. сохраняем обратно под другим именем с учетом нового формата
            // 4. меняем соответствующее поле в модели страницы
            return this.readFileFromCache(mdFilePath)
                .then((md) => {
                    this.logger.verbose(`success read ${mdFilePath} from cache`);
                    return this._mdToHtml(page, language, md);
                })
                .then((html) => {
                    this.logger.verbose(`success transform content of ${mdFilePath} into html`);
                    return this.writeFileToCache(htmlFilePath, html);
                })
                .then(() => {
                    this.logger.verbose(`success write ${htmlFilePath} to cache`);
                    page[language].contentFile = htmlFilePath;
                    return page;
                });
        })).then(() => {
            return page;
        });
    }
}
