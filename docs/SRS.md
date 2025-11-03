# Software Requirements Specification (SRS)
# PiNet Web Dashboard (v1.0)

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the requirements for the **PiNet Web Dashboard**. This web application will provide a user-friendly, dynamic interface to monitor the online/offline status of network hosts and send Wake-on-LAN (WoL) packets via the existing `PiNet_API`.

### 1.2 Intended Audience
This document is intended for the project developer (for implementation) and any future developers who may maintain or extend the system.

### 1.3 Project Scope
**Version 1.0 (In Scope):**
* Dynamically list hosts from a local `BRC_hosts.json` file.
* Check the online/offline status of each host on page load.
* Provide a "Wake Up" button for hosts that are offline.
* Poll for status updates for 2 minutes after a wake-up attempt.
* The application will be deployed as a Docker container.
* All configuration (API keys, URLs) will be managed via a `.env` file.

**Future Enhancements (Out of Scope for v1.0):**
* A web-based admin interface to add, edit, or delete hosts from the JSON file.

### 1.4 Definitions
* **PiNet API:** The external, pre-existing REST API used for network operations (ping, WoL).
* **PiNet Client:** The `pinet_client.py` library used by the Flask App to communicate with the `PiNet_API`.
* **Flask App (The System):** The Python/Flask web application described in this document.
* **Host:** A network device defined in `BRC_hosts.json` with a Name, IP, and MAC address.
* **WoL:** Wake-on-LAN. A network standard to wake up sleeping computers.
* **AJAX:** Asynchronous JavaScript and XML. The frontend technology (using `fetch()`) to call the Flask backend without a page reload.

---

## 2. Overall Description

### 2.1 Product Perspective
The PiNet Web Dashboard is a standalone web application. It acts as a **client** to the `PiNet_API`. Its architecture is a "backend-for-frontend," where the user's browser (Frontend) communicates with the Flask App (Backend), which in turn securely communicates with the `PiNet_API`.



### 2.2 Product Features (v1.0)
* **Host Data Loading:** Reads host information from a local JSON file.
* **Dynamic Host Monitoring:** Lists all hosts and displays their real-time online/offline status.
* **Remote Host Wake-up:** Allows users to send WoL packets to offline hosts.
* **Configuration Management:** Uses a `.env` file for secure storage of credentials.
* **Error Handling:** Provides user-friendly pages for common errors.

### 2.3 User Characteristics
The users are any individuals on the same local network as the Flask App. No technical knowledge is required, as the interface will be a simple "point-and-click" dashboard.

### 2.4 Constraints
* The Flask App **must** have network access to the `PiNet_API`.
* The `PiNet_API` URL and a valid `API_KEY` must be provided in the `.env` file.
* A `BRC_hosts.json` file must be present and accessible to the Flask App.
* The system shall be deployed as a Docker container on an Ubuntu host.
* The project structure must use a standard Python `src` layout.

### 2.5 Assumptions and Dependencies
* The `PiNet_API` is already installed, configured, and running.
* The local network is considered secure; therefore, the Flask App itself does not require a user login/authentication system.

---

## 3. System Features (Functional Requirements)

### 3.1 Feature 1: Host Data Loading
* **R1.1:** The system shall read a JSON file named `BRC_hosts.json` upon startup.
* **R1.2:** The system shall parse the list of host objects from this file.
* **R1.3:** If the `BRC_hosts.json` file is missing or contains malformed JSON, the system shall stop and display a user-friendly error page.

### 3.2 Feature 2: Main Dashboard Display
* **R2.1:** The system shall render a single web page dynamically listing all hosts found in the JSON file.
* **R2.2:** For each host, the page shall display, at a minimum, the host's "Name".
* **R2.3:** Upon initial page load, each host in the list shall display a "checking..." status animation (e.g., a spinner).

