var fs = require('fs'),
    path = require('path'),
    fsExtra = require('fs-extra'),
    Q = require('q'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    DocsLoadFile = require('../../../lib/tasks-docs/load-from-file');

describe('DocsLoadFile', function() {
    var sandbox = sinon.sandbox.create(),
        task = new DocsLoadFile(new Config('debug'), {}),
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
        it('should return false on missed sourceUrl field of page', function() {
            var page = {url: '/url1'};
            task.getCriteria(page).should.equal(false);
        });

        it('should return false if sourceUrl value does not match regular expression', function() {
            var page = {
                url: '/url1',
                sourceUrl: 'http://github.com/foo/bar'
            };
            task.getCriteria(page).should.equal(false);
        });

        describe('sourceUrl matches on task criteria', function() {
            it('should match on file path like a "/foo/bar.file"', function() {
                var page = {url: '/url', sourceUrl: '/foo/bar.md'};
                task.getCriteria(page).should.equal(true);
            });

            it('should match on file path like a "./foo/bar.md"', function() {
                var page = {url: '/url', sourceUrl: './foo/bar.md'};
                task.getCriteria(page).should.equal(true);
            });

            it('should match on file path like a "../foo/bar.md"', function() {
                var page = {url: '/url', sourceUrl: '../foo/bar.md'};
                task.getCriteria(page).should.equal(true);
            });

            it('should match on file path like a "../../foo/bar.md"', function() {
                var page = {url: '/url', sourceUrl: '../../foo/bar.md'};
                task.getCriteria(page).should.equal(true);
            });
        });
    });

    describe('processPage', function() {
        var page;

        beforeEach(function() {
            sandbox.stub(fs, 'readFile').yields(null, 'Hello World');
            task.readFileFromCache.returns(Q('Hello World'));
            task.writeFileToCache.returns(Q());
            page = {url: '/url', sourceUrl: '../foo.file'};
        });

        it('should read file from cache from given file path', function() {
            return task.processPage(model, page).then(function() {
                task.readFileFromCache.should.be
                    .calledWithMatch(path.join(page.url, 'index.file'));
            });
        });

        it('should read file from local filesystem', function() {
            return task.processPage(model, page).then(function() {
                fs.readFile.should.be.calledWithMatch('foo.file');
            });
        });

        it('should reject operation in case of missed local file', function() {
            fs.readFile.yields(new Error('ENOENT'));
            return task.processPage(model, page).catch(function() {
                task.writeFileToCache.should.not.be.called;
                should.not.exist(page.contentFile);
            });
        });

        it('should process file as new if it was not file in cache', function() {
            task.readFileFromCache.returns(Q.reject('Error'));
            return task.processPage(model, page).then(function() {
                model.getChanges().pages.added.should.have.length(1);
            });
        });

        it('should process file as modified if it is not same as in cache', function() {
            task.readFileFromCache.returns(Q('Hello World old'));
            return task.processPage(model, page).then(function() {
                model.getChanges().pages.modified.should.have.length(1);
            });
        });

        it('should not to do anything if file was not changed', function() {
            return task.processPage(model, page).then(function() {
                var changes = model.getChanges().pages;
                changes.added.should.be.empty;
                changes.modified.should.be.empty;
            });
        });

        it('should set valid value of "contentFile" field', function() {
            return task.processPage(model, page).then(function() {
                page.contentFile.should.equal('/url/index.file');
            });
        });

        it('should be resolved with page model instance', function() {
            task.processPage(model, page).should.eventually.be.eql(page);
        });
    });
});
