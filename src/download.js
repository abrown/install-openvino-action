/**
 * Download utilities; we need to retrieve files from OpenVINO's servers (`download`) and this
 * module adds the ability to pass through GitHub's cache (`downloadCached`).
 */

const cache = require('@actions/cache');
const core = require('@actions/core');
const fs = require('node:fs');
const https = require('node:https');

/**
 * Use GitHub's cache, if available, instead of downloading the URL. This uses the filename as the
 * cache key.
 * @param {string} fromUrl - the URL to download from
 * @param {string} [toPath] - the path to download to; if none is provided, this is calculated from
 * the last segment of the URL path (like `wget`)
 * @returns {Promise} a promise to the filename the URL was downloaded to or cached at
 */
async function downloadCached(fromUrl, toPath) {
    const path = toPath || fromUrl.split("/").pop();
    if (cache.isFeatureAvailable()) {
        let cacheKey = await cache.restoreCache([path], path);
        if (!cacheKey) {
            await download(fromUrl, path);
            await cache.saveCache([path], path);
        }
    } else {
        await download(fromUrl, path);
    }
    return path;
}

/**
 * @param {string} fromUrl - the URL to download from
 * @param {string} toPath - the file system file to download to
 * @returns a promise resolving to the `toPath` once the bytes have been downloaded
 */
async function download(fromUrl, toPath) {
    core.info(`downloading: ${fromUrl} ==> ${toPath}`);
    const file = fs.createWriteStream(toPath);
    return new Promise((resolve, reject) => {
        https.get(fromUrl, (res) => {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                let numBytes = fs.statSync(toPath).size;
                core.info(`finished downloading ${numBytes} bytes`);
                resolve(toPath);
            });
        }).on('error', reject);
    });
}

module.exports = { download, downloadCached };
