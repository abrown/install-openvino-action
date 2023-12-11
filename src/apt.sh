#!/bin/bash

set -e

# Install OpenVINO using APT packages. This script expects to be passed certain variables from
# `main.js` (it is easier to calculate them there), but for local use these could be set manually.

version=${version:-2023.2.0}
version_year=${version_year:-2023}
os=${os:-ubuntu22}

# Determine the directory of this script. E.g.:
#  action_dir=/some/directory
action_dir="$(dirname $( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd ))"

# Retrieve the OpenVINO signing key.
curl -sSL https://apt.repos.intel.com/intel-gpg-keys/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB > $action_dir/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB
echo "3e1b48a4dbbbaea2b0f442b9ca15821e $action_dir/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB" > $action_dir/CHECKSUM
md5sum --check $action_dir/CHECKSUM
sudo apt-key add $action_dir/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB

# Add the OpenVINO repository and install the OpenVINO DEB package.
echo "deb https://apt.repos.intel.com/openvino/$version_year $os main" | sudo tee /etc/apt/sources.list.d/intel-openvino-$version_year.list
sudo apt update
sudo apt install -y openvino-$version
