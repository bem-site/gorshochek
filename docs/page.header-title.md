## [page.createHeaderTitle](./src/tasks-page/header-title)

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
