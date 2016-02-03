## [page.createHeaderMeta](./src/tasks-page/header-meta)

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
