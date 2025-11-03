#!/usr/bin/env python3

"""
Main Flask application for the PiNet Web Dashboard.
"""

import os
import json
from flask import Flask, render_template, jsonify
from dotenv import load_dotenv

# Correctly import the PiNetClient and specific errors
from pinet_web_dashboard.clients.pinet_client import PiNetClient, PiNetAPIError

# --- Application Setup ---

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

app = Flask(__name__)

# --- Configuration ---

PINET_API_URL = os.getenv("PINET_API_URL")
PINET_API_KEY = os.getenv("PINET_API_KEY")
HOSTS_FILE_PATH = os.path.join(os.path.dirname(app.root_path), '..', 'data', 'hosts.json') # Updated filename

# --- Route Definitions ---

@app.route('/')
def index():
    """Main dashboard route. Validates API connection and data files before loading."""
    try:
        # 1. Validate local .env configuration.
        if not PINET_API_URL or not PINET_API_KEY or "your_pinet_api_ip" in PINET_API_URL:
            raise ValueError("PINET_API_URL and PINET_API_KEY must be correctly set in the .env file.")
        
        # 2. Initialize client and perform a real authenticated check.
        client = PiNetClient(PINET_API_URL, PINET_API_KEY)
        client.is_host_online('8.8.8.8') # Dummy call to force an authentication check.

        # 3. If connection is successful, load hosts.
        with open(HOSTS_FILE_PATH, 'r') as f:
            data = json.load(f)
            hosts = data.get('hosts', [])
        
        return render_template('index.html', hosts=hosts, error=None)

    except Exception as e:
        # 4. If any step fails, generate a specific error message.
        print(f"[ERROR] Failed to load dashboard: {e}")
        if isinstance(e, FileNotFoundError):
            error_message = "Error: The 'data/hosts.json' file is missing."
        elif isinstance(e, json.JSONDecodeError):
            error_message = "Error: The 'data/hosts.json' file contains invalid JSON and could not be read."
        elif isinstance(e, PiNetAPIError):
            error_message = f"Failed to connect to PiNet API. Please check API URL and Key. (Details: {e})"
        else: # Catches ValueError and any other exceptions
            error_message = f"An unexpected error occurred during setup. (Details: {e})"

        return render_template('index.html', hosts=[], error=error_message)


@app.route('/api/status/<string:ip_address>')
def get_status(ip_address):
    """API endpoint to check the status of a single host."""
    try:
        client = PiNetClient(PINET_API_URL, PINET_API_KEY)
        result = client.is_host_online(ip_address)
        return jsonify({"status": "online" if result.is_online else "offline"})
    except PiNetAPIError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/wake/<string:mac_address>', methods=['POST'])
def wake_host(mac_address):
    """API endpoint to send a Wake-on-LAN packet."""
    try:
        client = PiNetClient(PINET_API_URL, PINET_API_KEY)
        result = client.wake_host(mac_address)
        if result.success:
            return jsonify({"status": "success", "message": result.message})
        else:
            return jsonify({"status": "error", "message": result.message}), 400
    except PiNetAPIError as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Generic Error Handler for truly unexpected errors ---

@app.errorhandler(500)
def handle_500_error(e):
    """Catch all unhandled 500 errors and render a nice error page."""
    original_exception = getattr(e, "original_exception", e)
    print(f"[ERROR] Unhandled 500 exception: {original_exception}")
    return render_template("error.html", error_message=str(original_exception)), 500

# --- Application Startup ---

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
