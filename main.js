#!/usr/bin/env node

const core = require('@actions/core');
const download = require('./src/download');
const runner = require('./src/runner');
const filetree = require('./src/filetree');
const child_process = require('node:child_process');
const fs = require('node:fs');

/**
 * Main entry point for this GitHub action. This function will parse the inputs (see `action.yml`)
 * and decide how to install OpenVINO:
 * - *APT packages*: on Debian-based Linux, we can set `apt == true` to install the OpenVINO APT
 *   packages; in later versions of OpenVINO, this installs libraries to the system's default
 *   installation paths (e.g., `/usr/lib/x86_64-linux-gnu`).
 * - *extracted archive*: an OS-portable way to install OpenVINO is to download the archive (`.tgz`
 *   or `.zip`) and extract it; this method also sets up the `OPENVINO_INSTALL_DIR` environment
 *   variable.
 */
async function run() {
    // Read in the inputs; `core.getInput` reads environment variables like `INPUT_FILETREE`.
    const version = core.getInput('version', { required: true });
    core.info(`version: ${version}`);
    const env = runner.readGitHubEnvironment();
    const arch = core.getInput('arch') || env.arch;
    core.info(`arch: ${arch}`);
    const os = core.getInput('os') || env.os;
    core.info(`os: ${os}`);
    let linuxRelease;
    if (os === 'linux') {
        linuxRelease = await runner.readLinuxRelease(fs.createReadStream('/etc/os-release'));
    }
    const release = core.getInput('release') || `${linuxRelease.id}${linuxRelease.version}`;
    core.info(`release: ${release}`);
    const useApt = core.getInput('apt');

    // Choose between an APT installation or an extracted archive installation.
    if (useApt) {
        // Retrieve and install the OpenVINO package with APT. We shell out to a Bash script since
        // we expect this to only run on Linux machines.
        if (os !== 'linux') {
            core.warning('retrieving OpenVINO with APT is unlikely to work on OSes other than Linux.');
        }
        bash('src/apt.sh');
        // TODO cache these APT packages: https://cloudaffaire.com/faq/caching-apt-packages-in-github-actions-workflow/
    } else {
        // Download and decompress the OpenVINO archive from https://storage.openvinotoolkit.org.
        const filetreeJson = await filetree.readCached('filetree.json');
        const url = filetree.buildUrl(filetreeJson, version, os, release, arch);
        core.info(`url: ${url}`);
        let fileName = await download.downloadCached(url);
        decompress(fileName);
        // TODO set up OPENVINO_INSTALL_DIR
    }
}

function decompress(path) {
    const args = ['-xf', path];
    core.info(`decompressing: tar ${args.join(' ')}`);
    child_process.execFileSync('tar', args, { stdio: 'inherit' });
}

function bash(scriptPath) {
    core.info(`running: bash ${scriptPath}`);
    child_process.execFileSync('bash', [scriptPath], { stdio: 'inherit' });
}

function logError(e) {
    console.log("ERROR: ", e.message);
    try {
        console.log(JSON.stringify(e, null, 2));
    } catch (e) {
        // ignore JSON errors for now
    }
    console.log(e.stack);
}

run().catch(err => {
    logError(err);
    core.setFailed(err.message);
});

