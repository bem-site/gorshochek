const fsExtra = require('fs-extra');

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
        const p = this.getByIdAndLang(id, lang);
        return `${p.firstName} ${p.lastName}`;
    }

    /**
     * Returns file name for saving people data on local filesystem
     * @returns {String} - name of file
     */
    static getFileName() {
        return 'people.json';
    }

    /**
     * Initialize people model from json file
     * @param {String} file - name of file
     */
    static init(file) {
        return new People(fsExtra.readJSONSync(file));
    }
}
