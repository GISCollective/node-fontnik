#!/bin/bash

set -eu
set -o pipefail

function install() {
  mason install $1 $2
  mason link $1 $2
}

# setup mason
./scripts/setup.sh --config local.env
source local.env

# Conditional installation for boost
if [ -z "${DISABLE_BOOST_INSTALL_MASON:-}" ]; then
  install boost 1.67.0
else
  echo "Skipping installation of boost"
fi

# Conditional installation for freetype
if [ -z "${DISABLE_BOOST_INSTALL_FREETYPE:-}" ]; then
  install freetype 2.7.1
else
  echo "Skipping installation of freetype"
fi

install protozero 1.6.8
install sdf-glyph-foundry 0.2.0
install gzip-hpp 0.1.0
