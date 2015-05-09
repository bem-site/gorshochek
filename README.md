# builder-core
Core data builder for bem-site

[![Coveralls branch](https://img.shields.io/coveralls/bem-site/builder-core/master.svg)](https://coveralls.io/r/bem-site/builder-core?branch=master)
[![Travis](https://img.shields.io/travis/bem-site/builder-core.svg)](https://travis-ci.org/bem-site/builder-core)
[![David](https://img.shields.io/david/bem-site/builder-core.svg)](https://david-dm.org/bem-site/builder-core)
[![David](https://img.shields.io/david/dev/bem-site/builder-core.svg)](https://david-dm.org/bem-site/builder-core#info=devDependencies)

Основной модуль сборки данных для bem сайтов.

## Установка

Пакет устанавливается как обычная npm зависимость
```
$ npm install --save bsb-core
```

## Конфигурация

Для работы сборщика в рабочей директории необходимо создать директорию `.builder`,
в которую следует поместить файл `make.js`. Данный файл будет содержать:

* Базовые настройки сборщика (общие для всех задач которые быдут выполнены в ходе сборки)
* Список задач сборки (как массив подключаемых модулей с собсвенными конфигурациями)

Пример такого файла можно увидеть ниже:

```
var peoplesUrl = 'https://raw.githubusercontent.com/bem/bem-method/bem-info-data/people/people.json';

module.exports = {
    languages: ['ru', 'en'],
    logger: {
        level: 'debug'
    },
    modelFilePath: './model/model.json',
    destDir: './data',
    tasks: [
        [require('../lib/tasks/make-cache-directory')],
        [require('../lib/tasks/make-data-directory')],
        [require('../lib/tasks/load-model-files')],
        [require('../lib/tasks/merge-models')],
        [require('../lib/tasks/save-model-file')],
        [require('../lib/tasks/analyze-model')],
        [require('../lib/tasks/collect-meta')],
        [require('../lib/tasks/load-people'), { url: peoplesUrl }],
        [require('../lib/tasks/create-person-pages'), { baseUrl: '/authors', type: 'authors' }],
        [require('../lib/tasks/create-person-pages'), { baseUrl: '/translators', type: 'translators' }],
        [require('../lib/tasks/create-tag-pages'), { baseUrl: '/tags'}]
    ]
};
```

Здесь:

* `languages` - массив языковых локалей, для которых будет выполняться сборка
* `logger` - настройки инструмента логгирования
* `modelFilePath` -  относительный путь к файлу модели
* `destDir` - целевая директория, в которую будут помещены собранные файлы
* `tasks` - массив задач, которые будут выполнены в ходе сборки в том же порядке в котором
они перечислены в конфигурационном файле.

##### Примечание #1

Каждая задача сама по себе является массивом, в котором нулевой элемент - подключаемый
модуль с кодом задачи сборки, а первый элемент - объект с настройками, специфичными для задачи.

##### Примечание #2

В процессе работы сборщика в рабочей директории создается директория `cache`.
Необходимо убедиться, что директория с таким именем не используются для других целей.

## Тестирование

Запуск тестов:
```
npm run mocha
```

Запуск тестов с вычислением покрытия кода тестами с помощью инструмента [istanbul](https://www.npmjs.com/package/istanbul):
```
npm test
```

Проверка синтаксиса кода с помощью [jshint](https://www.npmjs.com/package/jshint) и [jscs](https://www.npmjs.com/package/jscs)
```
npm run codestyle
```

Особая благодарность за помощь в разработке:

* Ильченко Николай (http://github.com/tavriaforever)
* Константинова Гела (http://github.com/gela-d)

Разработчик Кузнецов Андрей Серргеевич @tormozz48
Вопросы и предложения присылать по адресу: tormozz48@gmail.com
