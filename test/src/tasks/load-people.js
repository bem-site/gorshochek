var fs = require('fs'),
    mockFs = require('mock-fs'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    LoadPeople = require('../../../lib/tasks/load-people');

describe('LoadPeople', function () {
    before(function () {
        var configFile = fs.readFileSync('./test/stub/.builder/make.js', { encoding: 'utf-8' });
        mockFs({
            '.builder': {
                'make.js': configFile
            },
            cache: {},
            data: {}
        });
    });

    after(function () {
        mockFs.restore();
    });

    describe('invalid url', function () {
        var peopleUrl = 'https://raw.githubusercontent.com/bem/bem-method/bem-info-data/people/people1.json',
            task;

        before(function () {
            task = new LoadPeople(new Config(), { url: peopleUrl });
        });

        it('run', function (done) {
            var model = new Model();
            task.run(model).catch(function () {
                fs.existsSync('./cache/people.json').should.equal(false);
                done();
            });
        });
    });

    describe('success', function () {
        var peopleUrl = 'https://raw.githubusercontent.com/bem/bem-method/bem-info-data/people/people.json',
            task;

        before(function () {
            task = new LoadPeople(new Config(), { url: peopleUrl });
        });

        it('run', function (done) {
            var model = new Model();
            task.run(model).then(function () {
                fs.existsSync('./cache/people.json').should.equal(true);
                done();
            });
        });
    });
});
