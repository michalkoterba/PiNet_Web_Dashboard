# PiNet Web Dashboard

A simple, dynamic web dashboard to monitor the online status of network hosts and send Wake-on-LAN (WoL) packets via the [PiNet API](https://github.com/michalkoterba/PiNet_API).

This application provides a user-friendly interface to see which machines on your network are online and allows you to wake them up with a single click.

![Dashboard Screenshot](docs/screenshot.png) <!--- You will need to add a screenshot here! -->

---

## Features

*   **Dynamic Host Loading:** Automatically loads all hosts from a simple `hosts.json` file.
*   **Real-time Status:** Checks and displays the online/offline status of each host on page load.
*   **Wake-on-LAN:** Provides a "Wake Up" button for any host that is offline.
*   **Automatic Polling:** After a wake-up attempt, the dashboard polls the host for 2 minutes to see if it comes online.
*   **Graceful Error Handling:** Displays clear, user-friendly alerts for configuration issues (e.g., bad API key, missing files).
*   **Containerized:** Fully containerized with Docker for easy and repeatable deployments.
*   **Tailscale Integration:** Includes a `docker-compose` file for easy and secure deployment on a private Tailscale network.

## Project Structure

This project follows modern Python packaging standards with a `src` layout.

```
/PiNet_Web_Dashboard
|-- /data
|   |-- hosts.json              <-- Your host definitions
|   |-- hosts.json.example
|-- /src
|   |-- /pinet_web_dashboard      <-- Main application package
|       |-- /clients              <-- Client for external APIs
|       |-- /static               <-- CSS/JS assets
|       |-- /templates            <-- HTML templates
|       |-- main.py               <-- Flask application logic
|-- .env                        <-- Your local environment secrets (ignored by git)
|-- .env.example                <-- Example environment file
|-- Dockerfile                  <-- For building the production container
|-- docker-compose.yaml         <-- For standard local deployment
|-- docker-compose.tailscale.yaml <-- For secure deployment on a Tailnet
|-- pyproject.toml              <-- Project definition and dependencies
|-- README.md                   <-- This file
```

---

## Setup & Installation

**Prerequisites:**
*   Python 3.8+
*   A running instance of the [PiNet API](https://github.com/michalkoterba/PiNet_API) on your network.
*   Docker & Docker Compose (for containerized deployment).

**1. Clone the repository:**
```sh
git clone <your-repo-url>
cd PiNet_Web_Dashboard
```

**2. Create a virtual environment:**
```sh
python -m venv .venv
source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`
```

**3. Install the project in editable mode:**

This is the most important step. It installs all dependencies and correctly registers your `pinet_web_dashboard` package with the virtual environment.
```sh
pip install -e .
```

**4. Configure your environment:**

*   Copy the `.env.example` file to `.env`.
*   Edit the `.env` file with the URL and API Key for your PiNet API instance.

**5. Configure your hosts:**

*   Copy the `data/hosts.json.example` file to `data/hosts.json`.
*   Edit `data/hosts.json` to define the hosts on your network.

---

## Running the Application

### For Development

To run the local Flask development server:

```sh
# Make sure your virtual environment is activated
python -m pinet_web_dashboard.main
```

The application will be available at `http://127.0.0.1:5001`.

### For Production (Docker)

There are two recommended ways to deploy the application using Docker.

**Option 1: Standard Local Deployment**

This method builds the container and exposes the dashboard on port 80 of the host machine.

```sh
# This will build the image and start the container in the background
docker-compose up --build -d
```
The dashboard will be available at `http://<your-docker-host-ip>`.

**Option 2: Secure Tailscale Deployment**

This method exposes the dashboard *only* on your private Tailscale network, without opening any public ports.

1.  **Get a Tailscale Auth Key:** Go to your [Tailscale Admin Console](https://login.tailscale.com/admin/settings/keys) -> "Auth keys" and generate an ephemeral auth key.
2.  **Update your `.env` file:** Add the `TS_AUTHKEY` variable with the key you just generated.
3.  **Run Docker Compose:**

```sh
# Use the tailscale-specific compose file
docker-compose -f docker-compose.tailscale.yaml up --build -d
```

The dashboard will become available on your Tailnet at the machine name you defined (e.g., `http://pinet-web-dashboard`).
