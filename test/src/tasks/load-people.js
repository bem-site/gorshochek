var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    LoadPeople = require('../../../lib/tasks/load-people');

describe('LoadPeople', function () {
    before(function () {
        process.chdir(path.resolve(__dirname, '../../stub'));
    });

    describe('invalid url', function () {
        var peopleUrl = 'https://raw.githubusercontent.com/bem/bem-method/bem-info-data/people/people1.json',
            task,
            config;

        before(function () {
            config = new Config();
            task = new LoadPeople(config, { url: peopleUrl });
            fsExtra.mkdirpSync(config.getCacheDirPath());
        });

        it('run', function (done) {
            var model = new Model();
            task.run(model).catch(function (error) {
                fs.existsSync('./cache/people.json').should.equal(false);
                done();
            });
        });
    });

    describe('success', function () {
        var peopleUrl = 'https://raw.githubusercontent.com/bem/bem-method/bem-info-data/people/people.json',
            task,
            config;

        before(function () {
            config = new Config();
            task = new LoadPeople(config, { url: peopleUrl });
            fsExtra.mkdirpSync(config.getCacheDirPath());
        });

        it('run', function (done) {
            var model = new Model();
            task.run(model).then(function () {
                fs.existsSync('./cache/people.json').should.equal(true);
                done();
            });
        });
    });

    after(function () {
        fsExtra.removeSync('./cache');
        process.chdir(path.resolve(__dirname, '../../../'));
    });
});
