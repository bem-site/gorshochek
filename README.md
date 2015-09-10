# builder-core
Core data builder for bem-site

[![NPM version](http://img.shields.io/npm/v/bs-builder-core.svg?style=flat)](http://www.npmjs.org/package/bs-builder-core)
[![Coveralls branch](https://img.shields.io/coveralls/bem-site/builder-core/master.svg)](https://coveralls.io/r/bem-site/builder-core?branch=master)
[![Travis](https://img.shields.io/travis/bem-site/builder-core.svg)](https://travis-ci.org/bem-site/builder-core)
[![David](https://img.shields.io/david/bem-site/builder-core.svg)](https://david-dm.org/bem-site/builder-core)
[![David](https://img.shields.io/david/dev/bem-site/builder-core.svg)](https://david-dm.org/bem-site/builder-core#info=devDependencies)

Основной модуль сборки данных для bem сайтов.

![GitHub Logo](./logo.jpg)

## Установка

Пакет устанавливается как обычная npm зависимость
```
$ npm install --save bs-builder-core
```

## API

При подключении данного модуля с помощью common modules становятся доступными 2 переменые:

* Builder - основной класс сборщика управляющий процессом сборки.
* tasks - объект, который позволяет легко подключать все задачи сборки пакета
избегая множественных вызовов `require`.

```
var bsBuilderCore = require('bs-builder-core');

var tasks = bsBuilderCore.tasks,
    Builder = bsBuilderCore.Builder;
```

### Builder

#### init

Статический метод для инициализации нового экземпляра класса `Builder`.

Аргументы:

* - {String} logLevel - уровень логгирования инструмента

Пример использования:

```
var bsBuilderCore = require('bs-builder-core');

var tasks = bsBuilderCore.tasks,
    Builder = bsBuilderCore.Builder;
    
var builder = Builder.init('debug');
```

Примечание: эквивалентен вызову `var builder = new Builder(logLevel)`;

#### getConfig

Возвращает экземпляр конфигурационного класса инструмента

Аргументы: - нет

#### getTasks

Возвращает массив задач для сборки которые будут выполнены в том же порядке в котором они перечислены в массиве.

Аргументы: - нет

#### setLanguages

Позволяет переопределять набор языков для которых будет произведена сборка.
По умолчанию набор языков состоит из одного элемента которым является английский.

Аргументы:

* - {Array} setLanguages - массив языковых локалей.

Пример использования:

```    
var builder = Builder
    .init('debug')
    .setLanguages(['en', 'ru']);
```

Примечание: Все методы экземпляра класса `Builder` кроме метода `run` и `get*` методов 
возвращают ссылку на экземпляр, что позволяет вызывать их по цепочке.

#### setCacheFolder

Позволяет переопределить путь для директории куда будут помещены временные файлы и папки,
создаваемые в результате сборки. Путь должен быть относительным по отношению к рабочей директории приложения. 
По умолчанию `./builder/cache`.

Аргументы:

* - {String} cacheFolder - относительный путь к директории для хранения временных файлов.

Пример использования:

```    
var builder = Builder
    .init('debug')
    .setCacheFolder('./my-cache-folder');
```

#### setDataFolder

Позволяет переопределить путь для директории куда будут помещены финальные результаты сборки. 
Путь должен быть относительным по отношению к рабочей директории приложения. 
По умолчанию `./data`.

Аргументы:

* - {String} dataFolder - относительный путь к директории для хранения файлов и папок результатов сборки.

Пример использования:

```    
var builder = Builder
    .init('debug')
    .setDataFolder('./my-data-folder');
```

#### setModelFilePath

Позволяет переопределить путь для json - файла исходной модели. 
Путь должен быть относительным по отношению к рабочей директории приложения. 
По умолчанию `./model/model.json`.

Аргументы:

* - {String} modelFilePath - относительный путь к файлу исходной модели.

Пример использования:

```    
var builder = Builder
    .init('debug')
    .setModelFilePath('./foo/bar/my-custom-model.json');
```

#### addTask

Добавляет задачу в очередь сборки.

Аргументы:

* - {Base} Task - классы задач сборки отнаследованные от базовой задачи.
* - {Object} taskConfig - конфигурационный объект в котором хрантся настройки и параметры 
специфичные для данной задачи сборки.

Пример использования:

```
var tasks = require('bs-builder-core').tasks,
    Builder = require('bs-builder-core').Builder,

    builder;

builder = Builder.init('debug')
    .addTask(tasks.LoadModelFiles)
    .addTask(tasks.MergeModels);

```

#### run

Запускает сборку всех сконфигураированных задач последовательно.
Возвращает Promise - объект. 

В случае успешной сборки возвращаемый promise содержит модель изменений 
данных относительно предыдущего запуска.

В случае ошибки возвращает promise с объектом ошибки вызвавшим завершение сборки.

```
var tasks = require('bs-builder-core').tasks,
    Builder = require('bs-builder-core').Builder,

    builder;

builder = Builder.init('debug')
    .addTask(tasks.LoadModelFiles)
    .run();
```

## Набор готовых задач сборки в пакете

Данный пакет содержит набор готовых задач сборки, выполнение части которых является обязательным.

### - [DocsLoadGithub](./src/tasks/docs-gh-load.es6)

Описание: Позволяет загружать произвольные файлы с гитхаба с использованием github API.
Для предотвращения превышения лимита запросов используется кеширование.

##### Опции задачи:
* {String} token - уникальный github токен для предназначенный для авторизации модуля, который 
работает с github API. Если данный параметр не будет указан, то число возможных запросов 
будет ограничено 60-ю запросами в час.

* {Boolean} updateDate - Опция, при включении которой, в модель будет дополнительно сохраняться 
информация о дате последнего изменения файла. (по умолчанию false)

* {Boolean} hasIssues - Опция, при включении которой, в модель будет дополнительно сохраняться
информация о наличии или отсутствии раздела issues в репозитории откуда был загружен файл. (по умолчанию false)

* {Boolean} getBranch - Опция, при включении которой, в модель будет дополнительно сохраняться
название ветки репозитория откуда был загружен файл. Если же файл был загружен с тега, то будет
сохранено имя основной ветки репозитория.

### - [DocsFileLoad](./src/tasks/docs-file-load.es6)

Описание: Позволяет загружать произвольные файлы с локальной файловой системы.

### - [DocsMdHtml](./src/tasks/docs-md-html.es6)

Описание: Позволяет преобразовывать загруженные `*.md` (markdown) файлы в html формат с помощью
модуля [bem-md-renderer](https://www.npmjs.com/package/bem-md-renderer).

### - [PageHeaderTitle](./src/tasks/page-header-title.es6)

Описание: Предназначен для генерации значения для элемента `<title>` в заголовке страницы.

Для каждой языковой версии каждой страницы создается поле header.title 
в котором находится строка состоящая из соответствующих title-ов всех родительских страниц 
начиная от корневой и заканчивая текущей страницей. title-ы страниц разделены символом "/".

### - [PageHeaderMeta](./src/tasks/page-header-meta.es6)

Описание: Предназначен для генерации данных для тегов `<meta>` в заголовке страницы.
В настоящее время создается следующий набор полей, которые добавляются в поле header.meta
языковой версии каждой страницы.

- ogUrl
- ogType
- description
- ogDescription
- keywords
- ogKeywords

### - [PageBreadcrumbs](./src/tasks/page-breadcrumbs.es6)

Описание: Предназначен для создания структуры "хлебных крошек" для страниц.

### - [PageSearchMeta](./src/tasks/page-search-meta.es6)

Описание: Специфическая задача сборки. Нужна для добавления специальных тегов для индексации
страницы сайта средствами внутреннего поиска Яндекса.


## Разработка собственной задачи сборки

// TODO написать документацию

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

* Ильченко Николай (http://github.com/tavriaforever)
* Константинова Гела (http://github.com/gela-d)
* Гриненко Владимир (http://github.com/tadatuta)
* Абрамов Андрей (https://github.com/blond)

Разработчик Кузнецов Андрей Серргеевич @tormozz48
Вопросы и предложения присылать по адресу: tormozz48@gmail.com
