var _ = require('lodash'),
    fsExtra = require('fs-extra');

export default class Meta {
    constructor(data) {
        this._authors = data.authors;
        this._translators = data.translators;
        this._tags = data.tags;
    }

    /**
     * Returns sets of authors grouped by languages
     * @returns {Object}
     */
    getAuthors() {
        return this._authors;
    }

    /**
     * Returns sets of translators grouped by languages
     * @returns {Object}
     */
    getTranslators() {
        return this._translators;
    }

    /**
     * Returns sets of tags grouped by languages
     * @returns {Object}
     */
    getTags() {
        return this._tags;
    }

    static init(file) {
        return new Meta(fsExtra.readJSONSync(file));
    }

    static save(file, authors, translators, tags) {
        var transform = (o) => {
            return _.mapValues(o, (item) => {
                return Array.from(item);
            });
        };

        return fsExtra.writeJSONSync(file, {
            authors: transform(authors),
            translators: transform(translators),
            tags: transform(tags)
        });
    }

    /**
     * Returns file name for saving meta data on local filesystem
     * @returns {String} - name of file
     */
    static getFileName() {
        return 'meta.json';
    }
}
