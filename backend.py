from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    conn = sqlite3.connect("database.sqlite")
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/stats")
def get_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Hitung jumlah Organik, Anorganik, B3
        cursor.execute("SELECT class_name, COUNT(*) as count FROM detections GROUP BY class_name")
        rows = cursor.fetchall()
        
        stats = []
        for row in rows:
            name = row["class_name"]
            # Pastikan penyesuaian nama karena klasifikasi bisa beda (contoh: label model "Organik")
            color = "var(--primary)" if "Organik" in name else "var(--destructive)" if "B3" in name else "var(--secondary)"
            stats.append({
                "name": name,
                "value": row["count"],
                "color": color
            })
        
        conn.close()
        return {"data": stats}
    except Exception as e:
        return {"error": str(e)}

@app.get("/history")
def get_history():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Ambil 10 data terbaru
        cursor.execute("SELECT id, class_name, confidence, timestamp FROM detections ORDER BY timestamp DESC LIMIT 10")
        rows = cursor.fetchall()
        
        history = []
        for row in rows:
            history.append({
                "id": row["id"],
                "type": row["class_name"],
                "score": row["confidence"],
                "time": row["timestamp"]  # Aslinya UTC string, kita lempar ke frontend
            })
            
        conn.close()
        return {"data": history}
    except Exception as e:
        return {"error": str(e)}

@app.get("/esp32/action")
def get_esp32_action():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Cek apakah ada objek terdeteksi dalam 5 detik terakhir (CURRENT_TIMESTAMP adalah UTC)
        cursor.execute("""
            SELECT class_name FROM detections 
            WHERE (julianday('now') - julianday(timestamp)) * 86400 <= 5 
            ORDER BY timestamp DESC LIMIT 1
        """)
        row = cursor.fetchone()
        conn.close()
        
        if row:
            type_name = row["class_name"].lower()
            if "b3" in type_name:
                return {"action": "b3"}
            elif "anorganik" in type_name:
                return {"action": "anorganik"}
            elif "organik" in type_name:
                return {"action": "organik"}
                
        # Jika tidak ada deteksi baru dalam 5 detik terakhir
        return {"action": "none"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend:app", host="0.0.0.0", port=8000, reload=True)
