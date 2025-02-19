
# crud-master

This exercise focuses on setting up a microservices architecture with an API Gateway handling communication between services. It automates VM provisioning, service deployment, and testing environments through an interactive Bash script.


## Requirements

- Node.js
- PostgreSQL
- RabbitMQ
- VirtualBox
- Vagrant
- PM2
- Postman
### System Requirements

- Minimum 4GB RAM.
- 10GB available disk space.
- Processor with virtualization support enabled.

## Setup

### Quick setup
For a quick setup you can use ```setup.sh``` script in the root, which creates .env files from default values and includes all commands to setup and interact with the vm-s.

Before running the script, you need to grant execute permissions: 
```chmod +x setup_project.sh```

To start the interactive setup, simply run:
```setup.sh```

![image](/img/setup.png)

### Manuals setup

This project depends on .env files of the neccesary variables and setup. The main root folder and root folders for each of the apps in /srcs include .env.example which can be directly copied into .env files. Default values have been added in the example files for testing purposes only. 

Next step is to build the vm-s using vagrant : 
```vagrant up``` 

*Creating the vm's may take several minutes or more*

#### Helpful commands :
```vagrant status``` shows status of all vm machines 

```vagrant ssh``` add vm name to this command ssh into the selected machine

```vagrant destroy -f``` destroy all vagrant machines

```sudo pm2 status``` displays pm2 status in the machine

![image](/img/pm2status.png)

For testing endpoints you can start and stop the services in the vm\'s:

``` sudo pm2 stop ``` - make sure to add correct app at the end

```sudo pm2 start``` - this can be used to start the sevice back up

 You can choose from one of these apps to stop  : 
 `inventory_app` `gateway_app` `billing_app` 

#### Example: 
To stop the billing_app you need to ```vagrant ssh billing-vm``` and then you can use :
 
 ```sudo pm2 stop billing_app```

![image](/img/pm2stop.png)

This will stop the RabbitMQ service and even if new entry requests are made they should not be visible in the database.


## Scripts

The `/scripts` directory contains automated setup scripts for **configuring and deploying microservices** inside Vagrant VMs. Each script is responsible for installing dependencies, configuring databases, and ensuring the services run automatically using PM2.


#### 1️⃣ `/scripts/setup_billing.sh`

-   Installs **PostgreSQL**, **RabbitMQ**, and **Node.js**.
-   Configures **RabbitMQ** (creates user, sets permissions).
-   Creates **orders database** and **billing user** in PostgreSQL.
-   Installs dependencies and starts the **Billing service** with PM2.

#### 2️⃣ `/scripts/setup_gateway.sh`

-   Installs **Node.js**, **npm**, and **PM2**.
-   Installs dependencies for **API Gateway**.
-   Starts the **Gateway service** using PM2 for process management.

#### 3️⃣ `/scripts/setup_inventory.sh`

-   Installs **PostgreSQL**, **Node.js**, and **PM2**.
-   Creates **movies database** and **inventory user** in PostgreSQL.
-   Installs dependencies for the **Inventory service**.
-   Starts the **Inventory service** using PM2.



## **API Documentation Summary**

The API Gateway facilitates communication between the Inventory API and the Billing API, handling HTTP requests for movies and billing transactions. Below is an overview of the available endpoints.

### OpenAPI documenation can be accesses at:
```http
http://192.168.56.12:3001/api-docs/
```

----------

### **🎬 Movies API (`/api/movies`)**

Handles CRUD operations for managing movies in the inventory.

#### **GET `/api/movies`**

-   Retrieves a list of all movies.
-   Supports **optional filtering** by movie title (`?title=<name>`).
-   **Response:**
    -   `200 OK` – Returns a list of movies.

#### **POST `/api/movies`**

-   Creates a new movie entry.
-   **Required Fields:**
    -   `title` (string) – The movie title.
    -   `description` (string) – A short description of the movie.
-   **Response:**
    -   `201 Created` – Movie successfully created.

#### **DELETE `/api/movies`**

-   Deletes all movies from the database.
-   **Response:**
    -   `200 OK` – All movies deleted.

----------

### **🎬 Movie Details API (`/api/movies/{id}`)**

Handles operations for a **specific movie** by ID.

#### **GET `/api/movies/{id}`**

-   Retrieves details of a **single movie** by its ID.
-   **Response:**
    -   `200 OK` – Returns movie details.
    -   `404 Not Found` – Movie ID does not exist.

#### **PUT `/api/movies/{id}`**

-   Updates an **existing** movie's details.
-   **Required Fields:**
    -   `title` (string) – New title.
    -   `description` (string) – New description.
-   **Response:**
    -   `200 OK` – Successfully updated movie.
    -   `404 Not Found` – Movie ID does not exist.

#### **DELETE `/api/movies/{id}`**

-   Deletes a movie by its ID.
-   **Response:**
    -   `200 OK` – Successfully deleted movie.
    -   `404 Not Found` – Movie ID does not exist.

----------

### **💰 Billing API (`/api/billing`)**

Handles **billing transactions** via **RabbitMQ**.

#### **POST `/api/billing`**

-   Sends a **billing message** to the queue.
-   **Request Body:** (JSON object)
    -   Contains billing details (e.g., `user_id`, `number_of_items`, `total_amount`).
-   **Response:**
    -   `200 OK` – Billing request successfully queued.



## Postman Overview

A **Postman collection** is included for easy testing of the API Gateway. This collection provides pre-configured requests to interact with the **Movies API** and **Billing API**, ensuring smooth testing without manually entering URLs and request bodies.

### **Included API Requests**

#### **🎬 Movies API**

-   **Create a Movie** (`POST /api/movies`) – Adds a new movie to the database.
-   **Get All Movies** (`GET /api/movies`) – Retrieves a list of all movies.
-   **Get Movie by ID** (`GET /api/movies/{id}`) – Fetches details of a specific movie.
-   **Get Movie by Name** (`GET /api/movies?title=<name>`) – Searches for movies by title.
-   **Update a Movie** (`PUT /api/movies/{id}`) – Modifies an existing movie.
-   **Delete a Movie** (`DELETE /api/movies/{id}`) – Removes a specific movie.
-   **Delete All Movies** (`DELETE /api/movies`) – Clears the entire movie database.

#### **💰 Billing API**

-   **Send a Billing Request** (`POST /api/billing`) – Queues a billing message for processing.

### **How to Use**

1.  **Import the Collection** – Open **Postman**, go to **Import**, and upload the JSON file.
2.  **Update Environment Variables** – If needed, change the base URL/IP in **Postman’s environment settings** to match your Vagrant setup.
3.  **Run API Tests** – Select an endpoint, send a request, and view the response.

## Author
[Tanel Dubolazov](https://01.kood.tech/git/tdubolaz)

