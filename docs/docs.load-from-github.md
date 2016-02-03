## [docs.loadFromGithub](./src/tasks-docs/load-from-github)

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
