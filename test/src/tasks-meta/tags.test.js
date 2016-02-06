var Q = require('q'),
    Model = require('../../../lib/model'),
    baseUtil = require('../../../lib/util'),
    generateTagPages = require('../../../index').tasks.meta.generateTagPages;

describe('tasks-meta/tags', function() {
    var sandbox = sinon.sandbox.create(),
        model = new Model();

    beforeEach(function() {
        sandbox.stub(baseUtil, 'writeFileToCache').returns(Q());
        model.setPages([
            {
                url: '/url1',
                title: 'some-title',
                tags: ['tag1']
            }
        ]);
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return function as result', function() {
        generateTagPages(model).should.be.instanceOf(Function);
    });

    it('should return promise with model instance', function() {
        return generateTagPages(model)().should.eventually.instanceOf(Model);
    });

    it('should extend model with generated pages', function() {
        return generateTagPages(model)().then(function() {
            model.getPages().should.have.length(3);
        });
    });

    it('it should properly work for model without tags', function() {
        model.setPages([
            {
                url: '/url1',
                title: 'some-title'
            }
        ]);
        return generateTagPages(model)().should.eventually.instanceOf(Model);
    });

    it('should generate page for existed tag', function() {
        return generateTagPages(model)().then(function(model) {
            model.getPages()[1].should.eql({
                url: '/tags/tag1',
                aliases: [],
                title: 'tag1',
                published: true,
                view: 'tag',
                contentFile: '/tags/tag1/index.json'
            });
        });
    });

    it('should save content of tag page into file', function() {
        return generateTagPages(model)().then(function() {
            baseUtil.writeFileToCache.should.be.calledTwice;
            baseUtil.writeFileToCache.firstCall.should.be.calledWith('/tags/tag1/index.json');
        });
    });

    it('should generate valid content file for tag page', function() {
        return generateTagPages(model)().then(function() {
            baseUtil.writeFileToCache.should.be.calledTwice;
            baseUtil.writeFileToCache.firstCall.should.be.calledWith('/tags/tag1/index.json',
                JSON.stringify([{
                    url: '/url1',
                    title: 'some-title',
                    tags: [
                        {
                            url: '/tags/tag1',
                            title: 'tag1'
                        }
                    ]
                }])
            );
        });
    });

    it('should generate base tags page', function() {
        return generateTagPages(model)().then(function(model) {
            model.getPages()[2].should.eql({
                url: '/tags',
                aliases: [],
                title: 'Tags',
                published: true,
                view: 'tag',
                contentFile: '/tags/index.json'
            });
        });
    });

    it('should generate base tags page with custom url received from task options', function() {
        return generateTagPages(model, {baseUrl: '/some-tag-url'})().then(function(model) {
            model.getPages()[2].should.eql({
                url: '/some-tag-url',
                aliases: [],
                title: 'Tags',
                published: true,
                view: 'tag',
                contentFile: '/some-tag-url/index.json'
            });
        });
    });

    it('should generate base tags page with custom title received from task options', function() {
        return generateTagPages(model, {baseTitle: 'Custom Title'})().then(function(model) {
            model.getPages()[2].should.eql({
                url: '/tags',
                aliases: [],
                title: 'Custom Title',
                published: true,
                view: 'tag',
                contentFile: '/tags/index.json'
            });
        });
    });

    it('should replace page tags with data for links creation', function() {
        return generateTagPages(model, {baseTitle: 'Custom Title'})().then(function(model) {
            model.getPages()[0].should.eql({
                url: '/url1',
                title: 'some-title',
                tags: [{title: 'tag1', url: '/tags/tag1'}]
            });
        });
    });

    it('should save content of base tags page into file', function() {
        return generateTagPages(model)().then(function() {
            baseUtil.writeFileToCache.should.be.calledTwice;
            baseUtil.writeFileToCache.secondCall.should.be.calledWith('/tags/index.json');
        });
    });

    it('should generate valid content file for base tags page', function() {
        return generateTagPages(model)().then(function() {
            baseUtil.writeFileToCache.should.be.calledTwice;
            baseUtil.writeFileToCache.secondCall.should.be.calledWith('/tags/index.json',
                JSON.stringify([{
                    url: '/url1',
                    title: 'some-title',
                    tags: [
                        {
                            url: '/tags/tag1',
                            title: 'tag1'
                        }
                    ]
                }])
            );
        });
    });
});
