#Project starter

A starter kit for making static sites/pages.

Good for small, simple sites. Or for quickly spinning up pages for experimenting.

Requires

* NPM
* Gulp
* Nunjucks

##Getting started

To install everything that is needed, run

```
npm install
```

Then to generate first round of pages and assets, run

```
gulp build
```

###Templates

All `.html` files in `application/templates` will be generated with

```
gulp nunjucks
```

If you have data you want used with the template then make a `.json` file with the same name as the template in `application/data`. E.g. `example.json` for `example.html`