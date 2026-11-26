#!/usr/bin/env python3
"""
Syllable Dojo - 本地網頁伺服器
若想在家中讓 iPad / 平板連線遊玩，可執行此腳本。
"""
import http.server
import socketserver
import socket
import webbrowser

PORT = 8080

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    local_ip = get_local_ip()
    print("==================================================")
    print(f"🥋 Syllable Dojo 本地伺服器已啟動！")
    print(f"👉 本機電腦遊玩網址: http://localhost:{PORT}")
    print(f"👉 iPad / 平板同Wi-Fi遊玩網址: http://{local_ip}:{PORT}")
    print("==================================================")
    print("按 Ctrl + C 可停止伺服器")
    webbrowser.open(f"http://localhost:{PORT}")
    httpd.serve_forever()
