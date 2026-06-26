#!/bin/bash
# EC2 (Ubuntu 22.04) one-time setup script for Griffy
# Run as: sudo bash setup-ec2.sh

set -e

echo "=== Griffy EC2 Setup ==="

# System update
apt-get update -y && apt-get upgrade -y

# Install Docker
apt-get install -y ca-certificates curl gnupg lsb-release
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Install Nginx
apt-get install -y nginx certbot python3-certbot-nginx

# Install Node.js (for running scripts)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "=== Setup complete. Now: ==="
echo "1. Clone repo: git clone https://github.com/arunraina/griffy.git /var/www/griffy"
echo "2. Copy .env: cp .env.example .env && nano .env"
echo "3. Start: docker compose up -d"
echo "4. Configure Nginx: see deploy/nginx.conf"
echo "5. SSL: certbot --nginx -d griffy.in -d www.griffy.in"
