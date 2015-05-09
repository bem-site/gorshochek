import Changes from './changes/index';
import People from './people';
import Meta from './meta';

export default class Model {

    constructor() {
        this._changes = new Changes();
        this._commonPages = [];
    }

    getChanges() {
        return this._changes;
    }

    getPages() {
        return this._commonPages;
    }

    setPages(pages) {
        this._commonPages = pages;
        return this;
    }

    initMeta(authors, translators, tags) {
        this._meta = new Meta(authors, translators, tags);
        return this;
    }

    getMeta() {
        return this._meta;
    }

    initPeople(people) {
        this._people = new People(people);
        return this;
    }

    getPeople() {
        return this._people;
    }
}
