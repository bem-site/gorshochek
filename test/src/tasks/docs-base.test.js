/*
var vow = require('vow'),
    should = require('should'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    DocsBase = require('../../../lib/tasks/docs-base');

describe('DocsBase', function() {
    it('should return valid task name', function() {
        DocsBase.getName().should.equal('docs base operations');
    });

    describe('instance methods', function() {
        var config,
            task;

        before(function() {
            config = new Config('debug');
            task = new DocsBase(config, {});
        });

        describe('getCriteria', function() {
            it('should return false', function() {
                task.getCriteria().should.equal(false);
            });
        });

        describe('getPagesByCriteria', function() {
            it('should return empty array with base criteria', function() {
                var pages = [
                    { url: '/url1' },
                    { url: '/url2' },
                    { url: '/url3' }
                ];
                task.getPagesByCriteria(pages, ['en', 'ru']).should.be.instanceOf(Array).and.have.length(0);
            });
        });

        describe('processPage', function() {
            it('should return resolved promise with page', function(done) {
                var model = new Model(),
                    page = { url: '/url1' };
                task.processPage(model, page, ['en', 'ru']).then(function(result) {
                    should.deepEqual(result, page);
                    done();
                });
            });
        });

        describe('processPages', function() {
            it('should successfully process pages by portions', function(done) {
                var model = new Model(),
                    pages = [];

                for (var i = 0; i < 100; i++) {
                    pages.push({
                        url: '/url' + i + '/url'  + (i * 10),
                        en: { field: i % 2 },
                        ru: { field: i % 2 }
                    });
                }

                model.setPages(pages);
                task.getCriteria = function(page, language) {
                    return page[language].field % 2 === 0;
                };

                task.processPage = function(model, page) {
                    page.processed = true;
                    return vow.resolve(page);
                };

                task.processPages(model).then(function() {
                    model.getPages()
                        .filter(function(page) { return page.processed; }).should.have.length(50);
                    done();
                });
            });
        });
    });
});
*/
