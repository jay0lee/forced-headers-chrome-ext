#!/bin/bash
# Optimized Chrome Extension ID generator

in_file="$1"

if [[ ! -f "$in_file" ]]; then
  echo "ERROR: File ${in_file} does not exist"
  exit 1
fi

# Check for openssl dependency
command -v openssl >/dev/null 2>&1 || { echo "Error: openssl required." >&2; exit 1; }

# 1. Extract Public Key in DER format
# 2. SHA-256 hash it
# 3. Take the first 32 hex characters
# 4. Translate 0-f to a-p
id=$(openssl rsa -in "$in_file" -pubout -outform DER 2>/dev/null | 
     openssl dgst -sha256 | 
     sed 's/.*= //' | 
     head -c 32 | 
     tr '0-9a-f' 'a-p')

echo "$id"
