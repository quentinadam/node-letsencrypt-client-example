"use strict";

const fs = require("fs");
const co = require("co");
const express = require("express");
const childProcess = require("child_process");
const LEClient = require("letsencrypt-client");

const accountKey = fs.readFileSync("account.key");
const csr = fs.readFileSync("domain.csr");

function requestCertificate() {
    co(function*() {
        let client = new LEClient(accountKey);
        
        console.log("Registering...");
        yield client.register();
        
        let domains = parseCSR(csr);
        for (let i = 0; i < domains.length; i++) {
            let domain = domains[i];
            
            console.log("Requesting challenge for domain %s...", domain);
            let challenge = yield client.requestAuthorization(domain);
            
            responses[challenge.path] = challenge.keyAuthorization;
            
            console.log("Triggering challenge for domain %s...", domain);
            yield client.triggerChallenge(challenge);
            
            while (true) {
                console.log("Checking challenge for domain %s...", domain);
                let status = yield client.checkChallenge(challenge);
                console.log("Challenge is %s", status);
                if (status == "invalid") throw new Error("Could not verify domain " + domain);
                if (status == "valid") break;
                yield sleep(1000);
            }
        }
        
        console.log("Requesting certificate...");
        let certificate = yield client.requestCertificate(csr);
        console.log(certificate);
        
    }).catch((error) => {
        console.log(error)
    });
}

function parseCSR(csr) {
    let match;
    let text = childProcess.execSync("openssl req -noout -text", {input: csr}).toString();
    let domains = {};
    match = text.match(/Subject:.*? CN=([^\s,;\/]+)/);
    if (match) {
        let domain = match[1];
        domains[domain] = true;
    }
    match = text.match(/X509v3 Subject Alternative Name: \n +([^\n]+)\n/);
    if (match) {
        match[1].split(", ").forEach((text) => {
            if (text.substr(0, 4) == "DNS:") {
                let domain = text.substr(4);
                domains[domain] = true;
            }
        });
    }
    return Object.keys(domains);
}

function sleep(delay) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

const app = express();
const responses = {};

app.use(function(req, res, next) {
    console.log("Received %s request on hostname %s for path %s", req.method, req.hostname, req.url);
    let response = responses[req.url];
    if (response) {
        res.set("Content-type", "text/plain");
        res.send(response);
    } else {
        res.send("Express");
    }
});

let server = app.listen(80, function() {
    console.log("Express server listening on port " + server.address().port);
    requestCertificate();
});
