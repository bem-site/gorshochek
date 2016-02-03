## [core.normalizeModel](./src/tasks-core/normalize-model)

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
