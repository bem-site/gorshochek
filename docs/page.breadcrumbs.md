## [page.createBreadcrumbs](./src/tasks-page/breadcrumbs)

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
