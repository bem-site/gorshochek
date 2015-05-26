var path = require('path'),
    _ = require('lodash'),
    vow = require('vow'),
    mdToHtml = require('bem-md-renderer');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'transform markdown to html'
};

export default class DocsMdToHtml extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    /**
     * Returns true if page[language] exists and have contentFile
     * pointed to *.md file. Otherwise returns false
     * @param {Object} page - page object
     * @param {String} language version
     * @returns {Boolean}
     * @private
     */
    _hasMdFile(page, language) {
        var contentFile;

        // проверяем существование языковой версии страницы
        if (!page[language]) {
            return false;
        }

        // проверяем поле contentFile. Оно должно существовать и значением
        // этого поля должен быть относительный путь оканчивающийся на .md
        contentFile = page[language].contentFile
        return contentFile && contentFile.match(/\.md$/);
    }

    /**
     * Returns pages with anyone language version satisfy _hasMdFile function criteria
     * @param {Array} pages - model pages
     * @param {Array} languages - configured languages array
     * @returns {Array} filtered array of pages
     * @private
     */
    _getPagesWithMdFiles(pages, languages) {
        // здесь происходит поиск страниц в модели у которых
        // хотя бы одна из языковых версий удовлетворяет критерию из функции _hasMdFile
        return pages.filter(page => {
            return languages.some(lang => {
                return this._hasMdFile(page, lang);
            });
        });
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
        })
    }

    /**
     * Transform md content of page source file into html syntax
     * @param {Object} page - page object
     * @param {Array} languages - configured languages array
     * @returns {Promise}
     * @private
     */
    _transformDoc(page, languages) {
        return vow.allResolved(languages.map((language) => {
            var hasMdFile = this._hasMdFile(page, language),
                mdFilePath,
                mdFileDirectory,
                htmlFilePath;

            // Проверяем на наличие правильного поля contentFile
            // это сделано потому, что предварительный фильтр мог сработать
            // для страниц у которых только часть из языковых версий удовлетворяла критерию
            if (!hasMdFile) {
                return vow.resolve(page);
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
        }));
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        // обрабатываем страницы порциями по 20 штук (для предотвращения open files limit exceed)
        // для каждой порции создаем выполнение задач обработки для каждой из отобранных по условию страниц
        var PORTION_SIZE = 20,
            languages = this.getBaseConfig().getLanguages(),
            pagesWithMarkdownFiles = this._getPagesWithMdFiles(model.getPages(), languages),
            portions = _.chunk(pagesWithMarkdownFiles, PORTION_SIZE),
            transformDocs = portions.reduce((prev, portion, index) => {
                prev = prev.then(() => {
                    this.logger.debug('Transform portion of pages in range %s - %s',
                        index * PORTION_SIZE, (index + 1) * PORTION_SIZE);
                    return vow.allResolved(portion.map((page) => {
                        return this._transformDoc(page, languages);
                    }));
                });
                return prev;
            }, vow.resolve());

        return transformDocs.then(() => {
            return Promise.resolve(model);
        });
    }
}

