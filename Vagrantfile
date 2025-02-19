# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # ----------------------------------------------------------------------------
  # 1) Load environment variables from .env (OR fallback to defaults)
  # ----------------------------------------------------------------------------
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

  # ----------------------------------------------------------------------------
  # 2) GATEWAY-VM
  # ----------------------------------------------------------------------------
  config.vm.define "gateway-vm" do |gw|
    gw.vm.box = "ubuntu/focal64"
    gw.vm.hostname = "gateway-vm"
    gw.vm.network "private_network", ip: "192.168.56.12"
    gw.vm.network "forwarded_port", guest: env_vars["GATEWAY_PORT"], host: 3000

    gw.vm.provision "shell",
      path: "scripts/gateway_setup.sh",
      env: env_vars
  end

  # ----------------------------------------------------------------------------
  # 3) INVENTORY-VM
  # ----------------------------------------------------------------------------
  config.vm.define "inventory-vm" do |inv|
    inv.vm.box = "ubuntu/focal64"
    inv.vm.hostname = "inventory-vm"
    inv.vm.network "private_network", ip: "192.168.56.10"
    inv.vm.network "forwarded_port", guest: env_vars["INVENTORY_PORT"], host: 8080

    inv.vm.provision "shell",
      path: "scripts/inventory_setup.sh",
      env: env_vars
  end

  # ----------------------------------------------------------------------------
  # 4) BILLING-VM
  # ----------------------------------------------------------------------------
  config.vm.define "billing-vm" do |bill|
    bill.vm.box = "ubuntu/focal64"
    bill.vm.hostname = "billing-vm"
    bill.vm.network "private_network", ip: "192.168.56.11"
    bill.vm.network "forwarded_port", guest: env_vars["BILLING_PORT"], host: 8081

    bill.vm.provision "shell",
      path: "scripts/billing_setup.sh",
      env: env_vars
  end
end
