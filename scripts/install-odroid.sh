#!/usr/bin/env bash
# ==============================================================================
# BUGAR - One-Line Installer & Updater for ODROID-C2 (ARM64 / DietPi / Debian)
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/faisalfa123/bugar/main/scripts/install-odroid.sh | sudo bash
# ==============================================================================
set -euo pipefail

REPO="faisalfa123/bugar"
INSTALL_BIN="/usr/local/bin/bugar"
DATA_DIR="/var/lib/bugar"
SERVICE_FILE="/etc/systemd/system/bugar.service"
DEFAULT_PORT=8080

echo "=========================================================="
echo "  🏋️ BUGAR - Edge Fitness & Nutrition Server Installer"
echo "  Target: ODROID-C2 / ARM64 SBC (Single Binary Edition)"
echo "=========================================================="

# Check root privileges
if [ "$(id -u)" -ne 0 ]; then
    echo "❌ Error: Skrip ini harus dijalankan sebagai root (gunakan sudo bash)." >&2
    exit 1
fi

# 1. Architecture Check
ARCH=$(uname -m)
if [ "$ARCH" != "aarch64" ] && [ "$ARCH" != "arm64" ]; then
    echo "⚠️ Peringatan: Arsitektur terdeteksi adalah '$ARCH'. Binary yang diunduh dikompilasi untuk aarch64 (ARM64)."
fi

# 2. Dependencies Check
command -v curl >/dev/null 2>&1 || { apt-get update && apt-get install -y curl; }
command -v sha256sum >/dev/null 2>&1 || { echo "❌ sha256sum tidak ditemukan."; exit 1; }

# 3. Fetch latest release info
echo "🔍 Memeriksa rilis terbaru dari GitHub ($REPO)..."
LATEST_RELEASE=$(curl -sSL -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${REPO}/releases/latest" || true)

# Extract tag or fallback
TAG_NAME=$(echo "$LATEST_RELEASE" | grep -oP '"tag_name":\s*"\K[^"]+' || echo "latest")
if [ -z "$TAG_NAME" ] || [ "$TAG_NAME" = "latest" ]; then
    DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/bugar-linux-arm64"
    CHECKSUM_URL="https://github.com/${REPO}/releases/latest/download/checksums.txt"
else
    echo "📦 Versi ditemukan: $TAG_NAME"
    DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${TAG_NAME}/bugar-linux-arm64"
    CHECKSUM_URL="https://github.com/${REPO}/releases/download/${TAG_NAME}/checksums.txt"
fi

TMP_DIR=$(mktemp -d /tmp/bugar-install.XXXXXX)
trap 'rm -rf "$TMP_DIR"' EXIT

echo "⬇️ Mengunduh bugar-linux-arm64..."
if ! curl -fsSL "$DOWNLOAD_URL" -o "$TMP_DIR/bugar-linux-arm64"; then
    echo "❌ Gagal mengunduh binary dari $DOWNLOAD_URL"
    echo "💡 Pastikan GitHub Actions Release telah selesai mempublikasikan binary rilis."
    exit 1
fi

# Checksum verification (if checksums.txt exists)
if curl -fsSL "$CHECKSUM_URL" -o "$TMP_DIR/checksums.txt" 2>/dev/null; then
    echo "🔒 Memverifikasi integritas SHA256..."
    cd "$TMP_DIR"
    EXPECTED_HASH=$(grep "bugar-linux-arm64" checksums.txt | awk '{print $1}')
    ACTUAL_HASH=$(sha256sum bugar-linux-arm64 | awk '{print $1}')
    if [ -n "$EXPECTED_HASH" ] && [ "$EXPECTED_HASH" != "$ACTUAL_HASH" ]; then
        echo "❌ Verifikasi SHA256 gagal! Hash tidak cocok." >&2
        exit 1
    fi
    echo "✅ Verifikasi SHA256 berhasil."
    cd - >/dev/null
fi

# Stop existing service if running (prevents text file busy error)
if systemctl is-active --quiet bugar.service 2>/dev/null; then
    echo "⏸️ Menghentikan service bugar sementara untuk update..."
    systemctl stop bugar.service
fi

# Install binary
echo "🚀 Memasang binary ke $INSTALL_BIN..."
install -m 755 "$TMP_DIR/bugar-linux-arm64" "$INSTALL_BIN"

# Create Data Directory
mkdir -p "$DATA_DIR"
chmod 750 "$DATA_DIR"

# Ensure /mnt/hdd1/bugar is prepared if /mnt/hdd1 is mounted
HDD_DIR="/mnt/hdd1/bugar"
if [ -d "/mnt/hdd1" ]; then
    mkdir -p "$HDD_DIR"
    chmod 775 "$HDD_DIR" || true
fi

# Generate systemd unit file
echo "⚙️ Menyiapkan systemd service ($SERVICE_FILE)..."
cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=BUGAR Edge Server (ODROID-C2 Fitness & Health)
After=network.target

[Service]
Type=simple
ExecStart=${INSTALL_BIN} --port ${DEFAULT_PORT} --db ${DATA_DIR}/bugar.db --hdd-dir ${HDD_DIR}
WorkingDirectory=${DATA_DIR}
Restart=always
RestartSec=5s
LimitNOFILE=65536
StandardOutput=journal
StandardError=journal

# Hardening
ProtectSystem=full
ProtectHome=true
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF

# Reload and enable service
systemctl daemon-reload
systemctl enable bugar.service
systemctl restart bugar.service

# Verify service status
sleep 2
if systemctl is-active --quiet bugar.service; then
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")
    echo ""
    echo "=========================================================="
    echo "🎉 BUGAR BERHASIL TERPASANG & AKTIF DI ODROID-C2!"
    echo "=========================================================="
    echo " Akses Dashboard UI via browser:"
    echo " 👉 http://${LOCAL_IP}:${DEFAULT_PORT}"
    echo " 👉 http://localhost:${DEFAULT_PORT}"
    echo ""
    echo " Status Service:  sudo systemctl status bugar"
    echo " Log Real-time:   sudo journalctl -u bugar -f"
    echo " File Database:   ${DATA_DIR}/bugar.db"
    echo "=========================================================="
else
    echo "⚠️ Service terpasang tetapi belum aktif. Periksa log: journalctl -u bugar -e"
fi
