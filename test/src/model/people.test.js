var fsExtra = require('fs-extra'),
    should = require('should'),
    People = require('../../../lib/model/people');

describe('People', function () {
    beforeEach(function () {
        fsExtra.ensureDirSync('./data');
        fsExtra.ensureDirSync('./.build/cache');
        fsExtra.copySync('./test/stub/people.json', './.build/cache/people.json');
    });

    afterEach(function () {
        fsExtra.removeSync('./data');
        fsExtra.removeSync('./.build/cache');
    });

    it('should return valid name of file', function () {
       People.getFileName().should.equal('people.json');
    });

    it('static initialization', function () {
        var people = People.init('./cache/people.json');
        people._people.should.be.instanceOf(Object);
        Object.keys(people._people).should.have.length(2);
    });

    describe('instance methods', function () {
        var people;

        before(function () {
            people = People.init('./.build/cache/people.json');
        });

        it('getById should return valid result', function () {
            people.getById('alaev-vladimir').should.be.instanceOf(Object);
            should.deepEqual(people.getById('alaev-vladimir'), {
                en: {
                    firstName: 'Vladimir', lastName: 'Alaev',
                    avatar: 'https://raw.github.com/bem/bem-method/bem-info-data/people/avatars/alaev-vladimir.png',
                    github: 'scf2k', email: [], twitter: 'scf2k', skype: '', info: ''
                },
                ru: {
                    firstName: 'Владимир', lastName: 'Алаев',
                    avatar: 'https://raw.github.com/bem/bem-method/bem-info-data/people/avatars/alaev-vladimir.png',
                    github: 'scf2k', email: [], twitter: 'scf2k', skype: '', info: ''
                }
            });
        });

        it('getByIdAndLang should return valid result', function () {
            people.getByIdAndLang('alaev-vladimir', 'en').should.be.instanceOf(Object);
            should.deepEqual(people.getByIdAndLang('alaev-vladimir', 'en'), {
                firstName: 'Vladimir', lastName: 'Alaev',
                avatar: 'https://raw.github.com/bem/bem-method/bem-info-data/people/avatars/alaev-vladimir.png',
                github: 'scf2k', email: [], twitter: 'scf2k', skype: '', info: ''
            });
        });

        it('getFullNameByIdAndLang should return valid full name string', function () {
            var expected = {
                firstName: 'Vladimir', lastName: 'Alaev',
                avatar: 'https://raw.github.com/bem/bem-method/bem-info-data/people/avatars/alaev-vladimir.png',
                github: 'scf2k', email: [], twitter: 'scf2k', skype: '', info: ''
            };
            people.getFullNameByIdAndLang('alaev-vladimir', 'en').should.be.instanceOf(String);
            people.getFullNameByIdAndLang('alaev-vladimir', 'en')
                .should.equal(expected.firstName + ' ' + expected.lastName);
        });
    });
});
