Vagrant.configure("2") do |config|
  # Load environment variables from .env
  env_vars = {}
  env_file = File.expand_path(".env", File.dirname(__FILE__))

  if File.exist?(env_file)
    File.foreach(env_file) do |line|
      match = line.match(/^(?<key>\w+)=(?<value>.*)$/)
      env_vars[match[:key]] = match[:value].strip if match
    end
  else
    puts "WARNING: Missing .env file! Using default fallback values."
    env_vars = {
      "GATEWAY_PORT"       => "3001",
      "INVENTORY_PORT"     => "8080",
      "BILLING_PORT"       => "8081",
      "INVENTORY_API_URL"  => "http://192.168.56.10:8080",
      "INVENTORY_DB_NAME"  => "movies",
      "INVENTORY_DB_USER"  => "postgres",
      "INVENTORY_DB_PASS"  => "postgres",
      "INVENTORY_DB_HOST"  => "localhost",
      "INVENTORY_DB_PORT"  => "5432",
      "BILLING_DB_NAME"    => "orders",
      "BILLING_DB_USER"    => "postgres",
      "BILLING_DB_PASS"    => "postgres",
      "BILLING_DB_HOST"    => "localhost",
      "BILLING_DB_PORT"    => "5432",
      "RABBITMQ_URL"       => "amqp://localhost:5672",
      "BILLING_QUEUE"      => "billing_queue"
    }
  end

  # ====================================================
  # GATEWAY-VM
  # ====================================================
  config.vm.define "gateway-vm" do |gw|
    gw.vm.box = "ubuntu/focal64"
    gw.vm.hostname = "gateway-vm"
    gw.vm.network "private_network", ip: "192.168.56.12"

    # Forward the gateway port to host (optional if you want direct access)
    gw.vm.network "forwarded_port", guest: env_vars["GATEWAY_PORT"], host: 3000

    gw.vm.provision "shell", inline: <<-SHELL
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
    SHELL
  end

  # ====================================================
  # INVENTORY-VM
  # ====================================================
  config.vm.define "inventory-vm" do |inv|
    inv.vm.box = "ubuntu/focal64"
    inv.vm.hostname = "inventory-vm"
    inv.vm.network "private_network", ip: "192.168.56.10"
    inv.vm.network "forwarded_port", guest: env_vars["INVENTORY_PORT"], host: 8080

    inv.vm.provision "shell", inline: <<-SHELL
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

      #  Force PostgreSQL to allow password-based login (trust) before setting password
      echo "host all all 127.0.0.1/32 trust" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
      echo "host all all ::1/128 trust" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf

      sudo systemctl restart postgresql

      #  Create the database **first**
      sudo -u postgres psql -c "CREATE DATABASE #{env_vars["INVENTORY_DB_NAME"]};" 2>/dev/null || true

      #  Then, create the user and set password
      sudo -u postgres psql -c "CREATE USER #{env_vars["INVENTORY_DB_USER"]} WITH PASSWORD '#{env_vars["INVENTORY_DB_PASS"]}';" 2>/dev/null || true

      #  Grant privileges to user **after the database exists**
      sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE #{env_vars["INVENTORY_DB_NAME"]} TO #{env_vars["INVENTORY_DB_USER"]};"

      #  Now set the password for 'postgres' superuser from env
      sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '#{env_vars["INVENTORY_DB_PASS"]}';"

      #  Now switch back to password authentication (md5)
      sudo sed -i "s/trust/md5/g" /etc/postgresql/12/main/pg_hba.conf
      sudo sed -i "s/peer/md5/g" /etc/postgresql/12/main/pg_hba.conf
      sudo sed -i "s/ident/md5/g" /etc/postgresql/12/main/pg_hba.conf

      sudo systemctl restart postgresql


      # Install dependencies for inventory-app
      cd /vagrant/srcs/inventory-app
      npm install

      # Start Inventory with PM2
      pm2 start server.js --name inventory_app
      pm2 save

      sudo pm2 startup systemd -u vagrant --hp /home/vagrant
    SHELL
  end

  # ====================================================
  # BILLING-VM
  # ====================================================
  config.vm.define "billing-vm" do |bill|
    bill.vm.box = "ubuntu/focal64"
    bill.vm.hostname = "billing-vm"
    bill.vm.network "private_network", ip: "192.168.56.11"
    bill.vm.network "forwarded_port", guest: env_vars["BILLING_PORT"], host: 8081

    bill.vm.provision "shell", inline: <<-SHELL
      export DEBIAN_FRONTEND=noninteractive
      export RABBITMQ_USER="moviestar"
      export RABBITMQ_PASS="supersecurepassword"

      # Update & install packages
      sudo apt-get update -yq
      sudo apt-get install -yq curl git postgresql postgresql-contrib rabbitmq-server

      # Update & install packages
      sudo apt-get update -yq
      sudo apt-get install -yq curl git postgresql postgresql-contrib rabbitmq-server

      # Enable & start RabbitMQ
      sudo systemctl enable rabbitmq-server
      sudo systemctl start rabbitmq-server

      # Wait a few seconds for RabbitMQ to fully start
      sleep 5

      # Delete existing RabbitMQ user if it exists
      sudo rabbitmqctl delete_user $RABBITMQ_USER 2>/dev/null || true

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

    #  Force PostgreSQL to allow password-based login (trust) before setting password
    echo "host all all 127.0.0.1/32 trust" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
    echo "host all all ::1/128 trust" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf

    sudo systemctl restart postgresql

    #  Create the database **first**
    sudo -u postgres psql -c "CREATE DATABASE #{env_vars["BILLING_DB_NAME"]};" 2>/dev/null || true

    #  Then, create the user and set password
    sudo -u postgres psql -c "CREATE USER #{env_vars["BILLING_DB_USER"]} WITH PASSWORD '#{env_vars["BILLING_DB_PASS"]}';" 2>/dev/null || true

    #  Grant privileges to user **after the database exists**
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE #{env_vars["BILLING_DB_NAME"]} TO #{env_vars["BILLING_DB_USER"]};"

    #  Now set the password for 'postgres' superuser from env
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '#{env_vars["BILLING_DB_PASS"]}';"

    #  Now switch back to password authentication (md5)
    sudo sed -i "s/trust/md5/g" /etc/postgresql/12/main/pg_hba.conf
    sudo sed -i "s/peer/md5/g" /etc/postgresql/12/main/pg_hba.conf
    sudo sed -i "s/ident/md5/g" /etc/postgresql/12/main/pg_hba.conf

    sudo systemctl restart postgresql


      # Install dependencies for billing-app
      cd /vagrant/srcs/billing-app
      npm install

      # Start Billing with PM2
      pm2 start server.js --name billing_app
      pm2 save

      sudo pm2 startup systemd -u vagrant --hp /home/vagrant
    SHELL
  end
end
