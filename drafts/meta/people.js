var fs = require('fs'),
    should = require('should'),
    mockFs = require('mock-fs'),
    People = require('../../../lib/model/people');

describe('People', function () {
    before(function () {
        var peopleData = fs.readFileSync('./test/stub/people.json', { encoding: 'utf-8' });
        mockFs({
            cache: {
                'people.json': peopleData
            },
            data: {}
        });
    });

    after(function () {
        mockFs.restore();
    });

    it('should return valid name of file', function () {
       People.getFileName().should.equal('people.json');
    });

    it('static initialization', function () {
        var people = People.init('./cache/people.json');
        people._people.should.be.instanceOf(Object);
        Object.keys(people._people).should.have.length(45);
    });

    describe('instance methods', function () {
        var people;

        before(function () {
            people = People.init('./cache/people.json');
        });

        it('getById', function () {
            var d = {
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
            };
            people.getById('alaev-vladimir').should.be.instanceOf(Object);
            should.deepEqual(people.getById('alaev-vladimir'), d);
        });

        it('getByIdAndLang', function () {
            var d = {
                firstName: 'Vladimir', lastName: 'Alaev',
                avatar: 'https://raw.github.com/bem/bem-method/bem-info-data/people/avatars/alaev-vladimir.png',
                github: 'scf2k', email: [], twitter: 'scf2k', skype: '', info: ''
            };
            people.getByIdAndLang('alaev-vladimir', 'en').should.be.instanceOf(Object);
            should.deepEqual(people.getByIdAndLang('alaev-vladimir', 'en'), d);
        });

        it('getFullNameByIdAndLang', function () {
            var d = {
                firstName: 'Vladimir', lastName: 'Alaev',
                avatar: 'https://raw.github.com/bem/bem-method/bem-info-data/people/avatars/alaev-vladimir.png',
                github: 'scf2k', email: [], twitter: 'scf2k', skype: '', info: ''
            };
            people.getFullNameByIdAndLang('alaev-vladimir', 'en').should.be.instanceOf(String);
            people.getFullNameByIdAndLang('alaev-vladimir', 'en').should.equal(d.firstName + ' ' + d.lastName);
        });
    });
})
