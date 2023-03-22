Contributing
============

This GitHub action can be run locally for testing purposes:

```
npm install
INPUT_VERSION=2022.3 INPUT_RELEASE=ubuntu20 node main.js
```

Unit tests for some of the utilities are available with `npm test`, but the real end-to-end checks
are performed in the [`main.yml`](.github/workflows/main.yml) workflow.

### Releasing

Remember to tag commits to release a new version:

```
git checkout main
git tag --list
git tag v<next available number>
git push --tags
```
