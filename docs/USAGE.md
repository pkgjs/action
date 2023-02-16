# Usage


- `with`
  - [`exclude`](#exclude)
  - [`include`](#include)
  - [`post-checkout-steps`](#post-checkout-steps)
  - [`post-install-steps`](#post-install-steps)
  - [`post-test-steps`](#post-test-steps)
  - [`runs-on`](#runs-on)
  - [`strategy-fail-fast`](#strategy-fail-fast)
  - [`strategy-max-parallel`](#strategy-max-parallel)
  - [`timeout-minutes`](#timeout-minutes)
  - [`test-command`](#test-command)
  - [`upgrade-policy`](#upgrade-policy)
- `secrets`
  - [`test-secrets`](#test-secrets)


## Parameters (inputs, allowed [via `jobs.<job_id>.with`](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#jobsjob_idwith))

### `exclude`

A string with matrix combinations to be skipped as a YAML/JSON array of objects with the following keys: `node-version`, `runs-on`.

See also:

- [Github Actions matrix documentation](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix)
- [`include`](#include)
- [`runs-on`](#runs-on)


#### Example

```yaml
jobs:
  test:
    uses: pkgjs/action/.github/workflows/node-test.yaml@v0
    with:
      runs-on: ubuntu-latest, macos-latest
      exclude: |
        - runs-on: ubuntu-latest
          node-version: 17
        - node-version: 16
```

Assuming that the package `engines` field defines `14` as the earliest LTS version and `17` is the latest version available, the above configuration would result in the following test matrix:

- Latest Node.js 14.x on Ubuntu
- Latest Node.js 14.x on macOS
- Latest Node.js 17.x on macOS


### `include`

A string with additional matrix combinations as a YAML/JSON array of objects with the following keys: `node-version`, `runs-on`, `experimental`.

When `experimental` is set to `true` on a matrix item and the [`strategy-fail-fast` is also set to `true`](#strategy-fail-fast), the failures of that matrix item will allow the workflow to continue.

Note: All `include` combinations are processed after `exclude`. This allows you to use `include` to add back combinations that were previously excluded.

See also:

- [Github Actions matrix documentation](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix)
- [`exclude`](#exclude)
- [`runs-on`](#runs-on)
- [`strategy-fail-fast`](#strategy-fail-fast)


#### Example

```yaml
jobs:
  test:
    uses: pkgjs/action/.github/workflows/node-test.yaml@v0
    with:
      runs-on: ubuntu-latest, macos-latest
      include: |
        - runs-on: ubuntu-latest
          node-version: 8
          experimental: true
        - node-version: v12.0.0
```

Assuming that the package `engines` field defines `16` as the earliest LTS version and `17` is the latest version available, the above configuration would result in the following test matrix:

- Latest Node.js 8.x on Ubuntu (failures will not cancel the workflow)
- Node.js 12.0.0 on Ubuntu
- Node.js 12.0.0 on macOS
- Latest Node.js 16.x on Ubuntu
- Latest Node.js 16.x on macOS
- Latest Node.js 17.x on Ubuntu
- Latest Node.js 17.x on macOS



### `post-checkout-steps`

A string with the [YAML of steps](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#jobsjob_idsteps) to execute after checkout (i.e. before installing dependencies).

Note: this creates a temporary local [composite action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action). Unless you need to call another action, it may be simpler to use [a `preinstall` script](https://docs.npmjs.com/cli/v8/using-npm/scripts) instead.

#### Example

```yaml
jobs:
  test:
    uses: pkgjs/action/.github/workflows/node-test.yaml@v0
    with:
      post-checkout-steps: |
        - name: Download some library
          run: curl https://example.com/unsafe-code.sh | bash
```


### `post-install-steps`

A string with the [YAML of steps](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#jobsjob_idsteps) to execute after installing dependencies (i.e. before running tests).

Note: this creates a temporary local [composite action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action). Unless you need to call another action, it may be simpler to use [a `postinstall` script](https://docs.npmjs.com/cli/v8/using-npm/scripts) instead.


#### Example

```yaml
jobs:
  test:
    uses: pkgjs/action/.github/workflows/node-test.yaml@v0
    with:
      post-install-steps: |
        - name: Check dependencies for vulnerabilities
          run: npm audit
```


### `post-test-steps`

A string with the [YAML of steps](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#jobsjob_idsteps) to execute after the tests complete.

Note: this creates a temporary local [composite action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action). Unless you need to call another action, it may be simpler to use [a `posttest` script](https://docs.npmjs.com/cli/v8/using-npm/scripts) instead.


#### Example

```yaml
jobs:
  test:
    uses: pkgjs/action/.github/workflows/node-test.yaml@v0
    with:
      post-test-steps: |
        - name: Coverage Report
          uses: codecov/codecov-action@v2
```


### `runs-on`

Add a comma separated list (or a string with an array in YAML/JSON) of runner labels (operating systems).

See [Github actions documentation for `jobs.<job_id>.runs-on`](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#jobsjob_idruns-on) for a list of available values.

#### Examples

```yaml
jobs:
  test:
    uses: pkgjs/action/.github/workflows/node-test.yaml@v0
    with:
      runs-on: ubuntu-latest, macos-latest
```

```yaml
jobs:
  test:
    uses: pkgjs/action/.github/workflows/node-test.yaml@v0
    with:
      runs-on: '["ubuntu-latest", "macos-latest"]'
```

```yaml
jobs:
  test:
    uses: pkgjs/action/.github/workflows/node-test.yaml@v0
    with:
      runs-on: |
        - ubuntu-latest
        - macos-latest
```


### `strategy-fail-fast`

Set to `true` to cancel the workflow as soon as the first matrix combo fails.

Note: ⚠️ default here is different than the Github Actions default.

See [Github Actions documentation for `jobs.<job_id>.strategy.fail-fast`](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#jobsjob_idstrategyfail-fast).

### `strategy-max-parallel`

The maximum number of matrix jobs that can run simultaneously. Default is unlimited.

See [Github Actions documentation for `jobs.<job_id>.strategy.max-parallel`](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#jobsjob_idstrategymax-parallel).


### `timeout-minutes`

The maximum number of minutes to let a job run before GitHub automatically cancels it. Default: 360

See [Github Actions documentation for `jobs.<job_id>.timeout-minutes`](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idtimeout-minutes).


### `test-command`

Command to run instead of `npm test`.

#### Example

```yaml
jobs:
  test:
    uses: pkgjs/action/.github/workflows/node-test.yaml@v0
    with:
      test-command: npm run coverage
```


### `upgrade-policy`

Depending on the support policy of your library/application, you can choose when and which versions get added to your test matrix.

Once added to the list, the Long Term Support (LTS) versions will never get removed from the list, i.e. you will need to take explicit action to change the minimum version in your `engines.node` (note: when you increase the minimum version requirements, you should also bump the major version of your package, to indicate breaking changes according to [semver](https://semver.org/)).

This repository offers three upgrade policies:

- **`all`** - new major releases get added as they are released, they never get removed
- **`lts`** (default) - new major releases get added as they are released, non-LTS releases get removed when their support lifetime ends, LTS versions never get removed
    - Note that if your policy is to only support LTS versions, then removing the non-LTS version in your test matrix is not a breaking change, as the non-LTS version was never supported (it was only used for test purposes).
- **`lts/strict`** - new major releases get added as they reach LTS status, they never get removed

#### Upgrade timeline

For actual release dates, please check the Node.js [Release Working Group](https://github.com/nodejs/Release/#release-schedule) repository.

This is an example of which versions would be available in each of the files on a certain date, assuming the earliest version in `engines.node` field is `10.x`:

|           | `all`                          | `lts`              | `lts/strict`   | Notes                                                                                                                                      |
|-----------|--------------------------------|--------------------|----------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| Jul, 2020 | 10, 11, 12, 13, 14             | 10, 12, 14         | 10, 12         |                                                                                                                                            |
| Nov, 2020 | 10, 11, 12, 13, 14, 15         | 10, 12, 14, 15     | 10, 12, 14     | In Oct, 2020 v14 reaches LTS and v15 is released                                                                                           |
| May, 2021 | 10, 11, 12, 13, 14, 15, 16     | 10, 12, 14, 15, 16 | 10, 12, 14     | In Apr, 2021 v10 reaches EOL and v16 is released                                                                                           |
| Jul, 2021 | 10, 11, 12, 13, 14, 15, 16     | 10, 12, 14, 16     | 10, 12, 14     | On 1/Jun/2021, v15 reaches EOL and ⚠️ is removed from `lts` policy files (`lts/strict` never has this version included and `all` keeps it) |
| Nov, 2021 | 10, 11, 12, 13, 14, 15, 16, 17 | 10, 12, 14, 16, 17 | 10, 12, 14, 16 | In Oct, 2021 V16 reaches LTS and v17 should be released                                                                                    |


## Secrets (allowed [via `jobs.<job_id>.secrets`](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#jobsjob_idsecrets))

### `test-secrets`

A JSON object with the secret environment variables to be set for the 'Run tests' step. Values will be masked in output.

Note: make sure that your secrets are valid JSON strings (you can escape them by using [`toJSON` expression](https://docs.github.com/en/actions/learn-github-actions/expressions#tojson))

⚠️ Security Warning: ⚠️

While care has been taken to mask the secret values in log output (the input JSON as a whole and the individual values), there might exist a chance of leaking them via the publicly available UIs. 
There is no official Github Actions support for passing arbitrary environment variables and secrets into re-usable workflows. 
The implementation of `test-secrets` is, generally, a workaround for the limitation that re-usable workflows do not receive the environment of the calling workflow.

#### Example

```yaml
jobs:
  test:
    uses: pkgjs/action/.github/workflows/node-test.yaml@v0
    secrets:
      test-secrets: |-
        {
          "VERY_SECRET": ${{ toJSON(secrets.VERY_SECRET) }} 
        }
```
