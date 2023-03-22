const env = require('../src/runner');
const fs = require('node:fs');

test('read the current GitHub environment', async () => {
    process.env.RUNNER_ARCH = 'x64';
    process.env.RUNNER_OS = 'linux';
    const e = await env.readGitHubEnvironment();
    expect(e).toEqual({ arch: 'x86_64', os: 'linux' });
});

test('read the current /etc/os-release file', async () => {
    const readStream = fs.createReadStream('tests/os-release');
    let release = await env.readLinuxRelease(readStream);
    return expect(release).toEqual('ubuntu22');
});
