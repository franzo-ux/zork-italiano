#!/usr/bin/env sh
set -eu
image=zork-italiano-zilf
docker build -t "$image" -f tools/zilf.Dockerfile .
docker run --rm -v "$PWD/source/zork-it:/game" -w /game "$image" zork1.zil
