var fsExtra = require('fs-extra'),
    People = require('../../../lib/model/people');

describe('People', function() {
    var sandbox = sinon.sandbox.create(),
        enPersonData = {firstName: 'John', lastName: 'Smith'},
        ruPersonData = {firstName: 'Джон', lastName: 'Смит'},
        people;

    beforeEach(function() {
        sandbox.stub(fsExtra, 'readJSONSync').returns({
            'smith-john': {en: enPersonData, ru: ruPersonData}
        });
        people = People.init('some.json');
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return valid name of file', function() {
        People.getFileName().should.equal('people.json');
    });

    it('should return person data by it unique id', function() {
        people.getById('smith-john').should.be.eql({en: enPersonData, ru: ruPersonData});
    });

    it('should return localized data by unique id and language', function() {
        people.getByIdAndLang('smith-john', 'en').should.be.eql(enPersonData);
    });

    it('should return valid full name of person by it unique id and language', function() {
        people.getFullNameByIdAndLang('smith-john', 'en').should.be.equal('John Smith');
    });
});
