# Moving ValueSwitch off Vercel onto a VPS

Why: Vercel Pro costs £18/month (plus VAT) for capacity this site barely
touches — October's real usage was $1.07 of the $20 included credit. A
small VPS runs the same site for about £4/month. Neon stays as it is.

**Cost after the move:** ~£4 server + ~£3 Neon = **~£7/month**, down from ~£21.

---

## What only you can do

These need your card, your accounts or your passwords.

### 1. Create the server

[hetzner.com/cloud](https://www.hetzner.com/cloud) → sign up → New Project
→ Add Server:

| Setting | Choose |
|---|---|
| Location | Falkenstein or Helsinki (closest to UK with best price) |
| Image | **Ubuntu 24.04** |
| Type | **CX22** — 2 vCPU, 4 GB RAM (€3.79/month) |
| Networking | IPv4 + IPv6 |
| SSH key | Paste the public key from step 2 |

4 GB matters: the weekly Fonehouse import peaks around 1.5 GB.

### 2. Create a deploy key

On your machine:

```
ssh-keygen -t ed25519 -C "valueswitch-deploy" -f ~/.ssh/valueswitch_deploy -N ""
```

- `~/.ssh/valueswitch_deploy.pub` → paste into Hetzner's SSH key box (step 1)
- `~/.ssh/valueswitch_deploy` (the private one) → GitHub secret in step 4

### 3. Point DNS at the server

At your domain registrar, change the records for `valueswitch.co.uk`:

| Type | Name | Value |
|---|---|---|
| A | `@` | the server's IPv4 |
| A | `www` | the server's IPv4 |

Do this **after** the server answers on HTTP, or Caddy can't get a
certificate. Leave Vercel running until then — DNS is the actual cutover.

### 4. Add GitHub secrets

Repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
|---|---|
| `SSH_HOST` | server IPv4 |
| `SSH_USER` | `valueswitch` |
| `SSH_KEY` | contents of `~/.ssh/valueswitch_deploy` (private key, whole file) |
| `SSH_KNOWN_HOSTS` | output of `ssh-keyscan -H <server-ip>` |

### 5. Copy the environment variables

Every value in Vercel → value-switch → Settings → Environment Variables
goes into `/etc/valueswitch.env` on the server. `bootstrap.sh` creates
that file with the keys listed and blank values. **I never see these** —
`DATABASE_URL` and `AWIN_COMBINED_FEED_URL` in particular contain
credentials.

Change `NEXTAUTH_URL` to `https://www.valueswitch.co.uk` (no trailing slash).

---

## Server setup (once)

```
scp deploy/bootstrap.sh root@SERVER_IP:/tmp/
ssh root@SERVER_IP bash /tmp/bootstrap.sh
```

Installs Node 22, Caddy, the app user, a firewall and automatic security
updates. Then:

```
# secrets
ssh root@SERVER_IP nano /etc/valueswitch.env

# deploy key for GitHub Actions
ssh root@SERVER_IP "cat >> /home/valueswitch/.ssh/authorized_keys" < ~/.ssh/valueswitch_deploy.pub

# service, proxy, crons
scp deploy/valueswitch.service root@SERVER_IP:/etc/systemd/system/
scp deploy/Caddyfile root@SERVER_IP:/etc/caddy/Caddyfile
scp deploy/crontab root@SERVER_IP:/tmp/
ssh root@SERVER_IP 'systemctl daemon-reload && systemctl enable valueswitch && systemctl reload caddy && crontab -u valueswitch /tmp/crontab'
```

Then push to `main` (or run the workflow by hand) and GitHub Actions
builds and ships the first release.

---

## How a deploy works

1. GitHub Actions builds on Ubuntu — **this matters**: Prisma compiles a
   platform-specific query engine, and a Windows build ships a `.dll` the
   server cannot load.
2. The standalone bundle is rsynced to `/opt/valueswitch/releases/<stamp>/`.
3. The previous `.next/cache` is carried over, so a deploy doesn't throw
   away the page cache and hammer the database afterwards.
4. `current` is re-pointed and the service restarted — the swap is atomic.
5. The workflow polls `/api/health/db`; if it doesn't go healthy within
   two minutes it **rolls back to the previous release automatically**.
6. The last five releases are kept for manual rollback.

Manual rollback:

```
ssh valueswitch@SERVER_IP
cd /opt/valueswitch && ls -1dt releases/*/     # pick one
ln -sfn releases/<stamp> current-new && mv -Tf current-new current
sudo systemctl restart valueswitch
```

---

## What changes, and what doesn't

| | Vercel | VPS |
|---|---|---|
| Page caching (ISR) | Edge network | Same `revalidate` values, cached on disk |
| Cron jobs | `vercel.json` | system cron, same three jobs and times |
| Images | Vercel optimizer | Next's own optimizer via `sharp` |
| Long imports | 300s function cap | no cap |
| TLS | automatic | automatic (Caddy) |
| CDN | built in | optional: Cloudflare in front, free |

`vercel.json` stays in the repo for now — harmless, and it means we can
go back to Vercel quickly if the VPS turns out to be a mistake.

---

## After it's verified

Only once the new server has served real traffic for a few days:

1. Vercel → Settings → Billing → **Downgrade** to Hobby (or delete the project).
2. You've already paid to 2 November, so there's no rush and no refund to chase.

## What you take on

No platform support. Security updates install themselves, but Node
upgrades, disk space and any outage are yours to handle. Hetzner's
snapshots are about €0.50/month for a weekly image — worth it.
