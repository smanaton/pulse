#!/usr/bin/env node
// Generate a PKCS#8 RSA private key suitable for JWT signing (RS256)
import { generateKeyPairSync } from "node:crypto";

const { privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicExponent: 0x10001,
});

const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
process.stdout.write(pem);
