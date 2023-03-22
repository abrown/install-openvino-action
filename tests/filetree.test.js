const filetree = require('../src/filetree');
const json = require('./filetree.json');

test('checks that OS is valid', () => {
    expect(() => filetree.buildUrl(json, '2022.3', '...')).toThrow();
});

test('checks that Linux OS has a distribution', () => {
    expect(() => filetree.buildUrl(json, '2022.3', 'linux')).toThrow();
});

test('checks that MacOS has a release number', () => {
    expect(() => filetree.buildUrl(json, '2022.3', 'macos')).toThrow();
});

test('builds an ubuntu URL', () => {
    expect(filetree.buildUrl(json, '2022.3', 'linux', 'ubuntu20'))
        .toBe('https://storage.openvinotoolkit.org/repositories/openvino/packages/2022.3/linux/l_openvino_toolkit_ubuntu20_2022.3.0.9052.9752fafe8eb_x86_64.tgz');
});

test('builds a Windows URL', () => {
    expect(filetree.buildUrl(json, '2022.2', 'windows'))
        .toBe('https://storage.openvinotoolkit.org/repositories/openvino/packages/2022.2/windows/w_openvino_toolkit_windows_2022.2.0.7713.af16ea1d79a_x86_64.zip');
});

test('builds a MacOS URL', () => {
    expect(filetree.buildUrl(json, '2022.3', 'macos', '10_15'))
        .toBe('https://storage.openvinotoolkit.org/repositories/openvino/packages/2022.3/macos/m_openvino_toolkit_macos_10_15_2022.3.0.9052.9752fafe8eb_x86_64.tgz');
});

test('fails to build older URLs', () => {
    // Before version 2022.2, the file structure is a bit different: all of the OS packages are
    // thrown together into one directory and the nomenclature is a bit ad hoc.
    expect(() => filetree.buildUrl(json, '2022.1', 'macos', '10_15')).toThrow();
});

test('retrieves the JSON', async () => {
    let json = await filetree.readCached('tests/filetree.json');
    expect(json.name).toBe('production');
    expect(json.type).toBe('directory');
    expect(Array.isArray(json.children)).toBe(true);
})
