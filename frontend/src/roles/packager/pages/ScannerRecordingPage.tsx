import React, { useEffect, useRef, useState } from 'react';

const ScannerRecordingPage = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const startRecording = () => {
    console.log('Starting recording');

    recordedChunksRef.current = [];

    const mediaRecorder = new MediaRecorder(
      mediaStreamRef.current as MediaStream,
      {
        mimeType: 'video/webm; codecs=vp8',
      }
    );

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstart = () => {
      console.log('Recording started');
    };

    mediaRecorder.start(); // 👈 starts recording
  };

  const stopRecording = () => {
    console.log('Stopping recording');
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = () => {
      const videoBlob = new Blob(recordedChunksRef.current, {
        type: 'video/webm',
      });

      console.log('Recording stopped');
      console.log('Video Blob:', videoBlob);

      // TODO: upload to backend / S3
      // uploadVideo(videoBlob);
    };

    mediaRecorderRef.current.stop(); // 👈 stops recording
    setIsRecording(false);
  };
  const downloadVideo = () => {
    const blob = new Blob(recordedChunksRef.current, {
      type: 'video/webm',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (isRecording) {
        setIsRecording(false);
        stopRecording();
      } else {
        setIsRecording(true);
        startRecording();
      }
    }
  };

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }

    startCamera();

    return () => {
      const video = videoRef.current;

      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>
          PACKVISION
        </div>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1a1a1a',
          }}
        >
          Packaging Recorder
        </div>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}
        >
          U
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          display: 'flex',
          flex: 1,
          padding: '2rem',
          gap: '2rem',
          overflow: 'hidden',
        }}
      >
        {/* Left Column: Camera Feed */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          {/* Recording Indicator */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: isRecording ? '#ff4d4d' : '#888',
                boxShadow: isRecording ? '0 0 8px #ff4d4d' : 'none',
                transition: 'background-color 0.3s ease',
              }}
            />
            <span
              style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}
            >
              {isRecording ? 'REC' : 'STANDBY'}
            </span>
          </div>

          {/* Camera Overlay Corners */}
          {[
            {
              top: '40px',
              left: '40px',
              borderTop: '4px solid rgba(255,255,255,0.7)',
              borderLeft: '4px solid rgba(255,255,255,0.7)',
            },
            {
              top: '40px',
              right: '40px',
              borderTop: '4px solid rgba(255,255,255,0.7)',
              borderRight: '4px solid rgba(255,255,255,0.7)',
            },
            {
              bottom: '40px',
              left: '40px',
              borderBottom: '4px solid rgba(255,255,255,0.7)',
              borderLeft: '4px solid rgba(255,255,255,0.7)',
            },
            {
              bottom: '40px',
              right: '40px',
              borderBottom: '4px solid rgba(255,255,255,0.7)',
              borderRight: '4px solid rgba(255,255,255,0.7)',
            },
          ].map((style, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                ...style,
                zIndex: 5,
              }}
            />
          ))}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Right Column: Controls & Metadata */}
        <div
          style={{
            flex: '0 0 350px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Input Box */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <label
              style={{ fontSize: '0.9rem', fontWeight: '500', color: '#555' }}
            >
              Package ID / Note
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Enter details..."
              style={{
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Metadata Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              border: '1px solid #eaeaea',
            }}
          >
            <h3
              style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                color: '#333',
              }}
            >
              Session Metadata
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                fontSize: '0.9rem',
                color: '#666',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Date:</span>
                <span style={{ fontWeight: '500', color: '#333' }}>
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Time:</span>
                <span style={{ fontWeight: '500', color: '#333' }}>
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Camera:</span>
                <span style={{ fontWeight: '500', color: '#333' }}>
                  Logitech Brio
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Operator:</span>
                <span style={{ fontWeight: '500', color: '#333' }}>
                  User #42
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setIsRecording(true)}
              style={{
                flex: 1,
                padding: '1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                opacity: isRecording ? 0.7 : 1,
              }}
              disabled={isRecording}
            >
              START
            </button>
            <button
              onClick={() => setIsRecording(false)}
              style={{
                flex: 1,
                padding: '1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                opacity: !isRecording ? 0.7 : 1,
              }}
              disabled={!isRecording}
            >
              STOP
            </button>
            <button
              onClick={downloadVideo}
              style={{
                flex: 1,
                padding: '1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                opacity: !isRecording ? 0.7 : 1,
              }}
            >
              Download
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScannerRecordingPage;
