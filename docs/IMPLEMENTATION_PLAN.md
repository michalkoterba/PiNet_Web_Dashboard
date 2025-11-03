# Implementation Plan: PiNet Web Dashboard (v1.3)

This document outlines the development and implementation steps for the PiNet Web Dashboard project, incorporating best practices for a clean and scalable project structure.

---

## Phase 1: Project Setup & Configuration

- [x] **Project Structure:**
    - [x] Create the main project directory: `PiNet_Web_Dashboard`.
    - [x] Establish the following file and directory structure:
        ```
        /PiNet_Web_Dashboard
        |-- /data
        |   |-- hosts.json          <-- Host data file
        |-- /docs
        |   |-- SRS.md
        |   |-- PiNet_API/
        |   |-- sample.BRC_hosts.json
        |   |-- IMPLEMENTATION_PLAN.md  <-- This file
        |-- /src
        |   |-- /pinet_web_dashboard
        |       |-- __init__.py
        |       |-- main.py
        |       |-- /clients
        |       |   |-- __init__.py       <-- Makes 'clients' a package
        |       |   |-- pinet_client.py   <-- API client module
        |       |-- /static
        |       |   |-- /css/style.css
        |       |   |-- /js/app.js
        |       |-- /templates
        |           |-- index.html
        |           |-- error.html
        |-- .gitignore
        |-- Dockerfile
        |-- requirements.txt
        |-- README.md
        |-- .env
        ```

- [x] **Virtual Environment:**
    - [x] Initialize and activate a Python virtual environment.

- [x] **Dependencies (`requirements.txt`):**
    - [x] Create `requirements.txt` with `Flask`, `python-dotenv`, and `requests`.
    - [x] Install dependencies: `pip install -r requirements.txt`.

- [x] **Configuration (`.env`):**
    - [x] Create `.env` file in the project root for `PINET_API_URL` and `PINET_API_KEY`.

- [x] **Source Code Placement:**
    - [x] Create the `src/pinet_web_dashboard/clients` directory and add an empty `__init__.py` file.
    - [x] Move `pinet_client.py` from `docs/PiNet_API` to `src/pinet_web_dashboard/clients/`.

- [x] **Data File Placement:**
    - [x] Create the top-level `data/` directory.
    - [x] Copy `docs/sample.BRC_hosts.json` to `data/hosts.json`.

- [x] **`.gitignore`:**
    - [x] Create a `.gitignore` file to exclude `venv/`, `__pycache__/`, and `.env`.

---

## Phase 2: Backend Development (Flask)

- [x] **Flask App Setup (`src/pinet_web_dashboard/main.py`):**
    - [x] Import `Flask`, `os`, `json`.
    - [x] Import the client: `from pinet_web_dashboard.clients.pinet_client import PiNetClient`.
    - [x] Load environment variables from `.env`.
    - [x] Initialize the Flask app and the `PiNetClient`.

- [x] **Host Data Loading (SRS R1):**
    - [x] In `main.py`, implement a function to read `data/hosts.json`. The path must be resolved correctly from the application's run location.
    - [x] Handle `FileNotFoundError` and `json.JSONDecodeError` by rendering `error.html` (R1.3).

- [x] **Main Dashboard Route (`/`) (SRS R2):**
    - [x] Create a `/` route that renders `index.html`, passing the list of hosts.

- [x] **API Routes (SRS R3 & R4):**
    - [x] **`/api/status/<ip_address>` (GET):**
        - [x] Create the endpoint to accept an IP address.
        - [x] Use the `pinet_client` instance to call `is_host_online()`.
        - [x] Return JSON: `{"status": "online"}` or `{"status": "offline"}`.
    - [x] **`/api/wake/<mac_address>` (POST):**
        - [x] Create the endpoint to accept a MAC address.
        - [x] Use the `pinet_client` instance to call `wake_host()`.
        - [x] Return JSON: `{"status": "success"}`.

- [x] **Error Handling (SRS R7):**
    - [x] Implement a startup check to ensure the PiNet API is reachable.
    - [x] Render `error.html` for critical errors (e.g., config missing, API connection failure).

---

## Phase 3: Frontend Development (HTML, CSS, JavaScript)

- [x] **`index.html` Template:**
    - [x] Use Bootstrap 5 for layout.
    - [x] Use a Jinja2 loop to render hosts, each with `data-ip` and `data-mac` attributes.
    - [x] Add a status placeholder ("checking...") and a hidden "Wake Up" button for each host.

- [x] **`app.js` (`static/js/app.js`):**
    - [x] **On Page Load (Status Check):**
        - [x] For each host, make an AJAX call to `/api/status/<ip>`.
        - [x] Update UI based on the response (show "Online" or "Offline" with "Wake Up" button) (R3.4).
    - [x] **"Wake Up" Button Click Handler:**
        - [x] Add a click event listener to the "Wake Up" buttons.
        - [x] On click, show a "waking up..." status.
        - [x] Make a `POST` request to `/api/wake/<mac>`.
        - [x] On success, trigger the polling function.
    - [x] **Polling Mechanism (SRS R5):**
        - [x] Create a function to poll `/api/status/<ip>` every 10 seconds for a maximum of 2 minutes.
        - [x] If host comes online, stop polling and update UI to "Online".
        - [x] If host is still offline after 2 minutes, stop polling and show a "Wake up failed" message.

- [x] **`style.css` (`static/css/style.css`):**
    - [x] Add custom styles for status icons (green/red), spinners, and messages.

---

## Phase 4: Docker & Deployment

- [x] **`Dockerfile`:**
    - [x] Create a `Dockerfile` using a `python:3.9-slim` base image.
    - [x] Add `COPY` instructions for `pyproject.toml`, the `src/` directory, and the `data/` directory.
    - [x] Install dependencies via `pip install -e .`.
    - [x] Set the `CMD` to run the app with `gunicorn`.

- [x] **Deployment:**
    - [x] Create `docker-compose.yaml` for standard deployment.
    - [x] Create `docker-compose.tailscale.yaml` for secure Tailnet deployment.

---

## Phase 5: Documentation & Finalization

- [x] **`README.md`:**
    - [x] Write a comprehensive `README.md` with setup, configuration, and run instructions.

- [x] **`.env.example`:**
    - [x] Create and document all required and optional environment variables.

- [x] **Testing:**
    - [x] Test all features, including status checking, wake-up calls, and polling.
    - [x] Test error handling for missing files, bad configuration, and API connection issues.
