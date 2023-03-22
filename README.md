install-openvino-action
=======================

Install OpenVINO as a step in a GitHub workflow. This script follows the OpenVINO [APT installation
guide](https://docs.openvino.ai/latest/openvino_docs_install_guides_installing_openvino_apt.html).

### Use

```
  steps:
    - uses: abrown/install-openvino-action
```

### TODO

- do I need `checkout` and `npm install` in `action.yml`?
