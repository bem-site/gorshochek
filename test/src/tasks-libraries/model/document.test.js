var _ = require('lodash'),
    Q = require('q'),
    Document = require('../../../../lib/tasks-libraries/model/document');

describe('Document', function() {
    var sandbox = sinon.sandbox.create(),
        versionData = {
            baseUrl: '/libraries',
            basePath: '/base-parh',
            lib: 'some-lib',
            version: 'v1',
            languages: ['en']
        },
        document;

    afterEach(function() {
        sandbox.restore();
    });

    it('should have valid version property after initialization', function() {
        document = new Document(versionData, 'changelog');
        document.version.should.eql(versionData);
    });

    it('should have valid document property after initialization', function() {
        document = new Document(versionData, 'changelog');
        document.document.should.be.equal('changelog');
    });

    it('should set valid changelog en title if data title was not set', function() {
        document = new Document(versionData, 'changelog');
        document.getTitle({}, 'en').should.be.equal('Changelog');
        document.getTitle({title: {}}, 'en').should.be.equal('Changelog');
    });

    it('should set valid changelog ru title if data title was not set', function() {
        document = new Document(versionData, 'changelog');
        document.getTitle({}, 'ru').should.be.equal('История изменений');
        document.getTitle({title: {}}, 'ru').should.be.equal('История изменений');
    });

    it('should set valid migration en title if data title was not set', function() {
        document = new Document(versionData, 'migration');
        document.getTitle({}, 'en').should.be.equal('Migration');
        document.getTitle({title: {}}, 'en').should.be.equal('Migration');
    });

    it('should set valid migration ru title if data title was not set', function() {
        document = new Document(versionData, 'migration');
        document.getTitle({}, 'ru').should.be.equal('Миграция');
        document.getTitle({title: {}}, 'ru').should.be.equal('Миграция');
    });

    it('should set valid notes en title if data title was not set', function() {
        document = new Document(versionData, 'notes');
        document.getTitle({}, 'en').should.be.equal('Release Notes');
        document.getTitle({title: {}}, 'en').should.be.equal('Release Notes');
    });

    it('should set valid notes ru title if data title was not set', function() {
        document = new Document(versionData, 'notes');
        document.getTitle({}, 'ru').should.be.equal('Примечания к релизу');
        document.getTitle({title: {}}, 'ru').should.be.equal('Примечания к релизу');
    });

    describe('processData', function() {
        var docData = {
            title: {en: 'Changelog'},
            content: {en: 'Hello World'},
            url: {en: 'http://url1'}
        };
        beforeEach(function() {
            document = new Document(versionData, 'changelog');
            sandbox.stub(document, 'saveFile').returns(Q());
        });

        it('should set valid value for "url" property', function() {
            return document.processData(docData).then(function() {
                document.getData().url.should.be.equal('/libraries/some-lib/v1/changelog');
            });
        });

        it('should set valid value for "aliases" property', function() {
            return document.processData(docData).then(function() {
                document.getData().aliases.should.be.instanceOf(Array).and.be.empty;
            });
        });

        it('should set valid value for "view" property', function() {
            return document.processData(docData).then(function() {
                document.getData().view.should.be.equal('post');
            });
        });

        it('should set valid value for "lib" property', function() {
            return document.processData(docData).then(function() {
                document.getData().lib.should.be.equal('some-lib');
            });
        });

        it('should set valid value for "version" property', function() {
            return document.processData(docData).then(function() {
                document.getData().version.should.be.equal('v1');
            });
        });

        it('should set valid value for "document" property', function() {
            return document.processData(docData).then(function() {
                document.getData().document.should.be.equal('changelog');
            });
        });

        it('should set valid value for "title" property', function() {
            return document.processData(docData).then(function() {
                document.getData().en.title.should.be.equal('Changelog');
            });
        });

        it('should set valid value for "published" property', function() {
            return document.processData(docData).then(function() {
                document.getData().en.published.should.be.true;
            });
        });

        it('should set valid value for "updateDate" property', function() {
            return document.processData(docData).then(function() {
                document.getData().en.updateDate.should.above(+(new Date()) - 100);
            });
        });

        it('should set null "sourceUrl" if it was not set', function() {
            return document.processData(_.merge({}, docData, {url: null})).then(function() {
                should.not.exist(document.getData().en.sourceUrl);
            });
        });

        it('should set null "sourceUrl" if it was not set for given language', function() {
            return document.processData(_.merge({}, docData, {url: {en: null}})).then(function() {
                should.not.exist(document.getData().en.sourceUrl);
            });
        });

        it('should return valid "sourceUrl" value for given lang', function() {
            return document.processData(_.merge({url: {en: 'http://url1'}}, docData)).then(function() {
                document.getData().en.sourceUrl.should.equal('http://url1');
            });
        });

        it('should save source file content to valid path', function() {
            return document.processData(docData).then(function() {
                var expectedPath = '/base-parh/some-lib/v1/changelog/en.html';
                document.saveFile.should.be.calledWith(expectedPath, 'Hello World', false);
            });
        });

        it('should set valid value for "contentFile" field after saving source content', function() {
            return document.processData(docData).then(function() {
                document.getData().en.contentFile
                    .should.equal('/libraries/some-lib/v1/changelog/en.html');
            });
        });

        it('should set value of "published" property to false if document content does not exist', function() {
            return document.processData(_.merge({}, docData, {content: null})).then(function() {
                document.getData().en.published.should.be.false;
            });
        });

        it('should set value of "published" property to false if document content does not exist for lang', function() {
            return document.processData(_.merge({}, docData, {content: {en: null}})).then(function() {
                document.getData().en.published.should.be.false;
            });
        });
    });
});
