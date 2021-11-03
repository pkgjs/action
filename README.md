# pkgjs/action

Github Actions tooling for testing Node.js packages.

- This repository is managed by the [Package Maintenance Working Group](https://github.com/nodejs/package-maintenance), see [Governance](https://github.com/nodejs/package-maintenance/blob/master/Governance.md).

Use the workflow from this repository in your own workflows to automatically start testing in new versions of Node.js as they get released.

## Usage

1. Define a miminum supported Node.js version in your `package.json`, e.g.

```json
{
  "engines": {
    "node": "^16 || ^14 || ^12 || ^10"
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
    uses: pkgjs/action/.github/workflows/node-test.yaml@main
    with:
      upgrade-policy: lts           # optional
```

With the above configuration, a test matrix will be created which will included all versions that match `upgrade-policy` starting with the minimum major version defined in the `engines.node` field. In October, 2021, the above example would yield the following versions: 16, 14, 12, 10 (see below for more examples).

The test script will check out your repository, execute `npm install` and then execute an `npm test` using the latest Node.js version in every release line in the test matrix. 

### Upgrade policies

Depending on the support policy of your library/application, you can choose when and which versions get added to your test matrix.

Once added to the list, the Long Term Support (LTS) versions will never get removed from the list, i.e. you will need to take explicit action to change the minimum version in your `engines.node` (note: when you increase the minimum version requirements, you should also bump the major version of your package, to indicate breaking changes according to [semver](https://semver.org/)).

This repository offers three upgrade policies:

- **`all`** - new major releases get added as they are released, they never get removed
- **`lts`** (default) - new major releases get added as they are released, non-LTS releases get removed when their support lifetime ends, LTS versions never get removed
  - Note that if your policy is to only support LTS versions, then removing the non-LTS version in your test matrix is not a breaking change, as the non-LTS version was never supported (it was only used for test purposes).
- **`lts/strict`** - new major releases get added as they reach LTS status, they never get removed

### Upgrade timeline

For actual release dates, please check the Node.js [Release Working Group](https://github.com/nodejs/Release/#release-schedule) repository.

This is an example of which versions would be available in each of the files on a certain date, assuming the earliest version in `engines.node` field is `10.x`:

|                       | `all`                          | `lts`                   | `lts/strict` | Notes
|-----------------------|--------------------------------|-------------------------|-------------------------|-------
| Jul, 2020             | 10, 11, 12, 13, 14             | 10, 12, 14              | 10, 12                  |
| Nov, 2020             | 10, 11, 12, 13, 14, 15         | 10, 12, 14, 15          | 10, 12, 14              | In Oct, 2020 v14 reaches LTS and v15 is released
| May, 2021             | 10, 11, 12, 13, 14, 15, 16     | 10, 12, 14, 15, 16      | 10, 12, 14              | In Apr, 2021 v10 reaches EOL and v16 is released
| Jul, 2021             | 10, 11, 12, 13, 14, 15, 16     | 10, 12, 14, 16          | 10, 12, 14              | On 1/Jun/2021, v15 reaches EOL and ⚠️ is removed from `lts` policy files (`lts/strict` never has this version included and `all` keeps it)
| Nov, 2021             | 10, 11, 12, 13, 14, 15, 16, 17 | 10, 12, 14, 16, 17      | 10, 12, 14, 16          | In Oct, 2021 V16 reaches LTS and v17 should be released
