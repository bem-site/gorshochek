var fs = require('fs'),
    path = require('path'),
    fsExtra = require('fs-extra'),
    Q = require('Q'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    DocsLoadFile = require('../../../lib/tasks-docs/load-from-file');

describe('DocsLoadFile', function() {
    var sandbox = sinon.sandbox.create(),
        config = new Config('debug'),
        task = new DocsLoadFile(config, {}),
        model;

    beforeEach(function() {
        sandbox.stub(fsExtra);
        sandbox.stub(task, 'readFileFromCache');
        sandbox.stub(task, 'writeFileToCache');
        model = new Model();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return valid task name', function() {
        DocsLoadFile.getName().should.equal('docs load from file');
    });

    describe('getCriteria', function() {
        it('should return false on missed language version of page', function() {
            var page = {url: '/url1'};
            task.getCriteria(page, 'en').should.equal(false);
        });

        it('should return false on missed contentFile field for lang version of page', function() {
            var page = {url: '/url1', en: {}};
            task.getCriteria(page, 'en').should.equal(false);
        });

        it('should return false if contentFile value does not match regular expression', function() {
            var page = {
                url: '/url1',
                en: {sourceUrl: 'http://github.com/foo/bar'}
            };
            task.getCriteria(page, 'en').should.equal(false);
        });

        describe('file path matches on task criteria', function() {
            it('should match on file path like a "/foo/bar.file"', function() {
                var page = {url: '/url', en: {sourceUrl: '/foo/bar.md'}};
                task.getCriteria(page, 'en').should.equal(true);
            });

            it('should match on file path like a "./foo/bar.md"', function() {
                var page = {url: '/url', en: {sourceUrl: './foo/bar.md'}};
                task.getCriteria(page, 'en').should.equal(true);
            });

            it('should match on file path like a "../foo/bar.md"', function() {
                var page = {url: '/url', en: {sourceUrl: '../foo/bar.md'}};
                task.getCriteria(page, 'en').should.equal(true);
            });

            it('should match on file path like a "../../foo/bar.md"', function() {
                var page = {url: '/url', en: {sourceUrl: '../../foo/bar.md'}};
                task.getCriteria(page, 'en').should.equal(true);
            });
        });
    });

    describe('processPage', function() {
        var languages = ['en'],
            page;

        beforeEach(function() {
            sandbox.stub(fs, 'readFile').yields(null, 'Hello World');
            task.readFileFromCache.returns(Q('Hello World'));
            task.writeFileToCache.returns(Q());
            page = {url: '/url', en: {sourceUrl: '../foo.file'}};
        });

        it('should not load mismatching source file for page language version', function() {
            page = {url: '/url1', en: {sourceFile: 'http://url'}};
            return task.processPage(model, page, languages).then(function() {
                fs.readFile.should.not.be.called;
                task.readFileFromCache.should.not.be.called;
            });
        });

        it('should read file from cache from given file path', function() {
            return task.processPage(model, page, languages).then(function() {
                task.readFileFromCache.should.be
                    .calledWithMatch(path.join(page.url, 'en.file'));
            });
        });

        it('should read file from local filesystem', function() {
            return task.processPage(model, page, languages).then(function() {
                fs.readFile.should.be.calledWithMatch('foo.file');
            });
        });

        it('should reject operation in case of missed local file', function() {
            fs.readFile.yields(new Error('ENOENT'));
            return task.processPage(model, page, languages).then(function() {
                task.writeFileToCache.should.not.be.called;
                should.not.exist(page.en.contentFile);
            });
        });

        it('should process file as new if it was not file in cache', function() {
            task.readFileFromCache.returns(Q.reject('Error'));
            return task.processPage(model, page, languages).then(function() {
                model.getChanges().pages.added.should.have.length(1);
            });
        });

        it('should process file as modified if it is not same as in cache', function() {
            task.readFileFromCache.returns(Q('Hello World old'));
            return task.processPage(model, page, languages).then(function() {
                model.getChanges().pages.modified.should.have.length(1);
            });
        });

        it('should not to do anything if file was not changed', function() {
            return task.processPage(model, page, languages).then(function() {
                var changes = model.getChanges().pages;
                changes.added.should.be.empty;
                changes.modified.should.be.empty;
            });
        });

        it('should set valid value of "contentFile" field', function() {
            return task.processPage(model, page, languages).then(function() {
                page.en.contentFile.should.equal('/url/en.file');
            });
        });

        it('should be resolved with page model instance', function() {
            task.processPage(model, page, languages).should.eventually.be.eql(page);
        });
    });
});
