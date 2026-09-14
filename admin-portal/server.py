"""
WIT Enterprise Standalone Admin Portal Server
Local static HTTP server with CORS headers for independent administrative operations.
"""

import http.server
import socketserver
import os
import sys
import webbrowser

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PORT = int(os.environ.get("ADMIN_PORTAL_PORT", 8088))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class AdminHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS so admin portal can communicate seamlessly with backend
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Admin-Security-Key, Authorization")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), AdminHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print("[*] WIT ENTERPRISE ADMIN OPERATIONS PORTAL (ISOLATED)")
        print("=" * 60)
        print(f"[*] Serving locally on: {url}")
        print(f"[*] Admin directory:   {DIRECTORY}")
        print("[*] Security mode:     Strict Header Key (X-Admin-Security-Key)")
        print("=" * 60)
        print("[!] Press Ctrl+C to terminate the admin server.")
        
        # Try opening the browser automatically if run with --open
        if "--open" in sys.argv:
            try:
                webbrowser.open(url)
            except Exception:
                pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down Admin Portal...")

if __name__ == "__main__":
    run()
