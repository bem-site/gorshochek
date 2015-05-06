var path = require('path'),
    _ = require('lodash'),
    fsExtra = require('fs-extra'),
    model = fsExtra.readJSONSync(path.resolve(__dirname, './data.json'));

model = model
    .filter(function (item) {
        return item.url && _.isString(item.url);
    })
    .map(function (item) {
        var result = {
            url: item.url,
            oldUrls: [],
            view: item.view
        };

        ['en', 'ru'].forEach(function (lang) {
            result[lang] = {};
            if (!item.title) {
                item.title = { en: '', ru: ''};
            }
            result[lang].title = item.title[lang];
            result[lang].published = !item.hidden[lang];
            if (item.source) {
                if (item.source[lang]) {
                    result[lang].createDate = item.source[lang].createDate;
                    result[lang].authors = item.source[lang].authors;
                    result[lang].translators = item.source[lang].translators;
                    result[lang].tags = item.source[lang].tags;
                    result[lang].sourceUrl = item.source[lang].content;
                }
            }
        });

        return result;
    });

fsExtra.writeJSONSync(path.resolve(__dirname, './model.json'), model);

