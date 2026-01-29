#!/bin/bash

# Setup PocketBase for Allies Connect Prototype

PB_VERSION="0.22.25" # Using a stable recent version
PB_FILE="pocketbase_${PB_VERSION}_linux_amd64.zip"
INSTALL_DIR="pocketbase"

echo "Creating directory..."
mkdir -p $INSTALL_DIR

echo "Downloading PocketBase v${PB_VERSION}..."
wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/${PB_FILE}" -O "${INSTALL_DIR}/${PB_FILE}"

echo "Unzipping..."
unzip -o "${INSTALL_DIR}/${PB_FILE}" -d "$INSTALL_DIR"

echo "Cleaning up zip file..."
rm "${INSTALL_DIR}/${PB_FILE}"

# Make executable
chmod +x "${INSTALL_DIR}/pocketbase"

echo "PocketBase installed successfully in ./$INSTALL_DIR"
echo "To start PocketBase, run: ./$INSTALL_DIR/pocketbase serve"
