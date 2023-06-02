#!/bin/bash

set -e

# Install OpenVINO using APT packages. This script expects to be passed certain variables from
# `main.js` (it is easier to calculate them there), but for local use these could be set manually.

# TODO: the latest release (v2023.0.0) is not yet available as an APT package; update this when it
# is.
version=${version:-2022.3.0}
version_year=${version_year:-2022}
os_codename=${os_codename:-focal}

# Determine the directory of this script. E.g.:
#  action_dir=/some/directory
action_dir="$(dirname $( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd ))"

# Retrieve the OpenVINO signing key.
curl -sSL https://apt.repos.intel.com/intel-gpg-keys/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB > $action_dir/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB
echo "818253460e4e4a045cc92ddff13fbc94 $action_dir/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB" > $action_dir/CHECKSUM
md5sum --check $action_dir/CHECKSUM
sudo apt-key add $action_dir/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB

# Warn about the OS codename.
if [ "$os_codename" == "jammy" ]; then
    echo "ERROR: OpenVINO has released no 'jammy' (Ubuntu 22.04) packages; use the 'focal' (Ubuntu 20.04) packages instead"
    exit 1
fi

# Add the OpenVINO repository and install the OpenVINO DEB package.
echo "deb https://apt.repos.intel.com/openvino/$version_year $os_codename main" | sudo tee /etc/apt/sources.list.d/intel-openvino-$version_year.list
sudo apt update
sudo apt install -y openvino-$version
