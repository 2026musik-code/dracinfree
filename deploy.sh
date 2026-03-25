#!/bin/bash
# Deployment script for Ubuntu VPS

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js, Nginx, Certbot
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git pm2

# 3. Setup project directory
# Assuming the user clones the repo first
# git clone https://github.com/2026musik-code/dracinfree /var/www/dracinfree
# cd /var/www/dracinfree

# 4. Install dependencies
npm install

# 5. Setup PM2
pm2 start server.js --name dracinfree
pm2 save
pm2 startup

# 6. Setup Nginx
echo "Enter your domain name:"
read DOMAIN
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

sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 7. Setup SSL
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN

# 8. Create update script
cat << 'EOF' > /var/www/dracinfree/update.sh
#!/bin/bash
cd /var/www/dracinfree
git pull origin main
npm install
pm2 restart dracinfree
echo "Web updated successfully!"
EOF
chmod +x /var/www/dracinfree/update.sh
