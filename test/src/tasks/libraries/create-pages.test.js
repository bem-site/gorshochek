'use strict';

const path = require('path');
const fsExtra = require('fs-extra');
const Model = require('../../../../src/model');
const createLibraryPages = require('../../../../index').tasks.libraries.createLibraryPages;

describe('tasks/libraries/create-pages', () => {
    const libsPath = path.join(process.cwd(), '.builder/test-libs');
    const libPath = path.join(libsPath, 'bem-components-2.4.0');
    let model;

    function findPage(url) {
        return model.getPages().filter(page => page.url === url)[0];
    }

    beforeEach(() => {
        fsExtra.removeSync(libsPath);
        fsExtra.ensureDirSync(path.join(libPath, 'desktop.docs/button'));
        fsExtra.ensureDirSync(path.join(libPath, 'touch.docs/link'));
        fsExtra.writeFileSync(path.join(libPath, 'README.ru.md'), 'README RU');
        fsExtra.writeFileSync(path.join(libPath, 'CHANGELOG.md'), 'Changelog');
        fsExtra.writeFileSync(path.join(libPath, 'LICENSE'), 'License');

        model = new Model();
        model.setPages([{
            url: '/platform/libs/bem-components/',
            site: '/platform/libs/bem-components/',
            title: 'bem-components',
            versions: ['2.4.0'],
            type: 'lib',
            bundle: 'platform'
        }, {
            url: '/regular/',
            title: 'Regular page'
        }]);
    });

    afterEach(() => {
        fsExtra.removeSync(libsPath);
    });

    it('should return function as result', () => {
        createLibraryPages(model, {libsPath}).should.be.instanceOf(Function);
    });

    it('should append library version, document and block pages', () => {
        return createLibraryPages(model, {libsPath, language: 'ru'})().then(result => {
            result.should.equal(model);
            model.getPages().should.have.length(7);

            findPage('/platform/libs/bem-components/2.4.0/').should.eql({
                url: '/platform/libs/bem-components/2.4.0/',
                site: '/platform/libs/bem-components/2.4.0/',
                title: 'bem-components 2.4.0',
                content: 'README RU',
                type: 'lib',
                lib: 'bem-components',
                version: '2.4.0',
                bundle: 'platform',
                aliases: [],
                published: true
            });

            findPage('/platform/libs/bem-components/2.4.0/changelog/').should.include({
                site: '/platform/libs/bem-components/2.4.0/',
                title: 'Changelog',
                content: 'Changelog',
                document: 'changelog',
                bundle: 'platform'
            });

            findPage('/platform/libs/bem-components/2.4.0/license/').should.include({
                title: 'License',
                content: 'License',
                document: 'license'
            });

            findPage('/platform/libs/bem-components/2.4.0/desktop/button/').should.include({
                site: '/platform/libs/bem-components/2.4.0/',
                title: 'button',
                content: 'button',
                type: 'block',
                platform: 'desktop',
                bundle: 'platform'
            });

            findPage('/platform/libs/bem-components/2.4.0/touch/link/').should.include({
                title: 'link',
                platform: 'touch'
            });
        });
    });

    it('should skip unpublished library pages', () => {
        model.setPages([{
            url: '/platform/libs/bem-components/',
            title: 'bem-components',
            versions: ['2.4.0'],
            type: 'lib',
            published: false
        }]);

        return createLibraryPages(model, {libsPath})().then(() => {
            model.getPages().should.have.length(1);
        });
    });

    it('should call custom checkout hook before reading library data', () => {
        const checkoutLibrary = sinon.stub().returns(Promise.resolve());

        return createLibraryPages(model, {libsPath, checkoutLibrary})().then(() => {
            checkoutLibrary.should.be.calledOnce;
            checkoutLibrary.should.be.calledWithMatch(model.getPages()[0], '2.4.0', libPath);
        });
    });
});
