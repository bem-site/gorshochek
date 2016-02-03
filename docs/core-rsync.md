## [core.rsync](./src/tasks-core/rsync)

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
