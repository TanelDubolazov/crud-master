set -e

export DEBIAN_FRONTEND=noninteractive

# Basic packages
sudo apt-get update -yq
sudo apt-get install -yq curl git

# Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -yq nodejs

# Update npm & install PM2 globally
sudo npm install -g npm@latest
sudo npm install -g pm2@latest

# Install dependencies & run gateway
cd /vagrant/srcs/api-gateway
npm install

# Start gateway with PM2
pm2 start server.js --name gateway_app
pm2 save

# Enable PM2 startup
sudo pm2 startup systemd -u vagrant --hp /home/vagrant
