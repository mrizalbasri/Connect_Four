#!/usr/bin/env python3
"""
🌐 NGROK TUNNELING SETUP
Jalankan file ini untuk buat public URL untuk Connect Four game
"""

from pyngrok import ngrok
import time
import sys

def main():
    print("\n" + "="*70)
    print("🌐 CONNECT FOUR - TUNNELING SETUP")
    print("="*70)
    print("\n📋 Instruksi:")
    print("   1. Pastikan server.py sudah berjalan di Terminal lain!")
    print("   2. File ini akan membuat public URL untuk access game")
    print("   3. Kasih URL ke mahasiswa")
    print("   4. Tekan CTRL+C untuk stop tunneling")
    print("\n" + "="*70 + "\n")
    
    # Start tunnel
    try:
        print("⏳ Initializing ngrok tunnel...")
        public_url = ngrok.connect(5000)
        
        print("\n✅ Tunneling aktif!\n")
        print("="*70)
        print("🌐 PUBLIC URL:")
        print("="*70)
        print(f"\n   {public_url}/connect_four.html\n")
        print("="*70)
        print("\n📍 Kasih URL ini ke mahasiswa:")
        print("   - Copy-paste URL di atas")
        print("   - Buka di browser mereka")
        print("   - Mereka bisa mulai bermain!\n")
        print("="*70)
        print("\n⏱️  Tunneling berjalan... (Tekan CTRL+C untuk stop)\n")
        
        # Keep tunnel alive
        while True:
            time.sleep(1)
    
    except KeyboardInterrupt:
        print("\n\n" + "="*70)
        print("✅ Tunneling dihentikan")
        print("="*70 + "\n")
        ngrok.kill()
        sys.exit(0)
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n⚠️  Pastikan:")
        print("   1. server.py sudah berjalan")
        print("   2. Port 5000 tersedia")
        print("   3. Internet connection aktif\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
