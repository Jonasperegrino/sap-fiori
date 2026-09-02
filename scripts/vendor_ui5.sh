#!/usr/bin/env bash
# Vendor the OpenUI5 runtime into app/resources/ so the PoC app runs fully
# offline (no CDN dependency at demo time, no third-party script supply chain).
#
# Idempotent: skips when app/resources/sap-ui-core.js already exists.
# Re-run with FORCE=1 to re-download.
set -euo pipefail

VERSION="1.151.0"
PACKAGES=(sap.ui.core sap.m sap.ui.layout sap.ui.unified themelib_sap_fiori_3)
# npm src trees carry only .less theme sources — the compiled library.css per
# theme exists only in the built runtime, so fetch it from the versioned CDN.
BUILT_CSS=(
  "sap/ui/core/themes/base/library.css"
  "sap/ui/core/themes/sap_fiori_3/library.css"
  "sap/m/themes/sap_fiori_3/library.css"
  "sap/ui/layout/themes/sap_fiori_3/library.css"
  "sap/ui/unified/themes/sap_fiori_3/library.css"
)
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$ROOT_DIR/resources"

if [ -f "$TARGET/sap-ui-core.js" ] && [ "${FORCE:-0}" != "1" ]; then
  echo "OpenUI5 already vendored at resources/ — nothing to do (FORCE=1 to re-download)"
  exit 0
fi

command -v npm >/dev/null 2>&1 || { echo "error: npm is required to vendor UI5" >&2; exit 1; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "Downloading OpenUI5 $VERSION from @openui5/* npm packages…"
for pkg in "${PACKAGES[@]}"; do
  dir="$WORK/$pkg"
  mkdir -p "$dir"
  curl -sfL "https://registry.npmjs.org/@openui5/$pkg/-/$pkg-$VERSION.tgz" -o "$WORK/$pkg.tgz"
  tar -xzf "$WORK/$pkg.tgz" -C "$dir" --strip-components=1
done

rm -rf "$TARGET"
mkdir -p "$TARGET"
# @openui5 npm packages ship the dev-mode tree under src/ — flattening it to
# resources/ matches the CDN layout (sap-ui-core.js at the root, libraries
# under sap/<lib>/). UI5 then loads modules individually instead of preloads.
for pkg in "${PACKAGES[@]}"; do
  cp -R "$WORK/$pkg/src/." "$TARGET/"
done

echo "Downloading compiled theme CSS…"
for rel in "${BUILT_CSS[@]}"; do
  curl -sfL "https://sdk.openui5.org/$VERSION/resources/$rel" -o "$TARGET/$rel"
done

echo "Vendored OpenUI5 $VERSION → resources/ ($(du -sh "$TARGET" | cut -f1))"
