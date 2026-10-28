# Lab — Todo

## Carried from stub (~/projects/www/Lab — deleted 2026-06-16, verify before acting)
- [ ] Setup Apache for HTTPS:// — likely done; verify silverstonesecure.com HTTPS is solid
- [ ] Daemonise Transmission (BitTorrent) Claude listener — carry forward as open

## Migration
- [ ] Init git repo for ss-landing (~/www/ss-landing/)
- [ ] Update 000-default.conf DocumentRoot → ~/www/ss-landing/ (needs sudo)
- [ ] Retire aio.silverstonesecure.com vhost (needs sudo)
- [ ] Retire je.silverstonesecure.com vhost (needs sudo)
- [ ] Move /var/www/je-preview/ → ~/www/clients/jules-electric/preview/ (needs sudo, www-data owned)
- [ ] Move ~/Public/www/acme-electric/ → ~/www/clients/acme-electric/ + update acme-dev.service
- [ ] Apache +x audit on ~/ and ~/www/ for www-data