### 3.3 Feature 3: Host Status Checking (Ping)
* **R3.1:** The frontend (JavaScript) shall, for each host, make an asynchronous (AJAX) call to a dedicated route on its own Flask backend (e.g., `/api/status/<ip_address>`).
* **R3.2:** The Flask backend, upon receiving this request, shall use the `pinet_client` to call the `is_host_online(ip_address)` method.
* **R3.3:** The Flask backend shall return a simple JSON response to the frontend (e.g., `{"status": "online"}` or `{"status": "offline"}`).
* **R3.4:** The frontend JavaScript shall receive this response and update the UI for that specific host:
    * **On "online":** The "checking..." animation shall be replaced with a green "Online" icon.
    * **On "offline":** The "checking..." animation shall be replaced with a red "Offline" icon and a "Wake Up" button.

### 3.4 Feature 4: Host Wake-on-LAN (WoL)
* **R4.1:** When a user clicks the "Wake Up" button for an offline host, the frontend shall:
    * Change the host's status to a "waking up..." animation.
    * Make an asynchronous (AJAX) `POST` call to a dedicated route on its Flask backend (e.g., `/api/wake/<mac_address>`).
* **R4.2:** The Flask backend, upon receiving this request, shall use the `pinet_client` to call the `wake_host(mac_address)` method.
* **R4.3:** The Flask backend shall return a JSON response indicating the WoL packet was sent (e.g., `{"status": "success"}`).

### 3.5 Feature 5: Post-Wake Status Polling
* **R5.1:** After receiving a successful "wake" response (per R4.3), the frontend JavaScript shall immediately begin a polling process for that host.
* **R5.2:** The polling process shall re-call the status check (per R3.1) periodically (e.g., every 10 seconds).
* **R5.3:** This polling shall continue for a maximum of two (2) minutes.
* **R5.4:** **(Success Condition)** If a poll returns an "online" status within the 2-minute window, the polling shall stop, and the UI shall be updated to the green "Online" state (per R3.4).
* **R5.5:** **(Failure Condition)** If the host is still "offline" after 2 minutes, the polling shall stop, the UI shall revert to the red "Offline" state, and a "Wake up failed" message shall be displayed for that host.

### 3.6 Feature 6: Configuration
* **R6.1:** The Flask App shall load all its configuration variables from a `.env` file at startup.
* **R6.2:** The configuration must include `PINET_API_URL` and `PINET_API_KEY`.

### 3.7 Feature 7: Error Handling
* **R7.1:** The Flask App shall display a full-page, user-friendly error message if it fails to load its configuration from the `.env` file.
* **R7.2:** The Flask App shall display a full-page, user-friendly error message if it cannot connect to the `PiNet_API` on startup (e.g., during an initial `check_health()` call).

---

## 4. Non-Functional Requirements

* **NFR1 (Security):** The application will not implement any user authentication or authorization. Access is controlled solely by access to the web server on the local network.
* **NFR2 (Deployment):** The application, including its Python dependencies, must be fully containerized in a `Dockerfile`.
* **NFR3 (Deployment):** The application shall be deployable on an Ubuntu host running Docker.
* **NFR4 (Project Structure):** The Python source code must be organized in a standard `src/` directory layout.
* **NFR5 (Documentation):** All project documentation (e.g., this SRS) shall be stored in a `/docs` directory. The main `README.md` will be at the project root.
* **NFR6 (Technology Stack):**
    * **Backend:** Python (Flask)
    * **Frontend:** HTML, Bootstrap 5
    * **Dynamic Behavior:** JavaScript (Fetch API / AJAX)
    * **API Communication:** `pinet_client.py`

---

## 5. Future Enhancements (v2.0)

* **FE-1:** An "Admin" page (potentially password-protected) will be created.
* **FE-2:** This admin page will allow users to add new hosts, edit existing hosts, and delete hosts.
* **FE-3:** These actions will read from and write to the `BRC_hosts.json` file, making it a persistent, managed store.