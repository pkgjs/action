# pkgjs/action

Use the `pkgjs/action` workflow to automatically add new versions of Node.js to your test matrix.

## Basic usage

1. Define a miminum supported Node.js version in your `package.json`, e.g.

```json
{
  "engines": {
    "node": "^16 || ^14 || ^12"
  }
}
```

2. Create a file (e.g. `ci.yaml`) in your `.github/workflows/` folder:

```yaml
on:
  push:
    branches:
    - main
  pull_request:

jobs:
  test:
    uses: pkgjs/action/.github/workflows/node-test.yaml@v0
    with:
      upgrade-policy: lts           # optional
```

With the above configuration, a test matrix will be created with all the Node.js LTS versions starting from v12. In January, 2022, the above example would yield the following versions: 16, 14, 12 (LTS releases which will not be removed from the matrix), as well as 17 (current non-LTS release - will be removed from the matrix when the support ends).

By default, the test script will check out your repository, execute `npm install` and then execute an `npm test` using the latest Node.js version in every release line in the test matrix. 

## Further reading

- See [detailed documentation](./docs/USAGE.md) for alternative upgrade policies and other settings.
- Read more about [Node.js release support process](https://nodejs.org/en/about/releases/).
- [Choosing the Node.js versions for your CI tests (hint: use LTS)](https://nodejs.medium.com/choosing-the-node-js-versions-for-your-ci-tests-hint-use-lts-89b67f68d7ca)

---

- This repository is managed by the [Package Maintenance Working Group](https://github.com/nodejs/package-maintenance), see [Governance](https://github.com/nodejs/package-maintenance/blob/master/Governance.md).
- [Code of Conduct](https://github.com/nodejs/admin/blob/master/CODE_OF_CONDUCT.md)
- [Contributing](./CONTRIBUTING.md)
