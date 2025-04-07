import React, { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";

export default function VideoAnnotationTool() {
  const [videoSrc, setVideoSrc] = useState("");
  const [playbackRate, setPlaybackRate] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [currentLabel, setCurrentLabel] = useState("");
  const [currentDesc, setCurrentDesc] = useState("");
  const [videoId, setVideoId] = useState("video1");
  const [labelStart, setLabelStart] = useState(null);
  const [fps, setFps] = useState(30);
  const [jumpTime, setJumpTime] = useState("");

  const videoRef = useRef(null);

  const handleVideoLoad = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoId(file.name);
    }
  };

  const handleStartLabel = () => {
    if (videoRef.current) {
      setLabelStart(videoRef.current.currentTime);
    }
  };

  const handleEndLabel = () => {
    if (videoRef.current && labelStart !== null && currentLabel !== "") {
      const endTime = videoRef.current.currentTime;
      const newAnnotation = {
        videoId,
        label: currentLabel,
        start: labelStart.toFixed(2),
        end: endTime.toFixed(2),
        description: currentDesc,
      };
      setAnnotations([...annotations, newAnnotation]);
      setLabelStart(null);
    }
  };

  const handleExport = () => {
    const csv = Papa.unparse(
      annotations.map((a) => ({
        video_id: a.videoId,
        label: a.label,
        start_time: a.start,
        end_time: a.end,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${videoId}_annotations.csv`);
  };

  const handlePrevFrame = () => {
    if (videoRef.current && fps > 0) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 1 / fps);
    }
  };

  const handleNextFrame = () => {
    if (videoRef.current && fps > 0) {
      videoRef.current.currentTime = videoRef.current.currentTime + 1 / fps;
    }
  };

  const handleJumpToTime = () => {
    const time = parseFloat(jumpTime);
    if (videoRef.current && !isNaN(time)) {
      videoRef.current.currentTime = time;
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  return (
    <div style={{ padding: "20px", display: "flex", gap: "20px" }}>
      <div style={{ flex: 2 }}>
        <input type="file" accept="video/*" onChange={handleVideoLoad} />
        {videoSrc && (
          <video
            src={videoSrc}
            controls
            ref={videoRef}
            style={{ width: "100%", marginTop: "10px" }}
          />
        )}
        <div style={{ marginTop: "10px" }}>
          Playback Rate: {" "}
          {[0.5, 1, 2, 4, 8].map((r) => (
            <button
              key={r}
              style={{
                margin: "0 5px",
                backgroundColor: playbackRate === r ? "#333" : "#eee",
                color: playbackRate === r ? "white" : "black",
              }}
              onClick={() => setPlaybackRate(r)}
            >
              {r}x
            </button>
          ))}
        </div>
        <div style={{ marginTop: "10px" }}>
          <label>
            FPS:
            <input
              type="number"
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              style={{ width: "60px", marginLeft: "5px", marginRight: "15px" }}
            />
          </label>
          <button onClick={handlePrevFrame}>⏮ Last Frame</button>
          <button onClick={handleNextFrame} style={{ marginLeft: "10px" }}>
            ⏭ Next Frame
          </button>
        </div>
        <div style={{ marginTop: "10px" }}>
          Jump to (sec):
          <input
            type="number"
            value={jumpTime}
            onChange={(e) => setJumpTime(e.target.value)}
            style={{ width: "80px", marginLeft: "5px" }}
          />
          <button onClick={handleJumpToTime} style={{ marginLeft: "10px" }}>
            Jump
          </button>
        </div>
        <div style={{ marginTop: "10px" }}>
          <input
            placeholder="Label"
            value={currentLabel}
            onChange={(e) => setCurrentLabel(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <input
            placeholder="Description"
            value={currentDesc}
            onChange={(e) => setCurrentDesc(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <button onClick={handleStartLabel}>Start</button>
          <button onClick={handleEndLabel} style={{ marginLeft: "5px" }}>
            End
          </button>
          <button onClick={handleExport} style={{ marginLeft: "10px" }}>
            Export CSV
          </button>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <h3>Annotations</h3>
        {annotations.map((a, i) => (
          <div
            key={i}
            style={{ border: "1px solid #ccc", marginBottom: "5px", padding: "5px" }}
          >
            <strong>{a.label}</strong> ({a.start}s - {a.end}s)
            <div style={{ fontSize: "0.9em" }}>{a.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}