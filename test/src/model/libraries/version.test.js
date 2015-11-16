var _ = require('lodash'),
    Q = require('q'),
    Version = require('../../../../lib/model/libraries/version'),
    Document = require('../../../../lib/model/libraries/document'),
    Level = require('../../../../lib/model/libraries/level');

describe('Version', function() {
    var sandbox = sinon.sandbox.create(),
        version;

    beforeEach(function() {
        version = new Version('/libraries', '/base-path', 'some-lib', 'v1', ['en']);
        sandbox.stub(version, 'saveFile').returns(Q());
        sandbox.stub(Document.prototype, 'processData').returns(Q({name: 'readme'}));
        sandbox.stub(Level.prototype, 'processData').returns(Q({name: 'desktop'}));
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should set valid value for "baseUrl" property after initialization', function() {
        version.baseUrl.should.be.equal('/libraries');
    });

    it('should set valid value for "basePath" property after initialization', function() {
        version.basePath.should.be.equal('/base-path');
    });

    it('should set valid value for "languages" property after initialization', function() {
        version.languages.should.be.eql(['en']);
    });

    it('should set valid value for "lib" property after initialization', function() {
        version.lib.should.be.equal('some-lib');
    });

    it('should set valid value for "version" property after initialization', function() {
        version.version.should.be.equal('v1');
    });

    describe('processData', function() {
        var versionData = {
            ref: 'v1',
            url: '/base-library-url',
            deps: {},
            hasIssues: true
        };

        it('should set valid value for "url" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().url.should.be.equal('/libraries/some-lib/v1');
            });
        });

        it('should set valid value for "aliases" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().aliases.should.be.instanceof(Array).and.be.empty;
            });
        });

        it('should set valid value for "view" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().view.should.be.equal('post');
            });
        });

        it('should set valid value for "lib" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().lib.should.be.equal('some-lib');
            });
        });

        it('should set valid value for "version" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().version.should.be.equal('v1');
            });
        });

        it('should set valid value for "deps" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().deps.should.be.empty;
            });
        });

        it('should set valid value for "title" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().en.title.should.be.equal('v1');
            });
        });

        it('should set valid value for "published" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().en.published.should.be.true;
            });
        });

        it('should set valid value for "updateDate" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().en.updateDate.should.be.above(+(new Date()) - 100);
            });
        });

        it('should set valid value for "hasIssues" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().en.hasIssues.should.be.true;
            });
        });

        it('should set valid value for "sourceUrl" property', function() {
            return version.processData(versionData).then(function() {
                version.getData().en.sourceUrl.should.equal('/base-library-url/tree/v1');
            });
        });

        it('should set null value for "sourceUrl" property if version data has not "url" property', function() {
            return version.processData(_.omit(versionData, 'url')).then(function() {
                should.not.exist(version.getData().en.sourceUrl);
            });
        });

        it('should save file with content of library README documentation (old version data format)', function() {
            var data = _.extend({readme: {content: {en: 'Hello World'}}}, versionData);
            return version.processData(data).then(function() {
                version.saveFile.should.be.calledTwice;
                version.saveFile.firstCall.should.be.calledWith('/base-path/some-lib/v1/en.html')
            });
        });

        it('should save file with content of library README documentation (new version data format)', function() {
            var data = _.extend({docs: {readme: {content: {en: 'Hello World'}}}}, versionData);
            return version.processData(data).then(function() {
                version.saveFile.should.be.calledTwice;
                version.saveFile.firstCall.should.be.calledWith('/base-path/some-lib/v1/en.html')
            });
        });

        it('should set valid value for "contentFile" property after saving doc file', function() {
            var data = _.extend({docs: {readme: {content: {en: 'Hello World'}}}}, versionData);
            return version.processData(data).then(function() {
                version.getData().en.contentFile.should.be.equal('/libraries/some-lib/v1/en.html');
            });
        });

        it('should add nested document process data', function() {
            var data = _.extend({docs: {changelog: {content: {en: 'Hello World'}}}}, versionData);
            return version.processData(data).then(function() {
                var expectedPath = '/base-path/some-lib/v1/cache.json',
                    expectedContent = [version.getData(), {name: 'readme'}];
                version.saveFile.should.be.calledWith(expectedPath, expectedContent, true);
            });
        });

        it('should add nested level processed data', function() {
            var data = _.extend({levels: [{name: 'desktop'}]}, versionData);
            return version.processData(data).then(function() {
                var expectedPath = '/base-path/some-lib/v1/cache.json',
                    expectedContent = [version.getData(), {name: 'desktop'}];
                version.saveFile.should.be.calledWith(expectedPath, expectedContent, true);
            });
        });

        it('should add nested document and level processed data together', function() {
            var data = _.extend({
                docs: {changelog: {content: {en: 'Hello World'}}},
                levels: [{name: 'desktop'}]
            }, versionData);
            return version.processData(data).then(function() {
                var expectedPath = '/base-path/some-lib/v1/cache.json',
                    expectedContent = [version.getData(), {name: 'readme'}, {name: 'desktop'}];
                version.saveFile.should.be.calledWith(expectedPath, expectedContent, true);
            });
        });
    });
});
