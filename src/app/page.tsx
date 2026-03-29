"use client";

import React from "react";
import { BarChart3, Recycle, Info } from "lucide-react";
import styles from "./page.module.css";
import HistoryChart from "../components/HistoryChart";
import HistoryTable from "../components/HistoryTable";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Background ambient decorations */}
      <div className={styles.bgDecoration} />
      <div className={styles.bgDecoration2} />

      <div className={styles.container}>
        <header className={styles.header}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <div style={{ padding: "1rem", background: "var(--primary)", borderRadius: "50%", color: "white", boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.5)" }}>
              <Recycle size={48} strokeWidth={2.5} />
            </div>
          </div>
          <h1 className={`${styles.title} heading-gradient`}>Dashboard IoT Sampah</h1>
          <p className={styles.subtitle}>
            Panel pemantauan klasifikasi sampah secara real-time. Deteksi dilakukan oleh kamera server eksternal (detector.py) dan disinkronisasi ke dashboard ini.
          </p>
        </header>

        <section className={styles.grid}>
          {/* Left panel: Classification input/info */}
          <div className={`${styles.card} glass-panel`}>
            <div style={{ padding: "1rem", background: "rgba(59, 130, 246, 0.1)", borderRadius: "50%", color: "var(--secondary)", marginBottom: "1rem" }}>
              <Info size={36} />
            </div>
            <h2 className={styles.cardTitle}>Status Deteksi</h2>
            <p style={{ color: "var(--foreground)", opacity: 0.8, lineHeight: 1.6, marginBottom: "2rem" }}>
              Sistem backend sedang memonitor kamera secara aktif di latar belakang (Background Process). Setiap benda yang melewati kamera akan dicocokkan dengan algoritma <strong>YOLO Deep Learning</strong> dan hasilnya diunggah ke database dasbor secara otomatis.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "12px", background: "var(--background)", borderLeft: "4px solid var(--primary)" }}>
                <div>
                  <h3 style={{ fontWeight: 600, color: "var(--primary)" }}>🌿 Organik</h3>
                  <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>Sisa makanan, daun, kertas basah.</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "12px", background: "var(--background)", borderLeft: "4px solid var(--secondary)" }}>
                <div>
                  <h3 style={{ fontWeight: 600, color: "var(--secondary)" }}>♻️ Anorganik</h3>
                  <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>Plastik, botol minuman, kardus, kaleng.</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "12px", background: "var(--background)", borderLeft: "4px solid var(--destructive)" }}>
                <div>
                  <h3 style={{ fontWeight: 600, color: "var(--destructive)" }}>⚠️ B3 (Berbahaya)</h3>
                  <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>Baterai, lampu, bahan kimia, obat-obatan.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: History Chart */}
          <div className={`${styles.card} glass-panel`}>
            <div style={{ padding: "1rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "50%", color: "var(--primary)", marginBottom: "1rem" }}>
              <BarChart3 size={36} />
            </div>
            <h2 className={styles.cardTitle}>Distribusi Klasifikasi</h2>
            <p style={{ color: "var(--foreground)", opacity: 0.8, marginBottom: "1rem" }}>
              Grafik jenis sampah yang dideteksi oleh sistem kamera hingga saat ini secara real-time.
            </p>
            
            {/* The dynamically imported or client-side chart */}
            <HistoryChart />
          </div>
        </section>

        {/* History Table Section */}
        <HistoryTable />
      </div>
    </main>
  );
}
