#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>  // Library: "ESP32Servo" by Kevin Harrington

// ============================================================
//  ⚙️ KONFIGURASI - Sesuaikan bagian ini!
// ============================================================

const char* WIFI_SSID     = "NAMA_WIFI_KAMU";   // ← Ganti dengan nama WiFi
const char* WIFI_PASSWORD = "PASSWORD_WIFI";     // ← Ganti dengan password WiFi

// IP Address komputer yang menjalankan backend.py
// Buka terminal dan ketik: ipconfig getifaddr en0
const char* BACKEND_IP    = "192.168.X.X";       // ← Ganti dengan IP laptop kamu
const int   BACKEND_PORT  = 8000;

// Pin GPIO untuk masing-masing servo
const int PIN_SERVO_ORGANIK   = 13;  // ← Sesuaikan dengan wiring kamu
const int PIN_SERVO_ANORGANIK = 12;
const int PIN_SERVO_B3        = 14;

// Posisi servo (derajat)
const int POS_BUKA  = 90;   // Posisi saat tong dibuka
const int POS_TUTUP = 0;    // Posisi saat tong ditutup
const int DURASI_BUKA_MS = 3000; // Berapa lama tong tetap terbuka (ms)

// Interval polling ke API (ms)
const int POLLING_INTERVAL_MS = 1000;

// ============================================================

Servo servoOrganik;
Servo servoAnorganik;
Servo servoB3;

String lastAction = "none"; // Untuk menghindari aksi duplikat

void setup() {
  Serial.begin(115200);
  delay(500);

  // Inisialisasi semua servo dalam posisi TUTUP
  servoOrganik.attach(PIN_SERVO_ORGANIK);
  servoAnorganik.attach(PIN_SERVO_ANORGANIK);
  servoB3.attach(PIN_SERVO_B3);

  servoOrganik.write(POS_TUTUP);
  servoAnorganik.write(POS_TUTUP);
  servoB3.write(POS_TUTUP);

  Serial.println("🤖 Sistem Klasifikasi Sampah ESP32 aktif.");
  Serial.println("📡 Menghubungkan ke WiFi...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi Terhubung!");
  Serial.print("   IP Address ESP32: ");
  Serial.println(WiFi.localIP());
}

void bukaServo(Servo &servo, String nama) {
  Serial.println("♻️  Membuka tong: " + nama);
  servo.write(POS_BUKA);
  delay(DURASI_BUKA_MS);
  servo.write(POS_TUTUP);
  Serial.println("🔒 Tong " + nama + " ditutup kembali.");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi terputus! Mencoba reconnect...");
    WiFi.reconnect();
    delay(2000);
    return;
  }

  // Buat URL endpoint
  String url = "http://";
  url += BACKEND_IP;
  url += ":";
  url += BACKEND_PORT;
  url += "/esp32/action";

  HTTPClient http;
  http.begin(url);
  http.setTimeout(3000); // Timeout 3 detik
  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("📥 Response: " + payload);

    // Parsing sederhana (tanpa library JSON untuk efisiensi)
    String action = "none";
    if (payload.indexOf("\"organik\"") >= 0)   action = "organik";
    if (payload.indexOf("\"anorganik\"") >= 0) action = "anorganik";
    if (payload.indexOf("\"b3\"") >= 0)         action = "b3";

    // Jalankan aksi hanya jika ada deteksi baru
    if (action != "none" && action != lastAction) {
      lastAction = action;

      if (action == "organik") {
        bukaServo(servoOrganik, "ORGANIK 🟢");
      } else if (action == "anorganik") {
        bukaServo(servoAnorganik, "ANORGANIK 🔵");
      } else if (action == "b3") {
        bukaServo(servoB3, "B3 (Berbahaya) 🔴");
      }
    } else if (action == "none") {
      // Reset lastAction agar bisa merespons deteksi berikutnya
      lastAction = "none";
    }
  } else {
    Serial.println("⚠️  Gagal mengambil data. HTTP Code: " + String(httpCode));
    lastAction = "none"; // Reset jika koneksi gagal
  }

  http.end();
  delay(POLLING_INTERVAL_MS);
}
