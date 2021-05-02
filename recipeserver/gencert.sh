#!/bin/bash
set -e
set -x

openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem

#openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
