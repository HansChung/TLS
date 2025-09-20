#!/bin/bash

# Certificate generation script for development
# This script creates self-signed certificates for testing purposes only

CERTS_DIR="./certs"
DAYS=365

# Create certs directory if it doesn't exist
mkdir -p "$CERTS_DIR"

echo "Generating TLS certificates for development..."

# Generate private key
echo "Generating private key..."
openssl genrsa -out "$CERTS_DIR/server.key" 2048

# Generate certificate signing request
echo "Generating certificate signing request..."
openssl req -new -key "$CERTS_DIR/server.key" -out "$CERTS_DIR/server.csr" -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate self-signed certificate
echo "Generating self-signed certificate..."
openssl x509 -req -in "$CERTS_DIR/server.csr" -signkey "$CERTS_DIR/server.key" -out "$CERTS_DIR/server.crt" -days "$DAYS"

# Generate client certificates (optional)
echo "Generating client private key..."
openssl genrsa -out "$CERTS_DIR/client.key" 2048

echo "Generating client certificate signing request..."
openssl req -new -key "$CERTS_DIR/client.key" -out "$CERTS_DIR/client.csr" -subj "/C=US/ST=State/L=City/O=Organization/CN=client"

echo "Generating client certificate..."
openssl x509 -req -in "$CERTS_DIR/client.csr" -signkey "$CERTS_DIR/client.key" -out "$CERTS_DIR/client.crt" -days "$DAYS"

# Clean up CSR files
rm "$CERTS_DIR/server.csr" "$CERTS_DIR/client.csr"

# Set appropriate permissions
chmod 600 "$CERTS_DIR"/*.key
chmod 644 "$CERTS_DIR"/*.crt

echo "Certificates generated successfully in $CERTS_DIR/"
echo "Server certificate: $CERTS_DIR/server.crt"
echo "Server private key: $CERTS_DIR/server.key"
echo "Client certificate: $CERTS_DIR/client.crt"
echo "Client private key: $CERTS_DIR/client.key"
echo ""
echo "⚠️  WARNING: These are self-signed certificates for development only!"
echo "   Do not use in production environments."