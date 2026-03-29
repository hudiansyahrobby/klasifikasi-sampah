"use client";

import React, { useState, useEffect } from "react";
import styles from "../app/page.module.css";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

type HistoryItem = {
  id: number;
  type: string;
  score: number;
  time: string;
};

export default function HistoryTable() {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/history");
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 2500); // Polling update
    return () => clearInterval(interval);
  }, []);

  const getTypeClass = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("b3")) return styles.badgeHazardous;
    if (t.includes("anorganik")) return styles.badgeInorganic;
    if (t.includes("organik")) return styles.badgeOrganic;
    return styles.badgeInorganic; // default
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "#22c55e"; // hijau
    if (score >= 0.5) return "#eab308"; // kuning
    return "#ef4444"; // merah
  };

  const getIcon = (type: string) => {
    if (type.toLowerCase().includes("b3")) return <AlertTriangle size={16} />;
    return <CheckCircle2 size={16} />;
  };

  return (
    <section className={styles.tableSection}>
      <div className={styles.tableHeader}>
        <div style={{ padding: "0.75rem", background: "var(--foreground)", borderRadius: "12px", color: "var(--background)" }}>
          <Clock size={24} />
        </div>
        <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>Log Klasifikasi Terbaru</h2>
      </div>
      
      <div className={`${styles.glassPanel} ${styles.tableContainer}`} style={{ background: "var(--card-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--card-border)" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Hasil Klasifikasi</th>
              <th>Confidence Score</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((row) => (
              <tr key={row.id}>
                <td style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock size={16} opacity={0.5} />
                  {/* Format waktu dengan zona Asia/Makassar (WITA) */}
                  {new Date(row.time + "Z").toLocaleTimeString("id-ID", { timeZone: "Asia/Makassar", hour: "2-digit", minute: "2-digit", second: "2-digit" })} WITA
                </td>
                <td>
                  <span className={`${styles.badge} ${getTypeClass(row.type)}`}>
                    <span style={{ marginRight: "0.5rem", display: "flex", alignItems: "center" }}>
                      {getIcon(row.type)}
                    </span>
                    {row.type}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ flex: 1, height: "8px", background: "rgba(15, 23, 42, 0.1)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${row.score * 100}%`, height: "100%", background: getScoreColor(row.score), borderRadius: "4px", transition: "width 0.5s ease-in-out" }} />
                    </div>
                    <strong style={{ color: getScoreColor(row.score) }}>
                      {row.score.toFixed(2)}
                    </strong>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>
                  {loading ? "Menghubungkan ke database..." : "Belum ada sampah yang berhasil dideteksi."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
