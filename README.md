# Gorshochek

Набор плагинов сборки данных для BEM сайтов.

[![NPM version](http://img.shields.io/npm/v/gorshochek.svg?style=flat)](http://www.npmjs.org/package/gorshochek)
[![GitHub version](https://badge.fury.io/gh/bem-site%2Fgorshochek.svg)](https://badge.fury.io/gh/bem-site%2Fgorshochek)
[![Coveralls branch](https://img.shields.io/coveralls/bem-site/gorshochek/master.svg)](https://coveralls.io/r/bem-site/gorshochek?branch=master)
[![Travis](https://img.shields.io/travis/bem-site/gorshochek.svg)](https://travis-ci.org/bem-site/gorshochek)
[![Code Climate](https://codeclimate.com/github/bem-site/gorshochek/badges/gpa.svg)](https://codeclimate.com/github/bem-site/gorshochek)
[![David](https://img.shields.io/david/bem-site/gorshochek.svg)](https://david-dm.org/bem-site/gorshochek)
![](https://reposs.herokuapp.com/?path=bem-site/gorshochek&style=flat)

Модуль сборки данных для bem сайтов.

![GitHub Logo](./.logo.jpg)

## Установка

Пакет устанавливается как обычная npm зависимость
```
$ npm install --save gorshochek
```

## Примеры использования

Простой запуск сборки путем последовательного выполнения всех необходимых задач:
```js
var Q = require('q'),
    gorshochek = require('gorshochek'),
    token = process.env.TOKEN;

var model = gorshochek.createModel(),
    tasks = gorshochek.tasks;

Q()
    .then(tasks.core.mergeModels(model, {modelPath: './examples/model.ru.json'}))
    .then(tasks.core.normalizeModel(model))
    .then(tasks.meta.generateTagPages(model))
    .then(tasks.docs.loadFromGithub(model, {token: token}))
    .then(tasks.docs.loadFromFile(model))
    .then(tasks.docs.transformMdToHtml(model))
    .then(tasks.page.createHeaderTitle(model))
    .then(tasks.page.createHeaderMeta(model))
    .then(tasks.page.createBreadcrumbs(model))
    .then(tasks.override.overrideDocLinks(model))
    .then(tasks.sitemap.createSitemapXML(model, {host: 'https://ru.bem.info'}))
    .then(tasks.core.saveModel(model))
    .then(tasks.core.rsync(model, {
        dest: './data',
        exclude: ['*.meta.json', 'model.json', '*.md']
    }));
```

Запуск с помощью [gulp](https://npmjs.org/package/gulp) можно посмотреть [здесь](./examples/gulp-full.js)

## Создание собственной задачи сборки

Задача сборки представляет собой функцию высшего порядка, т.е. возвращающую другую анонимную функцию
без аргументов реализующую логику задачи.

Любая задача сборки, работающая с моделью должна принимать ее экземпляр в качестве первого аргумента.
Кроме того, задача может включать в себя дополнительные опции которые удобно передать в виде объекта вторым параметром.
Для организации задач в виде цепочки промисов возвращаемая анонимная функция должна сама возвращать промис объект.

Таким образом требования описанные выше позволяют записать код простейшей задачи которая
выводит в консоль параметр `name` переданный ей в качестве опции:

```js
export default function(model, options = {}) {
    return function() {
        console.log('Hello ' + options.name);
        return Promise.resolve(model);
    }
}
```

## Тестирование

Запуск тестов с вычислением покрытия кода тестами с помощью инструмента [istanbul](https://www.npmjs.com/package/istanbul):
```bash
npm test
```

Проверка синтаксиса кода с помощью [eslint](http://eslint.org) и [jscs](https://www.npmjs.com/package/jscs)
```bash
npm run lint
```

Особая благодарность за помощь в разработке:

* Гриненко Владимир (http://github.com/tadatuta)
* Харисов Виталий (https://github.com/vithar)

Разработчик Кузнецов Андрей Серргеевич @tormozz48
Вопросы и предложения присылать по адресу: andrey.kuznetsov48@yandex.ru
