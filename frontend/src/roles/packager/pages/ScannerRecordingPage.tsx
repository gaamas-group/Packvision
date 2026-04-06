import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

const ScannerRecordingPage = () => {
  const { user, logout } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const scanBufferRef = useRef('');
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [activeScanCode, setActiveScanCode] = useState<string | null>(null);
  const activeScanCodeRef = useRef<string | null>(null);
  const userUsernameRef = useRef<string | undefined>(user?.username);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    activeScanCodeRef.current = activeScanCode;
  }, [activeScanCode]);

  useEffect(() => {
    userUsernameRef.current = user?.username;
  }, [user?.username]);
  const [isRecording, setIsRecording] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const canStartRecording = inputValue.trim().length > 0;
  const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB
  const MULTIPART_THRESHOLD = 100 * 1024 * 1024; // 100 MB
  const MAX_RETRIES = 3;
  const isAdmin = user?.role === 'admin';

  const startRecording = () => {

    recordedChunksRef.current = [];
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas ref not set");
      return;
    }
    const canvasStream = (canvas as any).captureStream(30) as MediaStream;

    const mediaRecorder = new MediaRecorder(
      canvasStream,
      {
        mimeType: 'video/webm; codecs=vp8',
      },
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
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = () => {
      const videoBlob = new Blob(recordedChunksRef.current, {
        type: 'video/webm',
      });

      uploadVideo(videoBlob);
      setInputValue('');
      setActiveScanCode(null);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    };

    mediaRecorderRef.current.stop();
  };

  //common function to save metadata
  const saveRecordingMetadata = async (blob: Blob, key: string) => {
    try {
      await axios.post('/recordings', {
        package_code: inputValue || 'PKG-UNKNOWN',
        duration: Math.round(blob.size / (1024 * 512)),
        file_size: blob.size,
        object_key: key,
        started_at: new Date(Date.now() - 10000).toISOString(),
        ended_at: new Date().toISOString(),
      });
      alert('Recording saved successfully!');
    } catch (error) {
      console.error('Failed to save metadata:', error);
      throw new Error('DB save failed');
    }
  };

  //function to upload normal video
  const uploadSingle = async (blob: Blob) => {
    const response = await axios.post('/videos/upload-url', {
      filename: `recording-${Date.now()}.webm`,
      contentType: 'video/webm',
      package_code: inputValue,
    });

    const { uploadUrl, key } = response.data;

    await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'video/webm' },
    });

    await saveRecordingMetadata(blob, key);
  };

  //function to upload large video
  const uploadMultipart = async (blob: Blob) => {
    console.log('Using multipart upload');

    // 1️⃣ INIT
    const initRes = await axios.post('/videos/multipart/init', {
      contentType: 'video/webm',
      package_code: inputValue,
    });

    const { uploadId, key } = initRes.data;

    const totalParts = Math.ceil(blob.size / CHUNK_SIZE);
    const uploadedParts: { PartNumber: number; ETag: string }[] = [];

    // 2️⃣ UPLOAD PARTS
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, blob.size);
      const chunk = blob.slice(start, end);

      let attempt = 0;

      while (attempt < MAX_RETRIES) {
        try {
          // Get presigned URL
          const urlResponse = await axios.post('/videos/multipart/part-url', {
            key,
            uploadId,
            partNumber,
          });
          const { url } = urlResponse.data;

          const res = await fetch(url, {
            method: 'PUT',
            body: chunk,
          });

          if (!res.ok) throw new Error('Part upload failed');

          const etag = res.headers.get('ETag')!;
          uploadedParts.push({ PartNumber: partNumber, ETag: etag });

          console.log(`Uploaded part ${partNumber}/${totalParts}`);
          break;
        } catch (err) {
          attempt++;
          if (attempt === MAX_RETRIES) throw err;
        }
      }
    }

    // 3️⃣ COMPLETE
    await axios.post('/videos/multipart/complete', {
      key,
      uploadId,
      parts: uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber),
    });

    await saveRecordingMetadata(blob, key);
  };

  //upload function
  const uploadVideo = async (blob: Blob) => {
    try {
      console.log('Uploading video, size:', blob.size);

      if (blob.size < MULTIPART_THRESHOLD) {
        return uploadSingle(blob);
      }

      return uploadMultipart(blob);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    }
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
    // Ignore modifier keys
    if (e.key.length === 1) {
      scanBufferRef.current += e.key;
      return;
    }

    if (e.key !== 'Enter') return;

    const scannedValue = scanBufferRef.current.trim();
    scanBufferRef.current = ''; // reset buffer

    if (!scannedValue) return;

    const recorder = mediaRecorderRef.current;

    // 🔴 START
    if (!recorder || recorder.state === 'inactive') {
      setInputValue(scannedValue);
      setActiveScanCode(scannedValue);
      setIsRecording(true);
      startRecording();
      return;
    }

    // 🟢 STOP only if EXACT MATCH
    if (recorder.state === 'recording') {
      if (scannedValue === activeScanCode) {
        stopRecording();
        setIsRecording(false);
      } else {
        console.warn(
          `Mismatched barcode ignored: ${scannedValue} !== ${activeScanCode}`,
        );
      }
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleBlur = () => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  useEffect(() => {
    let animationFrameId: number;

    const drawFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Initialize dimensions
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const render = () => {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }
        }
        
        if (canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const now = new Date();
          const timestamp = now.toLocaleString();

          // Bottom right Timestamp
          ctx.font = '24px Arial';
          ctx.fillStyle = 'red';
          ctx.textAlign = 'right';
          ctx.fillText(timestamp, canvas.width - 20, canvas.height - 30);

          // Top left Audit Info
          ctx.textAlign = 'left';
          if (activeScanCodeRef.current) {
            ctx.fillText(`Code: ${activeScanCodeRef.current}`, 20, 40);
          }
          if (userUsernameRef.current) {
            ctx.fillText(`User: ${userUsernameRef.current}`, 20, 70);
          }
        }

        animationFrameId = requestAnimationFrame(render);
      };

      render();
    };

    async function startCamera() {
      inputRef.current?.focus();
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
          videoRef.current.onloadedmetadata = () => {
            videoRef.current!.play();
            drawFrame();
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }

    startCamera();
    inputRef.current?.focus();

    return () => {
      const video = videoRef.current;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Sidebar for Admin */}
      {isAdmin && <AdminSidebar />}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-8 shadow-sm">
          <div className="font-bold text-xl tracking-tight text-foreground">
            PACKVISION
          </div>
          <div className="flex-1 text-center text-2xl font-semibold text-foreground/90 tracking-wide">
            Packaging Recorder
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shadow-md">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            {!isAdmin && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex flex-1 p-8 gap-8 overflow-hidden bg-background">
          {/* Left Column: Camera Feed */}
          <div className="flex-1 bg-black rounded-xl overflow-hidden relative flex items-center justify-center shadow-lg border border-border">
            {/* Recording Indicator */}
            <div className="absolute top-5 left-5 flex items-center gap-3 z-10 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <div
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300',
                  isRecording
                    ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'
                    : 'bg-zinc-500',
                )}
              />
              <span className="text-white text-sm font-medium tracking-wide">
                {isRecording ? 'REC' : 'STANDBY'}
              </span>
            </div>

            {/* Camera Overlay Corners */}
            <div className="absolute top-10 left-10 w-10 h-10 border-t-4 border-l-4 border-white/70 z-10 pointer-events-none rounded-tl-lg" />
            <div className="absolute top-10 right-10 w-10 h-10 border-t-4 border-r-4 border-white/70 z-10 pointer-events-none rounded-tr-lg" />
            <div className="absolute bottom-10 left-10 w-10 h-10 border-b-4 border-l-4 border-white/70 z-10 pointer-events-none rounded-bl-lg" />
            <div className="absolute bottom-10 right-10 w-10 h-10 border-b-4 border-r-4 border-white/70 z-10 pointer-events-none rounded-br-lg" />

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Hidden canvas for capturing video + timestamp frames */}
            <canvas ref={canvasRef} className="absolute opacity-0 pointer-events-none" />
          </div>

          {/* Right Column: Controls & Metadata */}
          <div className="flex-none w-[350px] flex flex-col gap-6">
            {/* Input Box */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Package ID / Note
              </label>
              <input
                ref={inputRef}
                readOnly={isRecording}
                type="text"
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Enter details..."
                className="p-3 rounded-lg border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground shadow-sm"
                onBlur={handleBlur}
              />
            </div>

            {/* Metadata Card */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h3 className="m-0 mb-4 text-lg font-semibold text-foreground">
                Session Metadata
              </h3>
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span>Date:</span>
                  <span className="font-medium text-foreground">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span>Time:</span>
                  <span className="font-medium text-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span>Camera:</span>
                  <span className="font-medium text-foreground">
                    Logitech Brio
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Operator:</span>
                  <span className="font-medium text-foreground">
                    {user?.username || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-auto">
              <button
                onClick={() => {
                  setIsRecording(true);
                  startRecording();
                }}
                disabled={isRecording || !canStartRecording}
                className={cn(
                  'flex-1 py-4 px-6 rounded-lg font-semibold text-white shadow-md transition-all transform active:scale-95',
                  isRecording || !canStartRecording
                    ? 'bg-zinc-600 opacity-50 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg',
                )}
              >
                START
              </button>
              <button
                onClick={() => {
                  setIsRecording(false);
                  stopRecording();
                }}
                disabled={!isRecording}
                className={cn(
                  'flex-1 py-4 px-6 rounded-lg font-semibold text-white shadow-md transition-all transform active:scale-95',
                  !isRecording
                    ? 'bg-zinc-600 opacity-50 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-lg',
                )}
              >
                STOP
              </button>
            </div>
            <button
              onClick={downloadVideo}
              className="w-full py-3 rounded-lg font-medium text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm transition-colors"
            >
              Download Recording
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ScannerRecordingPage;
