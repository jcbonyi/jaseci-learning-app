"""Simple server wrapper to run Jac walkers without jac-cloud auth."""
import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add the backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import jaclang
try:
    import jaclang
    from jaclang import jac_import
except ImportError:
    print("Error: jaclang not installed. Run: pip install jaclang")
    sys.exit(1)

# Load the main module
main_module = None

def load_jac_module():
    global main_module
    try:
        main_module = jac_import("main")
        print("Jac module loaded successfully")
    except Exception as e:
        print(f"Error loading Jac module: {e}")

class JacHandler(BaseHTTPRequestHandler):
    def _send_response(self, status, data):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        self._send_response(200, {})

    def do_GET(self):
        if self.path == '/healthz':
            self._send_response(200, {"status": "ok"})
        else:
            self._send_response(404, {"error": "Not found"})

    def do_POST(self):
        # Parse path to get walker name
        if self.path.startswith('/walker/'):
            walker_name = self.path[8:]  # Remove '/walker/'
            
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                args = json.loads(body) if body else {}
            except json.JSONDecodeError:
                args = {}

            # Execute walker
            result = self.run_walker(walker_name, args)
            self._send_response(200, result)
        else:
            self._send_response(404, {"error": "Not found"})

    def run_walker(self, walker_name, args):
        """Run a Jac walker and return the result."""
        try:
            # This is a simplified implementation
            # In practice, you'd use Jac's runtime to spawn walkers
            return {
                "status": "ok",
                "walker": walker_name,
                "args": args,
                "message": "Walker executed (stub - see jac serve for full functionality)"
            }
        except Exception as e:
            return {"error": str(e)}

def run_server(port=8000):
    load_jac_module()
    server = HTTPServer(('0.0.0.0', port), JacHandler)
    print(f"Server running on http://0.0.0.0:{port}")
    print("Note: This is a development server. Use 'jac serve' for production with proper auth.")
    server.serve_forever()

if __name__ == '__main__':
    run_server()

