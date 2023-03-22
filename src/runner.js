/**
 * Figure out some environmental information about a GitHub runner.
 */

const readline = require('node:readline');
const events = require('node:events');
const node_os = require('node:os');

/**
 * @returns {object} with the OpenVINO-compatible `os` and `arch` from the GitHub actions
 * environment or, if that is not available, from the NodeJS `os` module
 * @see
 * https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
 */
function readGitHubEnvironment() {
    let arch = (process.env.hasOwnProperty('RUNNER_ARCH')) ?
        process.env.RUNNER_ARCH.toLowerCase() :
        node_os.arch();
    if (arch === 'x64') {
        arch = 'x86_64';
    }

    let os = (process.env.hasOwnProperty('RUNNER_OS')) ?
        process.env.RUNNER_OS.toLowerCase() :
        node_os.platform();
    if (os === 'darwin') {
        os = 'macos';
    }
    if (os === 'win32') {
        os = 'windows';
    }

    return { arch, os, }
}

/**
 * @param {ReadableStream} readStream - a readable stream of an `os-release` file with `ID=` and
 * `VERSION_ID=` lines; e.g.: `fs.createReadStream('/etc/os-release')`
 * @returns {object} with the `id`, `version`, and `codename` of the Linux OS; e.g. `{id:
 * 'ubuntu', version: '22', codename: 'jammy'}`
 */
async function readLinuxRelease(readStream) {
    const out = {};
    const REGEX_ID = /ID="?([a-z]+)"?/;
    const REGEX_VERSION = /VERSION_ID="?([0-9]+)\..+"?/
    const REGEX_CODENAME = /VERSION_CODENAME="?([a-z]+)"?/
    const lines = readline.createInterface({
        input: readStream
    });
    lines.on('line', (line) => {
        const id_match = REGEX_ID.exec(line);
        if (id_match) out.id = id_match[1];
        const version_match = REGEX_VERSION.exec(line);
        if (version_match) out.version = version_match[1];
        const codename_match = REGEX_CODENAME.exec(line);
        if (codename_match) out.codename = codename_match[1];
    });
    await events.once(lines, 'close');
    return out;
}

module.exports = { readGitHubEnvironment, readLinuxRelease };
