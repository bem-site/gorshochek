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

## Пример использования

//TODO написать документацию

## Описание задач

### [core.mergeModels](./src/tasks-core/merge-model)

1. Считывает новую модель по пути указанному в опции `modelPath`. 
2. Сравнивает ее со старой моделью, загруженной из кэша. 
3. Находит и сохраняет отличия между старой и новой моделью данных в модель изменений.
4. Произвоит слияние (merge) моделей.
5. Сохраняет новую модель в кэш и заменяет файл старой модели.

Параметры: 

* {String} modelPath - путь к модели данных. Обязательный параметр.

Зависимости: нет.

### [core.normalizeModel](./src/tasks-core/normalize-model)

Проверяет модель на корректность. По возможности вносит исправления и выставляет дефолтные значения
для отсутствующих или некорректных полей.
 
Пример вызова: 
```
var gulp = require('gulp');
var gorshochek = require('gorshochek');
var model = gorshochek.createModel();

gulp.task('normalize-model', gorshochek.tasks.core.normalizeModel(model));
``` 

Параметры: отсутствуют.

Зависимости: требует выполнения задачи [`core.mergeModels`](core.mergeModels)

### [core.saveModel](./src/tasks-core/save-model)

Сохраняет модель на файловую систему (по умолчанию в `{CACHE_FOLDER}/data.json`).

Пример вызова: 
```
var gulp = require('gulp');
var gorshochek = require('gorshochek');
var model = gorshochek.createModel();

gulp.task('save-model', gorshochek.tasks.core.saveModel(model, options));
``` 

Параметры: 

* {String} dataPath - директория для сохранения файла модели. Необязательный параметр.

Зависимости: нет

### [core.rsync](./src/tasks-core/rsync)

Выполняет синхронизацию файлов между директорией кэша и целевой директорией для собранных данных.

Пример вызова: 
```
var gulp = require('gulp');
var gorshochek = require('gorshochek');
var model = gorshochek.createModel();

gulp.task('rsync', gorshochek.tasks.core.rsync(model, {
    src: './.builder/cache',
    dest: './data',
    options: '-rd --delete --delete-excluded --force',
    exclude: ['*.md', '*.meta.json']
}));
``` 

Параметры: 

* {String} src - исходная директория для синхронизации. По умолчанию это директория в которой хранится 
кэш сборки. Необязательный параметр.
* {String} dest -  целевая директория для синхронизации. По умолчанию `./data`. Необязательный параметр.
* {String} options - Дополнительные опции для синхронизации. Необязательный параметр. 
По умолчанию синхронизация выполняется с такими предустановленными опциями: 
`-rd --delete --delete-excluded --force`. 
* {String[]} exclude - Массив с масками для файлов которые должны быть исключены из процесса копирования. 
Необязательный параметр.

Зависимости: нет

### [docs.loadFromGithub](./src/tasks-docs/load-from-github)

Загружает контент для страниц с помощью Github API. Выполняется для тех страниц модели у которых поле
`sourceUrl` указывает на файл расположенный в каком-либо github-репозитории. Кроме того, данная задача 
включает в себя следующую дополнительную функциональность:

* Определение даты последнего коммита для загружаемого файла ресурса.
* Определение наличия раздела issues в репозитории.
* Определение ветки или тега с которого загружается ресурс. В случае, если ресурс загружается 
из тега, то вернется имя основной ветки ропозитория установленной по умолчанию.

Пример вызова: 
```
var gulp = require('gulp');
var gorshochek = require('gorshochek');
var model = gorshochek.createModel();

gulp.task('save-model', gorshochek.tasks.docs.loadFromGithub(model, {
    token: 'your github auth token',
    updateDate: true,
    hasIssues: true,
    branch: true
}));
``` 

Параметры: 

* {String} token - github токен. Без указания этого переметра количество возможных запросов к 
github будет ограничено 60-ю запросами в час.
* {Boolean} updateDate - загружать дату последнего коммита ресурса. Значение по умолчанию - `false`.
* {Boolean} hasIssues - определять наличие раздела `issues` репозитория ресурса. Значение по умолчанию - `false`.
* {Boolean} branch - определять ветку репозитория с которого был загружен ресурс. Значение по умолчанию - `false`.

Зависимости: требует выполнения задачи [`core.mergeModels`](core.mergeModels)

### [docs.loadFromFile](./src/tasks-docs/load-from-file)

