var path = require('path'),
    should = require('should'),
    Logger = require('bem-site-logger'),
    Base = require('../../../../lib/model/libraries/base');

describe('base', function() {
    describe('constructor', function() {
        it('should be initialized successfully', function() {
            (new Base()).should.be.instanceOf(Base);
        });

        it('should have logger', function() {
            var base = new Base();
            base.logger.should.be.instanceOf(Logger);
        });

        it('should have empty _data object', function() {
            var base = new Base();
            base._data.should.be.instanceOf(Object);
            Object.keys(base._data).should.have.length(0);
        });
    });

    describe('instance methods', function() {
        var base;

        beforeEach(function() {
            base = new Base();
        });

        describe('setValue', function() {
            it('should set value', function() {
                base.setValue('foo', 'bar');
                base._data.foo.should.equal('bar');
            });

            it('should set value with language option', function() {
                base.setValue('foo', 'bar', 'en');
                base._data['en'].foo.should.equal('bar');
            });
        });

        describe('getData', function() {
            it('should return _data', function() {
                base.getData().should.be.instanceOf(Object);
                should.deepEqual(base.getData(), base._data);
            });
        });
    });
});
