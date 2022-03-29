# tpl-typescript

EdgerOS app template of TypeScript.

## Usage

### Install:

- `git clone git@github.com:edgeros/tpl-typescript.git`
- select 'TypeScript' template when [create project from VSCode](https://marketplace.visualstudio.com/items?itemName=edgeros.edgeros)
- select 'TypeScript' template when create project via CLI (TBD)

Remember to **`npm install` before you start**

### Compile

Remember to **compile the TypeScript before uploading**. By default `dist` will be the output folder, and we build the EdgerOS app from there too.

```shell
npm run compile
```

### ESLint

Enforce code style and locate problems.

```shell
npm run lint
```