### [docs.transformMdToHtml](./src/tasks-docs/transform-md-html)

### [page.createHeaderTitle](./src/tasks-page/header-title)

Генерирует поле `header.title` для каждой страницы в модели и записывает
в него title, предназначенный для вывода в тэге `<title>` заголовка страницы.

Пример вызова: 
```
var gulp = require('gulp');
var gorshochek = require('gorshochek');
var model = gorshochek.createModel();

gulp.task('header-title', gorshochek.tasks.page.createHeaderTitle(model, {
   delimiter: '/'
}));
```

Параметры: 

* {String} delimiter - разделитель частей из которых состоит header.title 

Зависимости: требует выполнения задачи [`core.mergeModels`](core.mergeModels)

Примечание: если сборка содержит задачи, которые динамически генерируют и добавляют в модель 
новые страницы, то данная задача должна запускаться после того как в модель будут добавлены 
все сгенерированные страницы.

### [page.createHeaderMeta](./src/tasks-page/header-meta)

Генерирует поле `header.meta` для каждой страницы в модели и записывает в него объект,
содержащий мета-информацию, предназначенную для шаблонизации в тегах `<meta>` заголовка страницы.

Пример вызова: 
```
var gulp = require('gulp');
var gorshochek = require('gorshochek');
var model = gorshochek.createModel();

gulp.task('header-meta', gorshochek.tasks.page.createHeaderMeta(model));
```

Зависимости: требует выполнения задачи [`core.mergeModels`](core.mergeModels)

Примечание: если сборка содержит задачи, которые динамически генерируют и добавляют в модель 
новые страницы, то данная задача должна запускаться после того как в модель будут добавлены 
все сгенерированные страницы.

### [page.createBreadcrumbs](./src/tasks-page/breadcrumbs)

Генерирует поле `breadcrumbs` для каждой страницы в модели и записывает в него массив
объектов содержащий поля `title` и `url` текущей и всех родительских страниц включая корневую страницы сайта.
Данный объект удобен для шаблонизации и последующего отображения "хлебных крошек" на сайте.

Пример вызова: 
```
var gulp = require('gulp');
var gorshochek = require('gorshochek');
var model = gorshochek.createModel();

gulp.task('breadcrumbs', gorshochek.tasks.page.createBreadcrumbs(model));
```

Зависимости: требует выполнения задачи [`core.mergeModels`](core.mergeModels)

Примечание: если сборка содержит задачи, которые динамически генерируют и добавляют в модель 
новые страницы, то данная задача должна запускаться после того как в модель будут добавлены 
все сгенерированные страницы.

### [page.createSearchMeta](./src/tasks-page/search-meta)

Добавляет некоторую мета-информацию для каждой страницы преднаначенную для работы поискового робота Яндекса.

### [override.overrideDocLinks](./src/tasks-core/override-docs)

### [sitemap.createSitemapXML](./src/sitemap/sitemap-xml)

## Создание собственной задачи сборки

Задача сборки представляет собой функцию высшего порядка, т.е. возвращающую другую анонимную функцию
без аргументов реализующую логику задачи.

Любая задача сборки, работающая с моделью должна принимать ее экземпляр в качестве первого аргумента.
Кроме того, задача может включать в себя дополнительные опции которые удобно передать в виде объекта вторым параметром.
Для организации задач в виде цепочки промисов возвращаемая анонимная функция должна сама возвращать промис объект.

Таким образом требования описанные выше позволяют записать код простейшей задачи которая
выводит в консоль параметр `name` переданный ей в качестве опции:

```
export default function(model, options = {}) {
    return function() {
        console.log('Hello ' + options.name);
        return Promise.resolve(model);
    }
}
```

## Тестирование

Запуск тестов с вычислением покрытия кода тестами с помощью инструмента [istanbul](https://www.npmjs.com/package/istanbul):
```
npm test
```

Проверка синтаксиса кода с помощью [eslint](http://eslint.org) и [jscs](https://www.npmjs.com/package/jscs)
```
npm run lint
```

Особая благодарность за помощь в разработке:

* Гриненко Владимир (http://github.com/tadatuta)
* Харисов Виталий (https://github.com/vithar)

Разработчик Кузнецов Андрей Серргеевич @tormozz48
Вопросы и предложения присылать по адресу: andrey.kuznetsov48@yandex.ru
