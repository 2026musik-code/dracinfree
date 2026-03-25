# DracinFree Installation Guide

This guide will help you deploy the DracinFree application to an Ubuntu VPS.

## Prerequisites
- An Ubuntu VPS (20.04 or 22.04 recommended)
- A domain name pointing to your VPS IP address

## Installation
1. Log in to your VPS via SSH.
2. Clone the repository:
   ```bash
   git clone https://github.com/2026musik-code/dracinfree /var/www/dracinfree
   cd /var/www/dracinfree
   ```
3. Make the deployment script executable and run it:
   ```bash
   chmod +x deploy.sh
   sudo ./deploy.sh
   ```
4. Follow the prompts to enter your domain name.

## Updating the Application
To update the application to the latest version from GitHub, run the provided update script:
```bash
sudo /var/www/dracinfree/update.sh
```
