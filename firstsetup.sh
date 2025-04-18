#!/bin/sh

set -a
. ./.env
set +a
username="js2oyb@gmail.com"
formatted_mac=$(echo "$DEVICEID" | tr -d ':' | tr 'a-f' 'A-F')
npm install switchbot-get-encryption-key
# npx switchbot-get-encryption-key "$formatted_mac" "$username" JS2DNU@jarl
output=$(npx switchbot-get-encryption-key "$formatted_mac" "$username" JS2DNU@jarl)
key_id=$(echo "$output" | grep "Key ID:" | awk '{print $3}')
encryption_key=$(echo "$output" | grep "Encryption key:" | awk '{print $3}')
echo "KEY=$key_id" >> ./.env
echo "ENC=$encryption_key" >> ./.env
