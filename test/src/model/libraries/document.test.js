var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Document = require('../../../../lib/model/libraries/document');

describe('document', function() {
    describe('constructor', function() {
        var document;

        it('should be successfully initialized', function() {
            document = new Document({ lib: 'bem-core', version: 'v2' }, 'changelog');
            document.should.be.instanceOf(Document);
        });

        it('should have valid version property after initialization', function() {
            document = new Document({ lib: 'bem-core', version: 'v2' }, 'changelog');
            should.deepEqual(document.version, { lib: 'bem-core', version: 'v2' });
        });

        it('should have valid document property after initialization', function() {
            document = new Document({ lib: 'bem-core', version: 'v2' }, 'changelog');
            document.document.should.equal('changelog');
        });
    });

    describe('_getTitle', function() {
        var document;

        it('should return valid changelog en title if data title was not set', function() {
            document = new Document({ lib: 'bem-core', version: 'v2' }, 'changelog');
            document._getTitle({}, 'en').should.equal('Changelog');
            document._getTitle({ title: {} }, 'en').should.equal('Changelog');
        });

        it('should return valid changelog ru title if data title was not set', function() {
            document = new Document({ lib: 'bem-core', version: 'v2' }, 'changelog');
            document._getTitle({}, 'ru').should.equal('История изменений');
            document._getTitle({ title: {} }, 'ru').should.equal('История изменений');
        });

        it('should return valid migration en title if data title was not set', function() {
            document = new Document({ lib: 'bem-core', version: 'v2' }, 'migration');
            document._getTitle({}, 'en').should.equal('Migration');
            document._getTitle({ title: {} }, 'en').should.equal('Migration');
        });

        it('should return valid migration ru title if data title was not set', function() {
            document = new Document({ lib: 'bem-core', version: 'v2' }, 'migration');
            document._getTitle({}, 'ru').should.equal('Миграция');
            document._getTitle({ title: {} }, 'ru').should.equal('Миграция');
        });

        it('should return valid notes en title if data title was not set', function() {
            document = new Document({ lib: 'bem-core', version: 'v2' }, 'notes');
            document._getTitle({}, 'en').should.equal('Release Notes');
            document._getTitle({ title: {} }, 'en').should.equal('Release Notes');
        });

        it('should return valid notes ru title if data title was not set', function() {
            document = new Document({ lib: 'bem-core', version: 'v2' }, 'notes');
            document._getTitle({}, 'ru').should.equal('Примечания к релизу');
            document._getTitle({ title: {} }, 'ru').should.equal('Примечания к релизу');
        });
    });

    describe('_getSourceUrl', function() {
        var document;

        beforeEach(function() {
            document = new Document({ lib: 'bem-core', version: 'v2' }, 'changelog');
        });

        it('should return null if url was not set', function() {
            should(document._getSourceUrl({}, 'en')).equal(null);
        });

        it('should return null if url for given lang was not set', function() {
            should(document._getSourceUrl({ url: {} }, 'en')).equal(null);
        });

        it('should return valid url value for given lang', function() {
            document._getSourceUrl({ url: { en: 'http://url1' } }, 'en').should.equal('http://url1');
        });
    });

    describe('_setSource', function() {
        var basePath = path.join(process.cwd(), './build/cache'),
            version,
            document;

        beforeEach(function() {
            version = { baseUrl: '/libraries', basePath: basePath, lib: 'bem-core', version: 'v2', languages: ['en'] };
            document = new Document(version, 'changelog');
        });

        it('should set source and create data file', function() {
            document._setSource({
                content: { en: 'Hello World' }
            }).then(function() {
                var p = path.join(basePath, './bem-core/v2/changelog/en.html');
                fs.existsSync(p).should.equal(true);
                should.deepEqual(fs.readFileSync(p, 'utf-8'), 'Hello World');
            });
        });

        it('should set source and set valid contentFile field value', function() {
            document._setSource({
                content: { en: 'Hello World' }
            }).then(function() {
                document.getData()['contentFile'].should
                    .equal('/libraries/bem-core/v2/changelog/en.html');
            });
        });

        afterEach(function() {
            fsExtra.removeSync(basePath);
        });
    });

    describe('processData', function() {
        var basePath = path.join(process.cwd(), './build/cache'),
            document;

        beforeEach(function() {
            var version = {
                baseUrl: '/libraries', basePath: basePath,
                lib: 'bem-core', version: 'v2', languages: ['en']
            };

            document = new Document(version, 'changelog');

            return document.processData({
                title: { en: 'Changelog'},
                content: { en: 'Hello World' },
                url: { en: 'http://url1' }
            });
        });

        it('should have valid url', function() {
            document.getData()['url'].should.equal('/libraries/bem-core/v2/changelog');
        });

        it('should have valid aliases', function() {
            document.getData()['aliases'].should.be.instanceOf(Array).and.have.length(0);
        });

        it('should have valid view', function() {
            document.getData()['view'].should.equal('post');
        });

        it('should have valid lib', function() {
            document.getData()['lib'].should.equal('bem-core');
        });

        it('should have valid version', function() {
            document.getData()['version'].should.equal('v2');
        });

        it('should have valid document', function() {
            document.getData()['document'].should.equal('changelog');
        });

        it('should have valid title', function() {
            document.getData()['en']['title'].should.equal('Changelog');
        });

        it('should have valid published', function() {
            document.getData()['en']['published'].should.equal(true);
        });

        it('should have valid updateDate', function() {
            document.getData()['en']['updateDate'].should.above(+(new Date()) - 100);
        });

        afterEach(function() {
            fsExtra.removeSync(basePath);
        });
    });
});
