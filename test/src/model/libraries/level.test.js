var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Level = require('../../../../lib/model/libraries/level');

describe('level', function() {
    describe('constructor', function() {
        var level;

        it('should be successfully initialized', function() {
            level = new Level({ lib: 'bem-core', version: 'v2' }, 'desktop');
            level.should.be.instanceOf(Level);
        });

        it('should have valid version property after initialization', function() {
            level = new Level({ lib: 'bem-core', version: 'v2' }, 'desktop');
            should.deepEqual(level.version, { lib: 'bem-core', version: 'v2' });
        });

        it('should have valid level property after initialization', function() {
            level = new Level({ lib: 'bem-core', version: 'v2' }, 'desktop');
            level.level.should.equal('desktop');
        });

        it('should remove ".docs" suffix in level name after initialization', function() {
            level = new Level({ lib: 'bem-core', version: 'v2' }, 'desktop.docs');
            level.level.should.equal('desktop');
        });

        it('should remove ".sets" suffix in level name after initialization', function() {
            level = new Level({ lib: 'bem-core', version: 'v2' }, 'desktop.sets');
            level.level.should.equal('desktop');
        });
    });

    describe('instance methods', function() {
        describe('processData', function() {
            var basePath = path.join(process.cwd(), './build/cache'),
                level;

            beforeEach(function() {
                var version = { baseUrl: '/libraries', basePath: basePath,
                        lib: 'bem-core', version: 'v2', languages: ['en'] };

                level = new Level(version, 'desktop.docs');

                return level.processData({
                    name: 'desktop.blocks',
                    blocks: [
                        { name: 'button', data: { name: 'd-button' }, jsdoc: { name: 'js-button' } },
                        { name: 'input', data: { name: 'd-input' }, jsdoc: { name: 'js-input' } }
                    ]
                });
            });

            it('should have valid url', function() {
                level.getData()['url'].should.equal('/libraries/bem-core/v2/desktop');
            });

            it('should have valid aliases', function() {
                level.getData()['aliases'].should.be.instanceOf(Array).and.have.length(0);
            });

            it('should have valid view', function() {
                level.getData()['view'].should.equal('level');
            });

            it('should have valid lib', function() {
                level.getData()['lib'].should.equal('bem-core');
            });

            it('should have valid version', function() {
                level.getData()['version'].should.equal('v2');
            });

            it('should have valid level', function() {
                level.getData()['level'].should.equal('desktop');
            });

            it('should have valid title', function() {
                level.getData()['en']['title'].should.equal('desktop');
            });

            it('should have valid published', function() {
                level.getData()['en']['published'].should.equal(true);
            });

            it('should have valid updateDate', function() {
                level.getData()['en']['updateDate'].should.above(+(new Date()) - 100);
            });

            it('should have valid structure of level folder', function() {
                var blockDirs = fs.readdirSync(path.join(basePath, './bem-core/v2/desktop'));
                blockDirs.should.be.instanceOf(Array).and.have.length(2);
            });

            it('should return valid data array', function() {
                return level
                    .processData({
                        name: 'desktop.blocks',
                        blocks: [
                            { name: 'button', data: { name: 'd-button' }, jsdoc: { name: 'js-button' } },
                            { name: 'input', data: { name: 'd-input' }, jsdoc: { name: 'js-input' } }
                        ]
                    })
                    .then(function(data) {
                        data.should.be.instanceOf(Array).and.have.length(3);
                        should.deepEqual(data[0], level.getData());

                        data[1].block.should.equal('button');
                        data[2].block.should.equal('input');
                    });
            });

            afterEach(function() {
                fsExtra.removeSync(basePath);
            });
        });
    });
});
