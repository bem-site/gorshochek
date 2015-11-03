var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Block = require('../../../../lib/model/libraries/block');

describe('block', function() {
    describe('constructor', function() {
        var block;

        beforeEach(function() {
            block = new Block({ level: 'desktop' }, 'button');
        });

        it('should be successfully initialized', function() {
            block.should.be.instanceOf(Block);
        });

        it('should have valid level property after initialization', function() {
            should.deepEqual(block.level, { level: 'desktop' });
        });

        it('should have valid block property after initialization', function() {
            block.block.should.equal('button');
        });
    });

    describe('instance methods', function() {
        describe('_rectifyBlockDocumentation', function() {
            var block;

            before(function() {
                block = new Block({ level: 'desktop' }, 'button');
            });

            it('should return valid block documentation', function() {
                should.deepEqual(block._rectifyBlockDocumentation({}, 'en'), {});
            });

            // TODO написать тесты для выпрямления данных документации блока здесь
        });

        describe('_rectifyBlockJSDocumentation', function() {
            var block;

            before(function() {
                block = new Block({ level: 'desktop' }, 'button');
            });

            it('should return valid block jsdoc', function() {
                should.deepEqual(block._rectifyBlockJSDocumentation({}, 'en'), {});
            });

            // TODO написать тесты для выпрямления данных jsdoc блока здесь
        });

        describe('_setSource', function() {
            var basePath = path.join(process.cwd(), './build/cache'),
                version,
                level,
                block;

            beforeEach(function() {
                version = { baseUrl: '/libraries', basePath: basePath, lib: 'bem-core',
                    version: 'v2', languages: ['en']
                };
                level = { version: version, level: 'desktop' };
                block = new Block(level, 'button');
            });

            it('should set source and create data file', function() {
                block._setSource({
                    data: { name: 'd-button' },
                    jsdoc: { name: 'js-button' }
                }).then(function() {
                    var p = path.join(basePath, './bem-core/v2/desktop/button/en.json');
                    fs.existsSync(p).should.equal(true);
                    should.deepEqual(fsExtra.readJSONSync(p), {
                        data: { name: 'd-button' },
                        jsdoc: { name: 'js-button' }
                    });
                });
            });

            it('should set source and set valid contentFile field value', function() {
                block._setSource({
                    data: { name: 'd-button' },
                    jsdoc: { name: 'js-button' }
                }).then(function() {
                    block.getData()['contentFile'].should
                        .equal('/libraries/bem-core/v2/desktop/button/en.json');
                });
            });

            it('should set source and create data files for block with missed docs', function() {
                block._setSource({
                    jsdoc: { name: 'js-button' }
                }).then(function() {
                    var p = path.join(basePath, './bem-core/v2/desktop/button/en.json');
                    fs.existsSync(p).should.equal(true);
                    should.deepEqual(fsExtra.readJSONSync(p), {
                        data: null,
                        jsdoc: { name: 'js-button' }
                    });
                });
            });

            it('should set source and create data files for block with missed jsdoc', function() {
                block._setSource({
                    data: { name: 'd-button' }
                }).then(function() {
                    var p = path.join(basePath, './bem-core/v2/desktop/button/en.json');
                    fs.existsSync(p).should.equal(true);
                    should.deepEqual(fsExtra.readJSONSync(p), {
                        data: { name: 'd-button' },
                        jsdoc: null
                    });
                });
            });

            afterEach(function() {
                fsExtra.removeSync(basePath);
            });
        });

        describe('processData', function() {
            var basePath = path.join(process.cwd(), './build/cache'),
                block

            beforeEach(function() {
                var version = { baseUrl: '/libraries', basePath: basePath,
                        lib: 'bem-core', version: 'v2', languages: ['en'] },
                    level = { version: version,  level: 'desktop' };

                block = new Block(level, 'button');

                return block.processData({
                    data: { name: 'd-button' },
                    jsdoc: { name: 'js-button' }
                });
            });

            it('should have valid url', function() {
                block.getData()['url'].should.equal('/libraries/bem-core/v2/desktop/button');
            });

            it('should have valid aliases', function() {
                block.getData()['aliases'].should.be.instanceOf(Array).and.have.length(0);
            });

            it('should have valid view', function() {
                block.getData()['view'].should.equal('block');
            });

            it('should have valid lib', function() {
                block.getData()['lib'].should.equal('bem-core');
            });

            it('should have valid version', function() {
                block.getData()['version'].should.equal('v2');
            });

            it('should have valid level', function() {
                block.getData()['level'].should.equal('desktop');
            });

            it('should have valid block', function() {
                block.getData()['block'].should.equal('button');
            });

            it('should have valid title', function() {
                block.getData()['en']['title'].should.equal('button');
            });

            it('should have valid published', function() {
                block.getData()['en']['published'].should.equal(true);
            });

            it('should have valid updateDate', function() {
                block.getData()['en']['updateDate'].should.above(+(new Date()) - 100);
            });

            afterEach(function() {
                fsExtra.removeSync(basePath);
            });
        });
    });
});
