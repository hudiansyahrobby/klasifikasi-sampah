#!/bin/bash

# Fungsi untuk membersihkan (menghentikan) semua proses ketika script dihentikan (Ctrl+C)
cleanup() {
    echo -e "\n🛑 Menghentikan semua layanan..."
    # Matikan proses berdasarkan PID
    kill $FRONTEND_PID $BACKEND_PID $DETECTOR_PID 2>/dev/null
    echo "✅ Semua layanan telah berhenti."
    exit 0
}

# Tangkap aksi pengguna saat menekan Ctrl+C (SIGINT) dan panggil fungsi cleanup
trap cleanup SIGINT SIGTERM

echo "🚀 Memulai semua layanan Klasifikasi Sampah..."
echo "------------------------------------------------"

# 1. Jalankan Next.js (Dashboard Frontend)
echo "🌐 1. Menjalankan Dashboard (Next.js)..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Dashboard berjalan di background (PID: $FRONTEND_PID) 👉 Buka http://localhost:3000"

# 2. Aktifkan Virtual Environment dan jalankan Backend (FastAPI)
echo "⚙️  2. Menjalankan Backend API (FastAPI)..."
source .venv/bin/activate
python backend.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "   API berjalan di background (PID: $BACKEND_PID) 👉 Berjalan di port 8000"

# 3. Jalankan Detector (YOLOv8 & Kamera)
echo "📷 3. Menjalankan AI Detector Kamera..."
python detector.py & # Kita biarkan script Python ini tampil di terminal supaya kamu bisa melihat logsnya
DETECTOR_PID=$!
echo "   Detector berjalan (PID: $DETECTOR_PID)"

echo "------------------------------------------------"
echo "✅ Sistem siap digunakan!"
echo "Tekan [Ctrl+C] kapan saja di terminal ini untuk mematikan semua aplikasi (Frontend, Backend, Detector)."
echo "------------------------------------------------"

# Tunggu semua proses background selesai (atau sampai user menekan Ctrl+C)
wait
