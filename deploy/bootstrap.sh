#!/usr/bin/env bash
# One-time setup for a fresh Ubuntu 24.04 server.
#   scp deploy/bootstrap.sh root@SERVER_IP:/tmp/ && ssh root@SERVER_IP bash /tmp/bootstrap.sh
# Idempotent: safe to re-run.
set -euo pipefail

NODE_MAJOR=22
APP_USER=valueswitch
APP_DIR=/opt/valueswitch

echo "==> Packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates gnupg rsync ufw debian-keyring debian-archive-keyring apt-transport-https

echo "==> Node ${NODE_MAJOR}"
if ! command -v node >/dev/null || [[ "$(node -v)" != v${NODE_MAJOR}* ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y -qq nodejs
fi
node -v

echo "==> Caddy"
if ! command -v caddy >/dev/null; then
  curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt \
    | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  apt-get update -qq
  apt-get install -y -qq caddy
fi

echo "==> App user and directories"
# The same account runs the app and receives deploys over SSH, so it needs
# a real shell. "current" is deliberately NOT created: the deploy replaces
# it as a symlink, and mv -T refuses to overwrite an existing directory.
id -u "$APP_USER" >/dev/null 2>&1 || useradd --create-home --shell /bin/bash "$APP_USER"
usermod --shell /bin/bash "$APP_USER"
mkdir -p "$APP_DIR/releases"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
install -o "$APP_USER" -g "$APP_USER" -m 700 -d "/home/$APP_USER/.ssh"
touch "/home/$APP_USER/.ssh/authorized_keys"
chown "$APP_USER:$APP_USER" "/home/$APP_USER/.ssh/authorized_keys"
chmod 600 "/home/$APP_USER/.ssh/authorized_keys"

echo "==> Restart permission for the deploy user"
# Deploys restart the service; nothing else is granted.
cat > /etc/sudoers.d/valueswitch-deploy <<'SUDOEOF'
valueswitch ALL=(root) NOPASSWD: /usr/bin/systemctl restart valueswitch, /usr/bin/systemctl status valueswitch, /usr/bin/systemctl is-active valueswitch
SUDOEOF
chmod 440 /etc/sudoers.d/valueswitch-deploy
visudo -cf /etc/sudoers.d/valueswitch-deploy

echo "==> Secrets file"
if [[ ! -f /etc/valueswitch.env ]]; then
  cat > /etc/valueswitch.env <<'ENVEOF'
# Copy each value from Vercel → Settings → Environment Variables.
# Format: KEY=value (no quotes, no "export").
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://www.valueswitch.co.uk
CRON_SECRET=
AWIN_PUBLISHER_ID=
AWIN_API_TOKEN=
AWIN_COMBINED_FEED_URL=
AWIN_VODAFONE_FEED_URL=
AWIN_FONEHOUSE_FEED_URL=
AWIN_FONEHOUSE_MID=
EMAIL_FROM=
RESEND_API_KEY=
GOOGLE_SITE_VERIFICATION=
ENVEOF
  echo "   created /etc/valueswitch.env — fill it in before starting the service"
fi
chmod 600 /etc/valueswitch.env
chown root:root /etc/valueswitch.env

echo "==> Firewall"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp  >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null
ufw status | head -5

echo "==> Unattended security updates"
apt-get install -y -qq unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> Log file for cron output"
touch /var/log/valueswitch-cron.log
chown "$APP_USER:$APP_USER" /var/log/valueswitch-cron.log

echo
echo "Bootstrap complete. Next:"
echo "  1. Fill in /etc/valueswitch.env"
echo "  2. Copy deploy/valueswitch.service to /etc/systemd/system/ and run: systemctl daemon-reload && systemctl enable valueswitch"
echo "  3. Copy deploy/Caddyfile to /etc/caddy/Caddyfile and run: systemctl reload caddy"
echo "  4. Install the cron jobs: crontab -u ${APP_USER} /path/to/deploy/crontab"
echo "  5. Add the deploy key to /home/${APP_USER}/.ssh/authorized_keys"
echo "  6. Push to main — GitHub Actions will build and deploy."
