#!/bin/bash

set -e
# Download the latest version of OpenVino, untar it, and run setupvars.sh
FILENAME=l_openvino_toolkit_ubuntu20_2022.2.0.7713.af16ea1d79a_x86_64
wget -q --no-check-certificate https://storage.openvinotoolkit.org/repositories/openvino/packages/2022.2/linux/${FILENAME}.tgz
tar -zxf ${FILENAME}.tgz
sudo mkdir -p /opt/intel
sudo mv ${FILENAME} /opt/intel/openvino_2022
sudo ln -s /opt/intel/openvino_2022/ /opt/intel/openvino
source /opt/intel/openvino/setupvars.sh
