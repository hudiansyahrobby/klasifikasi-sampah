import React, { useCallback, useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, X, RefreshCcw, CheckCircle2 } from "lucide-react";

export default function CameraView({ onClose }: { onClose: () => void }) {
  const webcamRef = useRef<Webcam>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // State untuk live detection
  const [isDetecting, setIsDetecting] = useState(true);
  const [result, setResult] = useState<string | null>(null);

  const handleDevices = useCallback(
    (mediaDevices: MediaDeviceInfo[]) => {
      const videoDevices = mediaDevices.filter(({ kind }) => kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !deviceId) {
        setDeviceId(videoDevices[0].deviceId);
      }
    },
    [deviceId]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  // Fungsi deteksi live setiap 500ms
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const captureAndPredict = async () => {
      if (!isDetecting || !webcamRef.current) return;
      
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      try {
        const response = await fetch("http://localhost:8000/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: imageSrc }),
        });

        const data = await response.json();
        
        if (data && data.result !== "Tidak terdeteksi" && data.image_with_box) {
          setResult(data.result);
          setCapturedImage(data.image_with_box);
        } else {
          setResult(null);
          setCapturedImage(null); // Tampilkan webcam asli jika tidak ada objek
        }
      } catch (e) {
        console.error("Gagal terhubung ke Backend Python YOLO:", e);
      }
    };

    if (isDetecting) {
      // Polling frame kamera setiap 3 detik ke Backend (Efisiensi memori & jaringan)
      intervalId = setInterval(captureAndPredict, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isDetecting, deviceId]);

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(8px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div style={{
        background: "var(--background)",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "800px",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        border: "1px solid var(--card-border)",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", borderBottom: "1px solid var(--card-border)" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
            {isDetecting ? "Mendeteksi secara otomatis..." : "Kamera Terhenti"}
          </h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--foreground)", padding: "0.5rem" }}>
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", background: "var(--card-bg)" }}>
          {devices.length > 1 && (
            <div style={{ width: "100%", maxWidth: "640px" }}>
              <select 
                value={deviceId} 
                onChange={(e) => setDeviceId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid var(--card-border)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  fontSize: "1rem"
                }}
              >
                {devices.map((device, key) => (
                  <option key={key} value={device.deviceId}>
                    {device.label || `Camera ${key + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ position: "relative", width: "100%", maxWidth: "640px", aspectRatio: "4/3", background: "black", borderRadius: "12px", overflow: "hidden" }}>
            
            {/* Webcam Stream - Tetap menyala di belakang layer */}
             <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ deviceId: deviceId || undefined }}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />

            {/* Overlaid Captured Image dengan Box dari Backend */}
            {capturedImage && (
              <img 
                src={capturedImage} 
                alt="Detected Box" 
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 10 }} 
              />
            )}
            
            {/* Result Overlay Indicator */}
            {result && (
              <div style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", background: result === "Organik" ? "var(--primary)" : result === "Anorganik" ? "var(--secondary)" : "var(--destructive)", padding: "0.75rem 1.75rem", borderRadius: "9999px", color: "white", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)", animation: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)", zIndex: 20 }}>
                <CheckCircle2 size={24} />
                <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>{result}</span>
                <style>{`@keyframes popIn { 0% { transform: translate(-50%, 20px) scale(0.8); opacity: 0; } 100% { transform: translate(-50%, 0) scale(1); opacity: 1; } }`}</style>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
