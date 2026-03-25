#!/bin/bash
# Deployment script for Ubuntu VPS

set -e # Exit immediately if a command exits with a non-zero status

# 1. Update system
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# 2. Install Nginx, Certbot, Git
echo "Installing Nginx, Certbot, Git..."
sudo apt install -y nginx certbot python3-certbot-nginx git

# 3. Install Node.js and npm
echo "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node installation
node -v
npm -v

# 4. Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# 5. Setup project directory
# Assuming the user clones the repo first
# cd /var/www/dracinfree

# 6. Install dependencies
echo "Installing project dependencies..."
npm install

# 7. Setup PM2
echo "Starting application with PM2..."
pm2 delete dracinfree || true
pm2 start server.js --name dracinfree
pm2 save
pm2 startup

# 8. Setup Nginx
echo "Enter your domain name:"
read DOMAIN

# Ensure Nginx directories exist
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 9. Setup SSL
echo "Setting up SSL with Certbot..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN

# 10. Create update script
echo "Creating update script..."
cat << 'EOF' > /var/www/dracinfree/update.sh
#!/bin/bash
cd /var/www/dracinfree
git pull origin main
npm install
pm2 restart dracinfree
echo "Web updated successfully!"
EOF
chmod +x /var/www/dracinfree/update.sh

echo "Deployment completed successfully!"
