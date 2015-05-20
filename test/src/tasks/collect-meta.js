var path = require('path'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    mockFs = require('mock-fs'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    AnalyzeModel = require('../../../lib/tasks/analyze-model'),
    CollectMeta = require('../../../lib/tasks/collect-meta');

describe('CollectMeta', function () {
    var languages, config, task;

    before(function () {
        languages = ['en', 'ru'];
        config = new Config('./test/stub/');
        task = new CollectMeta(config, {});

        mockFs({
            cache: {}
        });
    });

    after(function () {
        mockFs.restore();
    });

    describe('instance methods', function () {
        var model;

        before(function () {
            model = new Model();
            model.setPages([
                {
                    url: '/url1',
                    en: {
                        authors: ['author1', 'author2'],
                        translators: ['translator1'],
                        tags: ['tag1', 'tag2']
                    },
                    ru: {
                        authors: ['author1', 'author2'],
                        translators: [],
                        tags: ['tag1', 'tag2']
                    }
                },
                {
                    url: '/url2',
                    en: {
                        authors: ['author1', 'author3'],
                        translators: ['translator2'],
                        tags: ['tag3', 'tag4']
                    },
                    ru: {
                        authors: ['author1', 'author4'],
                        translators: [],
                        tags: ['tag1', 'tag3']
                    }
                }
            ]);
        });

        it('run', function (done) {
            return task.run(model)
                .then(function () {
                    var collected = fsExtra.readJSONSync('./cache/meta.json');
                    collected.authors.en.should.be.instanceOf(Array).and.have.length(3);
                    collected.authors.ru.should.be.instanceOf(Array).and.have.length(3);
                    collected.translators.ru.should.be.instanceOf(Array).and.have.length(0);
                    collected.translators.en.should.be.instanceOf(Array).and.have.length(2);
                    collected.tags.en.should.be.instanceOf(Array).and.have.length(4);
                    collected.tags.ru.should.be.instanceOf(Array).and.have.length(3);
                    done();
                });
        })
    });
});

