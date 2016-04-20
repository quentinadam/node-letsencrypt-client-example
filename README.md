# node-letsencrypt-client-example

Example script to illustrate how to use the [letsencrypt-client](https://www.npmjs.com/package/letsencrypt-client) package along with an [express](https://www.npmjs.com/package/express) server to request certificates from [Let's Encrypt](https://letsencrypt.org/). The code is inspired by the excellent [diafygi/acme-tiny](https://github.com/diafygi/acme-tiny) Python ACME script.

## Usage

If you have not already done so, execute the below OpenSSL commands to create an account private key, a domain private key and a certificate signing request:

Generate an account private key:
```
openssl genrsa 4096 > account.key
```

Generate a domain private key:
```
openssl genrsa 4096 > domain.key
```

Generate a certificate signing request:
```
#for a single domain
openssl req -new -sha256 -key domain.key -subj "/CN=example.com" > domain.csr

#for multiple domains (use this one if you want both www.example.com and example.com)
openssl req -new -sha256 -key domain.key -subj "/" -reqexts SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=DNS:example.com,DNS:www.example.com")) > domain.csr
```

Start the script with node:
```
node index.js
```

This will execute the following steps:
1. start an Express server listening on port 80
2. parse the domain.csr files for all the different domain names in the certificate
3. for each domain, request challenges from Let's Encrypt and configure the Express server to respond accordingly to prove ownership of the domains
4. request the certificate from Let's Encrypt, which will be outputted to the console

The output of the script should be along these lines:
```
Express server listening on port 80
Registering...
Requesting challenge for domain example.com...
Triggering challenge for domain example.com...
Checking challenge for domain example.com...
Challenge is pending
Received GET request on hostname example.com for path /.well-known/acme-challenge/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Checking challenge for domain example.com...
Challenge is valid
Requesting challenge for domain www.example.com...
Triggering challenge for domain www.example.com...
Checking challenge for domain www.example.com...
Received GET request on hostname www.example.com for path /.well-known/acme-challenge/yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
Challenge is pending
Checking challenge for domain www.example.com...
Challenge is valid
Requesting certificate...
-----BEGIN CERTIFICATE-----
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
-----END CERTIFICATE-----
```
