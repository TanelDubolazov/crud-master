set -e

export DEBIAN_FRONTEND=noninteractive

# Update & install packages
sudo apt-get update -yq
sudo apt-get upgrade -yq
sudo apt-get install -yq --no-install-recommends curl git postgresql postgresql-contrib

# Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -yq nodejs

# Update npm & install PM2 globally
sudo npm install -g npm@latest
sudo npm install -g pm2@latest

# Setup PostgreSQL
sudo systemctl enable postgresql
sudo systemctl restart postgresql

# Force PostgreSQL to allow password-based login before setting password
echo "host all all 127.0.0.1/32 trust" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
echo "host all all ::1/128 trust" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf

sudo systemctl restart postgresql

# Create the database
sudo -u postgres psql -c "CREATE DATABASE ${INVENTORY_DB_NAME};" 2>/dev/null || true

# Create the user and set password
sudo -u postgres psql -c "CREATE USER ${INVENTORY_DB_USER} WITH PASSWORD '${INVENTORY_DB_PASS}';" 2>/dev/null || true

# Grant privileges to user
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${INVENTORY_DB_NAME} TO ${INVENTORY_DB_USER};"

# Set the password for 'postgres' superuser
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '${INVENTORY_DB_PASS}';"

# Switch back to password authentication (md5)
sudo sed -i "s/trust/md5/g" /etc/postgresql/12/main/pg_hba.conf
sudo sed -i "s/peer/md5/g"  /etc/postgresql/12/main/pg_hba.conf
sudo sed -i "s/ident/md5/g" /etc/postgresql/12/main/pg_hba.conf

sudo systemctl restart postgresql

# Install dependencies for inventory-app
cd /vagrant/srcs/inventory-app
npm install

# Start Inventory with PM2
pm2 start server.js --name inventory_app
pm2 save

sudo pm2 startup systemd -u vagrant --hp /home/vagrant
