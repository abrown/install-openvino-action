#!/usr/bin/env node

const child_process = require('node:child_process');
const core = require('@actions/core');
const download = require('./src/download');
const filetree = require('./src/filetree');
const fs = require('node:fs');
const runner = require('./src/runner');
const path = require('node:path');

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
    const version = core.getInput('version');
    core.info(`version: ${version}`);
    const env = runner.readGitHubEnvironment();
    const arch = core.getInput('arch') || env.arch;
    core.info(`arch: ${arch}`);
    const os = core.getInput('os') || env.os;
    core.info(`os: ${os}`);
    let linuxRelease, defaultRelease;
    if (os === 'linux') {
        linuxRelease = await runner.readLinuxRelease(fs.createReadStream('/etc/os-release'));
        defaultRelease = `${linuxRelease.id}${linuxRelease.version}`;
    }
    if (os === 'macos') {
        if (version >= '2024.1.0') {
            defaultRelease = '12_6';
        } else {
            defaultRelease = '10_15';
        }
    }
    let release = core.getInput('release') || defaultRelease;
    if (release === 'ubuntu22' && version.startsWith('2022')) {
        core.warning('downgrading jammy packages to focal; OpenVINO has no jammy packages for this version but focal should work');
        release = 'ubuntu20'
        // See how this is recorded below in `_OPENVINO_INSTALL_RELEASE`
    }
    core.info(`release: ${release}`);
    const useApt = core.getBooleanInput('apt');
    core.info(`apt: ${useApt}`);

    // Choose between an APT installation or an extracted archive installation.
    if (useApt) {
        // Retrieve and install the OpenVINO package with APT. We shell out to a Bash script since
        // we expect this to only run on Linux machines.
        if (os !== 'linux') {
            core.warning('retrieving OpenVINO with APT is unlikely to work on OSes other than Linux.');
        }
        const env = { version, version_year: version.split('.')[0], release };
        bash('src/apt.sh', env);
        // TODO cache these APT packages: https://cloudaffaire.com/faq/caching-apt-packages-in-github-actions-workflow/
    } else {
        // Download and decompress the OpenVINO archive from https://storage.openvinotoolkit.org.
        const filetreeJson = await filetree.readCached('filetree.json');
        const version_stripped = version.replace(/\.0$/, ''); // The filetree strips off the `.0`.
        const url = filetree.buildUrl(filetreeJson, version_stripped, os, release, arch);
        core.info(`url: ${url}`);
        let downloadedFile = await download.downloadCached(url);
        decompress(downloadedFile);
        const extractedDirectory = path.resolve(path.parse(downloadedFile).name);
        core.info(`Setting up environment: OPENVINO_INSTALL_DIR=${extractedDirectory}`);
        core.exportVariable('OPENVINO_INSTALL_DIR', extractedDirectory);
        // As long as we still downgrade jammy packages to focal, we need to inform the GitHub
        // action that we did so.
        core.exportVariable('_OPENVINO_INSTALL_RELEASE', release);
    }
}

function decompress(path) {
    const ext = path.split('.').pop();
    let cmd, args;
    if (ext === 'tgz') {
        cmd = 'tar';
        args = ['-xf', path];
    } else if (ext === 'zip') {
        // Assume that .zip files are only used on Windows.
        cmd = '7z';
        args = ['x', path];
    } else {
        throw new Error(`unrecognized extension to decompress: ${path}`)
    }
    core.info(`decompressing: ${cmd} ${args.join(' ')}`);
    child_process.execFileSync(cmd, args, { stdio: 'inherit' });
}

function bash(scriptPath, env) {
    core.info(`running: bash ${scriptPath}`);
    child_process.execFileSync('bash', [scriptPath], { stdio: 'inherit', env });
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

