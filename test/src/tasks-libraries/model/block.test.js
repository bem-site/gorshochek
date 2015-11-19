var Q = require('q'),
    Block = require('../../../../lib/tasks-libraries/model/block');

describe('Block', function() {
    var sandbox = sinon.sandbox.create(),
        block;

    beforeEach(function() {
        block = new Block({level: 'desktop'}, 'button');
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should have valid level property after initialization', function() {
        block.level.should.eql({level: 'desktop'});
    });

    it('should have valid block property after initialization', function() {
        block.block.should.be.equal('button');
    });

    it('should return valid block documentation', function() {
        block._rectifyBlockDocumentation({}, 'en').should.be.eql({});
    });

    it('should set block documentation to null if it is missed', function() {
        should.not.exist(block._rectifyBlockDocumentation(undefined, 'en'));
    });

    it('should return valid block jsdoc', function() {
        block._rectifyBlockJSDocumentation({}, 'en').should.be.eql({});
    });

    it('should set block jsdoc to null if it is missed', function() {
        should.not.exist(block._rectifyBlockJSDocumentation(undefined, 'en'));
    });

    describe('processData', function() {
        var level = {
            version: {
                baseUrl: '/libraries',
                basePath: '/some-path',
                lib: 'some-lib',
                version: 'v1',
                languages: ['en']
            },
            level: 'desktop'
        };

        beforeEach(function() {
            block = new Block(level, 'button');
            sandbox.stub(block, 'saveFile').returns(Q());
        });

        it('should set valid block url', function() {
            return block.processData({}).then(function() {
                block.getData().url.should.be.equal('/libraries/some-lib/v1/desktop/button');
            });
        });

        it('should have valid url aliases', function() {
            return block.processData({}).then(function() {
                block.getData().aliases.should.be.instanceOf(Array).and.be.empty;
            });
        });

        it('should have valid value for "view" field', function() {
            return block.processData({}).then(function() {
                block.getData().view.should.be.equal('block');
            });
        });

        it('should have valid value for "lib" field', function() {
            return block.processData({}).then(function() {
                block.getData().lib.should.be.equal('some-lib');
            });
        });

        it('should have valid value for "version" field', function() {
            return block.processData({}).then(function() {
                block.getData().version.should.be.equal('v1');
            });
        });

        it('should have valid value for "level" field', function() {
            return block.processData({}).then(function() {
                block.getData().level.should.be.equal('desktop');
            });
        });

        it('should have valid value for "block" field', function() {
            return block.processData({}).then(function() {
                block.getData().block.should.be.equal('button');
            });
        });

        it('should have valid value for "title" field', function() {
            return block.processData({}).then(function() {
                block.getData().en.title.should.be.equal('button');
            });
        });

        it('should have valid value for "published" field', function() {
            return block.processData({}).then(function() {
                block.getData().en.published.should.be.true;
            });
        });

        it('should have valid value for "updateDate" field', function() {
            return block.processData({}).then(function() {
                block.getData().en.updateDate.should.above(+(new Date()) - 100);
            });
        });

        it('should save source file content to valid path', function() {
            return block.processData({}).then(function() {
                var expectedPath = '/some-path/some-lib/v1/desktop/button/en.json';
                block.saveFile.should.be.calledWith(expectedPath, {data: null, jsdoc: null}, true);
            });
        });

        it('should set valid value for "contentFile" field after saving source content', function() {
            return block.processData({}).then(function() {
                block.getData().contentFile
                    .should.be.equal('/libraries/some-lib/v1/desktop/button/en.json');
            });
        });
    });
});
