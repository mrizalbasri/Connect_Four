import http.server
import socketserver
import json
import os
from datetime import datetime

# Konfigurasi Server
PORT = 5000
LOG_FILE = "connect_four_research_data.json"

class ResearchLogHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        # Handle CORS preflight browser checks
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/log':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # Parse data yang dikirim dari browser
                new_entry = json.loads(post_data)
                new_entry['server_timestamp'] = datetime.now().isoformat()
                
                # Baca file data lama (jika ada)
                existing_data = []
                if os.path.exists(LOG_FILE):
                    try:
                        with open(LOG_FILE, 'r') as f:
                            content = f.read()
                            if content:
                                existing_data = json.loads(content)
                    except json.JSONDecodeError:
                        pass # Jika file rusak, mulai baru
                
                # Tambahkan data baru
                if isinstance(new_entry, list):
                    existing_data.extend(new_entry)
                    print(f"[DATA SAVED] Batch logging: {len(new_entry)} turns saved.")
                else:
                    existing_data.append(new_entry)
                    print(f"[DATA SAVED] Single turn saved. Game {new_entry.get('game_id', '?')[-4:]} | Turn {new_entry.get('global_turn', '?')} captured.")

                # Simpan kembali ke file
                with open(LOG_FILE, 'w') as f:
                    json.dump(existing_data, f, indent=2)
                
                # Kirim respon sukses ke browser
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'{"status": "success", "message": "Log stored on server"}')

            except Exception as e:
                print(f"Error processing log: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

print("="*50)
print(f"   SERVER RESET CONNECT FOUR AKTIF")
print(f"   Port: {PORT}")
print(f"   File Penyimpanan: {os.path.abspath(LOG_FILE)}")
print("="*50)
print("Menunggu data dari game...")

# Jalankan server
with socketserver.TCPServer(("", PORT), ResearchLogHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer dihentikan.")
