export default class People {
    constructor(people) {
        this._people = people;
    }

    /**
     * Returns person data object by unique person id
     * @param {String} id - people id
     * @returns {Object}
     */
    getById(id) {
        return this._people[id];
    }

    /**
     * Returns localized person data object by unique person id and language
     * @param {String} id - people id
     * @param {String} lang - language version
     * @returns {String}
     */
    getByIdAndLang(id, lang) {
        return this.getById(id)[lang];
    }

    /**
     * Returns person full name string by unique person id and language
     * @param {String} id - people id
     * @param {String} lang - language version
     * @returns {String}
     */
    getFullNameByIdAndLang(id, lang) {
        var p = this.getByIdAndLang(id, lang);
        return `${p.firstName} ${p.lastName}`
    }
}
