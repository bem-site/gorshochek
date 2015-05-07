export default class Meta {
    constructor(authors, translators, tags) {
        this._authors = authors;
        this._translators = translators;
        this._tags = tags;
    }

    /**
     * Returns sets of authors grouped by languages
     * @returns {Object}
     */
    getAuthors() {
        return this._authors;
    }

    /**
     * Returns sets of trnslators grouped by languages
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
}
