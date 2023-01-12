#!/bin/bash

set -e

# Determine the OpenVINO version to install from the first parameter. Also, split out the parts of
# this version; `${version_parts[0]}` should contain the year. E.g.:
#  version=2021.4.752
#  version_year=2021
if [ "$#" -ne 1 ]; then
    version="2022.3.0"
else
    version="$1"
fi
IFS='.' read -ra version_parts <<< "$version"
version_year="${version_parts[0]}"

# Determine the OS name and version (Linux-specific for now). E.g.:
#  os_name=ubuntu
#  os_version=20.04
#  os_version_year=20
eval $(source /etc/os-release; echo os_name="$ID"; echo os_version="$VERSION_ID"; echo os_version_codename="$VERSION_CODENAME")
IFS='.' read -ra os_version_parts <<< "$os_version"
os_version_year="${os_version_parts[0]}"

# Determine the directory of this script. E.g.:
#  script_dir=/some/directory
scriptdir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Retrieve the OpenVINO checksum.
curl -sSL https://apt.repos.intel.com/intel-gpg-keys/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB > $scriptdir/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB
echo "818253460e4e4a045cc92ddff13fbc94 $scriptdir/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB" > $scriptdir/CHECKSUM
md5sum --check $scriptdir/CHECKSUM

# Downgrade the OS codename; OpenVINO will not publish a `jammy` (Ubuntu 22.04) release
# for OpenVINO 2022.3 so we must use the `focal` (Ubuntu 20.04).
if [ "$os_version_codename" == "jammy" ]; then
    os_version_codename=focal
fi

# Add the OpenVINO repository (DEB-specific for now).
sudo apt-key add $scriptdir/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB
echo "deb https://apt.repos.intel.com/openvino/$version_year $os_version_codename main" | sudo tee /etc/apt/sources.list.d/intel-openvino-$version_year.list
sudo apt update

# Install the OpenVINO package.
sudo apt install -y openvino-$version
