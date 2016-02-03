## [core.saveModel](./src/tasks-core/save-model)

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
