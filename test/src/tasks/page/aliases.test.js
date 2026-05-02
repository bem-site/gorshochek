'use strict';

const Q = require('q');

const Model = require('../../../../src/model');
const baseUtil = require('../../../../src/util');
const createAliasPages = require('../../../../index').tasks.page.createAliasPages;

describe('tasks/page/aliases', () => {
    const sandbox = sinon.sandbox.create();
    const model = new Model();

    beforeEach(() => {
        sandbox.stub(baseUtil, 'writeFile').returns(Q());
        model.setPages([{
            url: '/url1/',
            title: 'Page title',
            aliases: ['/alias/', '/legacy/path/']
        }]);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return function as result', () => {
        createAliasPages(model).should.be.instanceOf(Function);
    });

    it('should return promise with model instance', () => {
        return createAliasPages(model)().should.eventually.be.instanceof(Model);
    });

    it('should create html redirect page for each alias', () => {
        const expectedHtml = [
            '<html>',
            '  <head>',
            '    <title>Page title</title>',
            '    <META http-equiv="refresh" content="0;URL=/url1/">',
            '  </head>',
            '  <body></body>',
            '</html>'
        ].join('\n');

        return createAliasPages(model)().then(() => {
            baseUtil.writeFile.should.be.calledWith('output/alias/index.html', expectedHtml);
            baseUtil.writeFile.should.be.calledWith('output/legacy/path/index.html', expectedHtml);
        });
    });

    it('should save alias pages into custom destination folder', () => {
        return createAliasPages(model, {destination: './public'})().then(() => {
            baseUtil.writeFile.should.be.calledWith('public/alias/index.html');
        });
    });

    it('should not create redirects for pages without aliases', () => {
        model.setPages([{url: '/url1/', title: 'Page title'}]);

        return createAliasPages(model)().then(() => {
            baseUtil.writeFile.should.not.be.called;
        });
    });

    it('should not create redirects for unpublished pages', () => {
        model.setPages([{
            url: '/url1/',
            title: 'Page title',
            aliases: ['/alias/'],
            published: false
        }]);

        return createAliasPages(model)().then(() => {
            baseUtil.writeFile.should.not.be.called;
        });
    });
});
