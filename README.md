# Правила

## Модификация структуры формы формы и emitEvent

https://github.com/automerge/automerge/issues/870

## Гранулярность правок

```
merge(
Object.assign(doc, { p: [{ title: 1 }]});
Object.assign(doc, { p: [{ title: 2 }]});
);
returns
{ p: [{title: 2}] };

OR

merge(
doc.p.push([{ title: 1 }])
doc.p.push([{ title: 2 }])
);
returns
{ p: [{title: 1}, {title: 2}] };

OR

merge(
Object.assign(doc, { p: [{ title: 1 }]});
doc.p.push([{ title: 2 }])
);
returns
{ p: [{title: 1}] };

OR

merge(
doc.p.push([{ title: 1 }])
Object.assign(doc, { p: [{ title: 2 }]});
);
returns
{ p: [{title: 2}] };

```

## Использование undefined - запрещено

change:
doc.x = undefined // вызовет ошибку
