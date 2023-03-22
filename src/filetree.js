/**
 * OpenVINO's repository contents are listed in a JSON file--`filetree.json`; this module
 * understands how to retrieve it (`readCached`) and build up download URLs (`buildURL`) from it.
 */

const assert = require('node:assert');
const core = require('@actions/core');
const download = require('./download');
const fs = require('node:fs');

const URL = 'https://storage.openvinotoolkit.org';
const OS = ['windows', 'macos', 'linux'];

/**
 * @param {string} path - the path to the filetree data; if the path does not exist, this function
 * will attempt to retrieve it either from GitHub's cache or directly from the OpenVINO site itself.
 * @returns {object} the parsed filetree data
 */
async function readCached(path) {
    if (!fs.existsSync(path)) {
        const downloadedPath = await download.downloadCached(`${URL}/filetree.json`, path);
        assert(downloadedPath === path);
    }
    return JSON.parse(fs.readFileSync(path));
}

/**
 * Build up a download URL for an artifact from https://storage.openvinotoolkit.org.
 * @param {object} filetree - the JSON object at https://storage.openvinotoolkit.org/filetree.json.
 * @param {string} version - the version of OpenVINO to install; e.g., `2022.3`
 * @param {string} os - the operating system: `windows`, `linux`, `macos`
 * @param {string} [release] - for the Linux `os`, indicate which distribution to retrieve; e.g.
 * `ubuntu20` for Linux or `10_15` for MacOS
 * @param {string} [arch=x86_64] - the CPU architecture; e.g., `x86_64`
 * @returns {string} a download URL for the OpenVINO package
 */
function buildUrl(filetree, version, os, release, arch = 'x86_64') {
    assert(OS.includes(os), `'os' not in [${OS.join('|')}]`);
    if (os === 'linux') {
        assert(isString(release));
    }
    if (os === 'macos') {
        assert(isString(release));
    }
    if (os === 'windows') {
        release = 'windows';
    }

    const packages = filetree
        .children.find(e => e.name === 'repositories')
        .children.find(e => e.name === 'openvino')
        .children.find(e => e.name === 'packages')
        .children.find(e => e.name === version)
        .children.find(e => e.name === os)
        .children;

    const fileMatch = `${release}_${version}`;
    const fileEnd = (os === 'windows') ? `${arch}.zip` : `${arch}.tgz`;
    const matched = packages.find(e => e.type === 'file' && e.name.includes(fileMatch) && e.name.endsWith(fileEnd));
    if (!matched) {
        core.info(`packages: ${JSON.stringify(packages, null, 2)}`);
        core.setFailed(`unable to match any package containing '${fileMatch}' and ending with '${fileEnd}'`);
    }

    return `${URL}/repositories/openvino/packages/${version}/${os}/${matched.name}`;
}

function isString(s) {
    return typeof s === 'string' || s instanceof String;
}

module.exports = { readCached, buildUrl };
