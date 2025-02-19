set -e 

ENV_LOCATIONS=(
    "."
    "srcs/api-gateway"
    "srcs/billing-app"
    "srcs/inventory-app"
)

ask_user() {
    local prompt="$1"
    local response
    while true; do
        read -r -p "$prompt (y/n): " response
        case "$response" in
            [yY]) return 0 ;;
            [nN]) return 1 ;;
            *) echo "Please enter 'y' or 'n'." ;;
        esac
    done
}

if ask_user "Would you like to set up default .env files for the testing environment?"; then
    echo "Generating .env files from .env.example..."
    
    for DIR in "${ENV_LOCATIONS[@]}"; do
        EXAMPLE_FILE="$DIR/.env.example"
        ENV_FILE="$DIR/.env"

        if [ -f "$EXAMPLE_FILE" ]; then
            if [ -f "$ENV_FILE" ]; then
                echo "✅ $ENV_FILE already exists. Skipping..."
            else
                cp "$EXAMPLE_FILE" "$ENV_FILE"
                echo "✅ Created $ENV_FILE from $EXAMPLE_FILE"
            fi
        else
            echo "WARNING: No .env.example found in $DIR. Skipping..."
        fi
    done

    echo -e "\n🚨 WARNING: These default .env values should only be used for testing purposes!"
    echo "Do NOT use these values in production."
    echo ".env setup complete!"
else
    echo "❌ Skipping .env setup."
fi

if ask_user "Would you like to manage the VMs using Vagrant?"; then
    while true; do
        echo -e "\n📌 **Vagrant Management Menu:**"
        echo "1️⃣  Start Vagrant (vagrant up)"
        echo "2️⃣  Show VM status (vagrant status)"
        echo "3️⃣  SSH into a VM"
        echo "4️⃣  Stop all VMs (vagrant halt)"
        echo "5️⃣  Destroy all VMs (vagrant destroy)"
        echo "6️⃣  Exit"

        read -r -p "Select an option (1-6): " choice

        case "$choice" in
            1)
                echo "🚀 Starting Vagrant... (This may take a few minutes)"
                vagrant up
                echo "✅ Vagrant startup complete!"
                ;;
            2)
                echo "📌 Checking Vagrant status... (This may take a few seconds)"
                vagrant status
                ;;
            3)
                while true; do
                    echo "🔗 Retrieving available VMs... (Please wait)"
                    vagrant status | grep "running" | awk '{print NR") "$1}'
                    
                    read -r -p "Enter the number of the VM to SSH into (or type 'b' to go back): " vm_number

                    if [[ "$vm_number" == "b" ]]; then
                        break  
                    fi

                    vm_name=$(vagrant status | grep "running" | awk '{print $1}' | sed -n "${vm_number}p")

                    if [[ -n "$vm_name" ]]; then
                        echo "🔗 Connecting to $vm_name... (Type 'logout' or 'exit' to return)"
                        vagrant ssh "$vm_name"
                        echo "🔙 You have returned to the Vagrant menu."
                    else
                        echo "Invalid selection. Please enter a valid VM number or 'b' to go back."
                    fi
                done
                ;;
            4)
                echo "🛑 Stopping all VMs... (This may take a moment)"
                vagrant halt
                echo "✅ All VMs stopped!"
                ;;
            5)
                echo "WARNING: This will delete all VMs! (This may take some time)"
                if ask_user "Are you sure you want to destroy all VMs?"; then
                    vagrant destroy -f
                    echo "🗑️  All VMs have been destroyed."
                else
                    echo "❌ Destroy cancelled."
                fi
                ;;
            6)
                echo "👋 Exiting Vagrant management."
                break
                ;;
            *)
                echo "Invalid option. Please enter a number from 1 to 6."
                ;;
        esac
    done
else
    echo "❌ Skipping Vagrant management."
fi

echo "🎯 process completed!"
