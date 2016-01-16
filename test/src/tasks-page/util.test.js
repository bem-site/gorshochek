var Model = require('../../../lib/model'),
    util = require('../../../lib/tasks-page/util');

describe('tasks-page/util', function() {
    var sandbox = sinon.sandbox.create();

    afterEach(function() {
        sandbox.restore();
    });

    describe('getParentUrls', function() {
        it('should get parent urls for index page', function() {
            util.getParentUrls({url: '/'}).should.eql(['/']);
        });

        it('should get parent urls for first level pages', function() {
            util.getParentUrls({url: '/url1'}).should.eql(['/', '/url1']);
        });

        it('should get parent urls for second level', function() {
            util.getParentUrls({url: '/url1/url2'}).should.eql(['/', '/url1', '/url1/url2']);
        });

        it('should get parent urls for third level', function() {
            util.getParentUrls({url: '/url1/url2/url3'}).should.eql(['/', '/url1', '/url1/url2', '/url1/url2/url3']);
        });
    });

    describe('getPagesMap', function() {
        var pages = [
            {url: '/', title: '/title'},
            {url: '/url1', title: '/url1 title'}
        ];
        it('should build valid complex map of titles by urls and languages', function() {
            var pagesMap = util.createPageTitlesMap(pages);
            pagesMap.get('/').should.equal('/title');
            pagesMap.get('/url1').should.equal('/url1 title');
        });
    });

    describe('getExecFunction', function() {
        it('should return function', function() {
            util.getExecFunction().should.be.instanceOf(Function);
        });

        it('returned function should return promise with model instance', function() {
            return util.getExecFunction(new Model(), function() {})()
                .should.eventually.be.instanceOf(Model);
        });

        it('should call given pageProcessingFunction for each of model pages', function() {
            var spy = sandbox.spy();
            var model = new Model();
            model.setPages([
                {url: '/', title: '/title'},
                {url: '/url1', title: '/url1 title'}
            ]);
            
            return util.getExecFunction(model, spy)().then(function() {
                spy.should.be.calledTwice;
                spy.firstCall.should.be.calledWithMatch(sinon.match.any, {url: '/', title: '/title'});
                spy.secondCall.should.be.calledWithMatch(sinon.match.any, {url: '/url1', title: '/url1 title'});
            });
        });
    });
});

