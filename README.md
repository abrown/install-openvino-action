install-openvino-action
=======================

Install OpenVINO as a step in a GitHub workflow.

### Use

```
  steps:
    - uses: abrown/install-openvino-action
```

### Parameters

| Input     | Default  | Description                                                                                                                                                                                |
|-----------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `version` | 2024.4.0 | The release version of OpenVINO to install.                                                                                                                                                |
| `os`      |          | Auto-detected, only use this to override the OS. One of: `linux`, `macos`, `windows`.                                                                                                      |
| `release` |          | Auto-detected, only use to override the release distribution. For Linux, a string indicating which distribution to use, e.g., `ubuntu20`; OpenVINO has packages for various distributions. |
| `arch`    |          | Auto-detected, only use to override the CPU architecture. One of: `x86_64`, `arm64`. The architecture selection is limited by what packages OpenVINO publishes.                            |
| `apt`     | false    | Install from [APT packages]; this is limited to Debian-based Linux and limited versions.                                                                                                   |
| `env`     | true     | Run the OpenVINO setup script to configure the environment (e.g., for library loading).                                                                                                    |

[APT packages]: https://docs.openvino.ai/latest/openvino_docs_install_guides_installing_openvino_apt.html

### Contributing

See the developer documentation in [`CONTRIBUTING.md`](./CONTRIBUTING.md).
