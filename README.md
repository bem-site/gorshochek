# Gorshochek

Сборщик всякого разного для построения БЭМ сайта

[![NPM version](http://img.shields.io/npm/v/gorshochek.svg?style=flat)](http://www.npmjs.org/package/gorshochek)
[![Coveralls branch](https://img.shields.io/coveralls/bem-site/gorshochek/master.svg)](https://coveralls.io/r/bem-site/gorshochek?branch=master)
[![Travis](https://img.shields.io/travis/bem-site/gorshochek.svg)](https://travis-ci.org/bem-site/gorshochek)
[![David](https://img.shields.io/david/bem-site/gorshochek.svg)](https://david-dm.org/bem-site/gorshochek)

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

### mergeModels

1. Считывает новую модель по пути указанному в опции `modelPath`. 
2. Сравнивает ее со старой моделью, загруженной из кэша. 
3. Находит и сохраняет отличия между старой и новой моделью данных в модель изменений.
4. Произвоит слияние (merge) моделей.
5. Сохраняет новую модель в кэш и заменяет файл старой модели.

[Модуль](./src/tasks-core/merge-model)

Параметры: 

* {String} modelPath - путь к модели данных. Обязательный параметр.

Зависимости: нет.

### normalizeModel

Проверяет модель на корректность. По возможности вносит исправления и выставляет дефолтные значения
для отсутствующих или некорректных полей.

[Модуль](./src/tasks-core/normalize-model)
 
Пример вызова: 
```
var gulp = require('gulp');
var gorshochek = require('gorshochek');
var model = gorshochek.createModel();

gulp.task('normalize-model', gorshochek.tasks.core.normalizeModel(model));
``` 

Параметры: отсутствуют.

Зависимости: требует выполнения задачи `mergeModels`

### saveModel

### rsync

### loadFromGithub

### loadFromFile

### transformMdToHtml

### createHeaderTitle

### createHeaderMeta

### createBreadcrumbs

### createSearchMeta

### createSitemapXML

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

Проверка синтаксиса кода с помощью [jshint](https://www.npmjs.com/package/jshint) и [jscs](https://www.npmjs.com/package/jscs)
```
npm run codestyle
```

Особая благодарность за помощь в разработке:

* Гриненко Владимир (http://github.com/tadatuta)

Разработчик Кузнецов Андрей Серргеевич @tormozz48
Вопросы и предложения присылать по адресу: tormozz48@gmail.com
