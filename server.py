import http.server
import socketserver
import json
import os
from datetime import datetime

# Konfigurasi Server
PORT = 5000
DATA_FOLDER = "data"

# Buat folder data kalau belum ada
if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)
    print(f"📁 Folder '{DATA_FOLDER}' dibuat")

class TournamentLogHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        # Handle CORS preflight browser checks
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/save-tournament':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                # Parse data tournament
                tournament_data = json.loads(post_data)
                
                # Generate filename dengan timestamp
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"tournament_logs_{timestamp}.json"
                filepath = os.path.join(DATA_FOLDER, filename)
                
                # Simpan data ke file baru
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(tournament_data, f, indent=2, ensure_ascii=False)
                
                # Print info ke console
                print(f"\n✅ DATA TERSIMPAN: {filename}")
                challenge_result = tournament_data.get('challengeResult', {})
                print(f"   Winner: {challenge_result.get('winner', 'N/A').upper()}")
                print(f"   Score: {challenge_result.get('finalScore', 'N/A')}")
                print(f"   Total Games: {tournament_data.get('summary', {}).get('session', {}).get('totalGames', 0)}")
                print(f"   File: {os.path.abspath(filepath)}")

                # Kirim respon sukses
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    'success': True,
                    'filename': filename,
                    'message': 'Tournament data berhasil disimpan!'
                }
                self.wfile.write(json.dumps(response).encode())

            except Exception as e:
                print(f"❌ Error: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode())
        
        elif self.path == '/health':
            # Health check endpoint
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {
                'status': 'running',
                'message': 'Server tournament aktif!',
                'data_folder': DATA_FOLDER
            }
            self.wfile.write(json.dumps(response).encode())
        
        else:
            self.send_response(404)
            self.end_headers()

print("\n" + "="*50)
print("🎮 TOURNAMENT DATA SERVER")
print("="*50)
print(f"📁 Data akan disimpan ke: {os.path.abspath(DATA_FOLDER)}")
print(f"🌐 Server berjalan di: http://localhost:{PORT}")
print(f"✅ Siap menerima data tournament!")
print("="*50)
print("\nMenunggu peserta tournament...\n")

# Jalankan server
with socketserver.TCPServer(("", PORT), TournamentLogHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Server dihentikan.")
        print(f"📊 Total file tersimpan: {len(os.listdir(DATA_FOLDER))}")

