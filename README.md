A starter kit for making static sites/pages.

Good for small, simple sites. Or for quickly spinning up pages for experimenting.

### Templates

All `.html` files in `application/templates` will be generated with

```
gulp nunjucks
```

If you have data you want used with the template then make a `.json` file with the same name as the template in `application/data`. E.g. `example.json` for `example.html`