#!/usr/bin/env bash

# Check that the OpenVINO installation is valid (at least on Linux). This verifies that:
# 1. the `OPENVINO_INSTALL_DIR` environment variable is set
# 2. we can find some OpenVINO libraries
# 3. those libraries have no unmet dependencies.

LIBS=(libopenvino.so libopenvino_c.so)

# Check #1: the `OPENVINO_INSTALL_DIR` environment variable is set
if [ -z $OPENVINO_INSTALL_DIR ]; then
    echo "> \$OPENVINO_INSTALL_DIR is not set"
    exit 1
fi

for LIB in $LIBS; do
    # Check #2: we can find the OpenVINO libraries
    FOUND=$(find $OPENVINO_INSTALL_DIR -name $LIB)
    if [ -z $FOUND ]; then
        echo "> error: unable to find $LIB in: $OPENVINO_INSTALL_DIR"
        exit 1
    fi

    # Check #3: the libraries have no unmet dependencies
    echo "> found $LIB: $FOUND"
    if command -v ldd; then
        DEPENDENCIES="$(ldd $FOUND)"
        echo "$DEPENDENCIES"
        if echo $DEPENDENCIES | grep -q "not found"; then
            echo "> error: $LIB is missing a dependency (is the environment set up correctly?)"
            exit 1
        fi
    fi
done
