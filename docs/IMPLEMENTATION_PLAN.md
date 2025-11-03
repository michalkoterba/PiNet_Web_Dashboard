# Implementation Plan: PiNet Web Dashboard (v1.3)

This document outlines the development and implementation steps for the PiNet Web Dashboard project, incorporating best practices for a clean and scalable project structure.

---

## Phase 1: Project Setup & Configuration

- [ ] **Project Structure:**
    - [ ] Create the main project directory: `PiNet_Web_Dashboard`.
    - [ ] Establish the following file and directory structure:
        ```
        /PiNet_Web_Dashboard
        |-- /data
        |   |-- BRC_hosts.json          <-- Host data file
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

- [ ] **Virtual Environment:**
    - [ ] Initialize and activate a Python virtual environment.

- [ ] **Dependencies (`requirements.txt`):**
    - [ ] Create `requirements.txt` with `Flask`, `python-dotenv`, and `requests`.
    - [ ] Install dependencies: `pip install -r requirements.txt`.

- [ ] **Configuration (`.env`):**
    - [ ] Create `.env` file in the project root for `PINET_API_URL` and `PINET_API_KEY`.

- [ ] **Source Code Placement:**
    - [ ] Create the `src/pinet_web_dashboard/clients` directory and add an empty `__init__.py` file.
    - [ ] Move `pinet_client.py` from `docs/PiNet_API` to `src/pinet_web_dashboard/clients/`.

- [ ] **Data File Placement:**
    - [ ] Create the top-level `data/` directory.
    - [ ] Copy `docs/sample.BRC_hosts.json` to `data/BRC_hosts.json`.

- [ ] **`.gitignore`:**
    - [ ] Create a `.gitignore` file to exclude `venv/`, `__pycache__/`, and `.env`.

---

## Phase 2: Backend Development (Flask)

- [ ] **Flask App Setup (`src/pinet_web_dashboard/main.py`):**
    - [ ] Import `Flask`, `os`, `json`.
    - [ ] Import the client: `from pinet_web_dashboard.clients.pinet_client import PiNetClient`.
    - [ ] Load environment variables from `.env`.
    - [ ] Initialize the Flask app and the `PiNetClient`.

- [ ] **Host Data Loading (SRS R1):**
    - [ ] In `main.py`, implement a function to read `data/BRC_hosts.json`. The path must be resolved correctly from the application's run location.
    - [ ] Handle `FileNotFoundError` and `json.JSONDecodeError` by rendering `error.html` (R1.3).

- [ ] **Main Dashboard Route (`/`) (SRS R2):**
    - [ ] Create a `/` route that renders `index.html`, passing the list of hosts.

- [ ] **API Routes (SRS R3 & R4):**
    - [ ] **`/api/status/<ip_address>` (GET):**
        - [ ] Create the endpoint to accept an IP address.
        - [ ] Use the `pinet_client` instance to call `is_host_online()`.
        - [ ] Return JSON: `{"status": "online"}` or `{"status": "offline"}`.
    - [ ] **`/api/wake/<mac_address>` (POST):**
        - [ ] Create the endpoint to accept a MAC address.
        - [ ] Use the `pinet_client` instance to call `wake_host()`.
        - [ ] Return JSON: `{"status": "success"}`.

- [ ] **Error Handling (SRS R7):**
    - [ ] Implement a startup check to ensure the PiNet API is reachable.
    - [ ] Render `error.html` for critical errors (e.g., config missing, API connection failure).

---

## Phase 3: Frontend Development (HTML, CSS, JavaScript)

- [ ] **`index.html` Template:**
    - [ ] Use Bootstrap 5 for layout.
    - [ ] Use a Jinja2 loop to render hosts, each with `data-ip` and `data-mac` attributes.
    - [ ] Add a status placeholder ("checking...") and a hidden "Wake Up" button for each host.

- [ ] **`app.js` (`static/js/app.js`):**
    - [ ] **On Page Load (Status Check):**
        - [ ] For each host, make an AJAX call to `/api/status/<ip>`.
        - [ ] Update UI based on the response (show "Online" or "Offline" with "Wake Up" button) (R3.4).
    - [ ] **"Wake Up" Button Click Handler:**
        - [ ] Add a click event listener to the "Wake Up" buttons.
        - [ ] On click, show a "waking up..." status.
        - [ ] Make a `POST` request to `/api/wake/<mac>`.
        - [ ] On success, trigger the polling function.
    - [ ] **Polling Mechanism (SRS R5):**
        - [ ] Create a function to poll `/api/status/<ip>` every 10 seconds for a maximum of 2 minutes.
        - [ ] If host comes online, stop polling and update UI to "Online".
        - [ ] If host is still offline after 2 minutes, stop polling and show a "Wake up failed" message.

- [ ] **`style.css` (`static/css/style.css`):**
    - [ ] Add custom styles for status icons (green/red), spinners, and messages.

---

## Phase 4: Docker & Deployment

- [ ] **`Dockerfile`:**
    - [ ] Create a `Dockerfile` using a `python:3.9-slim` base image.
    - [ ] Add `COPY` instructions for `requirements.txt`, the `src/` directory, and the `data/` directory.
    - [ ] Install dependencies.
    - [ ] Set the `CMD` to run the app with `gunicorn`, ensuring it can access the `data` directory.

- [ ] **Deployment:**
    - [ ] Build the Docker image.
    - [ ] Run the container, mounting the `.env` file or passing environment variables.

---

## Phase 5: Documentation & Finalization

- [ ] **`README.md`:**
    - [ ] Write a comprehensive `README.md` with setup, configuration, and run instructions.

- [ ] **Testing:**
    - [ ] Test all features, including status checking, wake-up calls, and polling.
    - [ ] Test error handling for missing files and API connection issues.
