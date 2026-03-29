import cv2
import sqlite3
import time
from ultralytics import YOLO

# Konfigurasi Model
try:
    model = YOLO("public/best.pt")
    print("✅ Model YOLO (best.pt) berhasil dimuat.")
except Exception as e:
    print(f"❌ Gagal memuat model: {e}")
    exit(1)

# Koneksi ke Database SQLite
def save_detection_to_db(class_name, confidence):
    conn = sqlite3.connect("database.sqlite")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO detections (class_name, confidence) VALUES (?, ?)", 
        (class_name, confidence)
    )
    conn.commit()
    conn.close()

# Mekanisme Cooldown (Hanya simpan 1 kali setiap 3 detik per kelas sampah)
last_detected_time = {
    "Organik": 0,
    "Anorganik": 0,
    "B3 (Berbahaya)": 0,
    "B3": 0
}
COOLDOWN_SECONDS = 3

def main():
    print("Membuka kamera...")
    cap = cv2.VideoCapture(0) # 0 untuk kamera default (Webcam)
    
    if not cap.isOpened():
        print("❌ Tidak dapat membuka kamera.")
        return

    print("Kamera aktif. Tekan 'q' untuk keluar dari jendela deteksi.")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Gagal mengambil frame dari kamera.")
            break
        
        # Jalankan YOLO (Confidence minimal 50%)
        results = model(frame, conf=0.5, verbose=False)
        
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                class_name = model.names[class_id]
                
                # Cek apakah kelas ini sudah masuk masa tenang (Cooldown)
                current_time = time.time()
                last_time = last_detected_time.get(class_name, 0)
                
                if current_time - last_time > COOLDOWN_SECONDS:
                    print(f"📦 Terdeteksi: {class_name} (Akurasi: {confidence:.2f}) -> Tersimpan di Database")
                    save_detection_to_db(class_name, confidence)
                    last_detected_time[class_name] = current_time

        # Render gambar hasil YOLO
        annotated_frame = results[0].plot()
        
        # Tampilkan kotak video langsung
        cv2.imshow("Monitor Klasifikasi Sampah (YOLO)", annotated_frame)
        
        # Tekan tombol 'q' untuk keluar
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    from db_init import init_db
    init_db()  # Pastikan DB dibuat
    main()
