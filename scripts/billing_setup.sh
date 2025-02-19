set -e

export DEBIAN_FRONTEND=noninteractive
export RABBITMQ_USER="moviestar"
export RABBITMQ_PASS="supersecurepassword"

# Update & install packages
sudo apt-get update -yq
sudo apt-get install -yq curl git postgresql postgresql-contrib rabbitmq-server

# Enable & start RabbitMQ
sudo systemctl enable rabbitmq-server
sudo systemctl start rabbitmq-server

# Wait a few seconds for RabbitMQ to fully start
sleep 5

# Delete existing RabbitMQ user if it exists
sudo rabbitmqctl delete_user "$RABBITMQ_USER" 2>/dev/null || true

# Create new RabbitMQ user
sudo rabbitmqctl add_user "$RABBITMQ_USER" "$RABBITMQ_PASS"

# Set administrator permissions for the user
sudo rabbitmqctl set_user_tags "$RABBITMQ_USER" administrator
sudo rabbitmqctl set_permissions -p / "$RABBITMQ_USER" ".*" ".*" ".*"

# Restart RabbitMQ to apply changes
sudo systemctl restart rabbitmq-server

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
sudo -u postgres psql -c "CREATE DATABASE ${BILLING_DB_NAME};" 2>/dev/null || true

# Create the user and set password
sudo -u postgres psql -c "CREATE USER ${BILLING_DB_USER} WITH PASSWORD '${BILLING_DB_PASS}';" 2>/dev/null || true

# Grant privileges to user
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${BILLING_DB_NAME} TO ${BILLING_DB_USER};"

# Set the password for 'postgres' superuser
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '${BILLING_DB_PASS}';"

# Switch back to password authentication (md5)
sudo sed -i "s/trust/md5/g" /etc/postgresql/12/main/pg_hba.conf
sudo sed -i "s/peer/md5/g"  /etc/postgresql/12/main/pg_hba.conf
sudo sed -i "s/ident/md5/g" /etc/postgresql/12/main/pg_hba.conf

sudo systemctl restart postgresql

# Install dependencies for billing-app
cd /vagrant/srcs/billing-app
npm install

# Start Billing with PM2
pm2 start server.js --name billing_app
pm2 save

sudo pm2 startup systemd -u vagrant --hp /home/vagrant
