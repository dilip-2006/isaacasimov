import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface CameraCaptureProps {
  onCapture: (imageData: string | null) => void;
  label?: string;
  previewImage?: string | null;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onCapture, 
  label = "Capture Photo",
  previewImage = null 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(previewImage);
  const [error, setError] = useState<string | null>(null);

  // Clean up media stream when component unmounts or stops
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  // Sync internal state if external preview changes
  useEffect(() => {
    if (previewImage) {
      setCapturedImage(previewImage);
    }
  }, [previewImage]);

  const startCamera = async () => {
    setError(null);
    setCapturedImage(null);
    setIsActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true // Use default camera to prevent OverconstrainedError on desktops
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Could not access camera. Please check permissions.");
      setIsActive(false);
    }
  };

  useEffect(() => {
    if (isActive && videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isActive]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Target max dimension to save storage space
      const MAX_WIDTH = 400;
      const scale = MAX_WIDTH / video.videoWidth;
      
      canvas.width = MAX_WIDTH;
      canvas.height = video.videoHeight * scale;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw downscaled frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to highly compressed JPEG base64
        const imageData = canvas.toDataURL('image/jpeg', 0.6);
        setCapturedImage(imageData);
        onCapture(imageData);
        
        // Turn off camera right after shooting to save battery and resources
        stopStream();
        setIsActive(false);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    onCapture(null);
    startCamera();
  };

  const cancelCapture = () => {
    stopStream();
    setIsActive(false);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-peacock-400 mb-1">{label}</label>
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Captured Image View */}
      {capturedImage && !isActive && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-xl overflow-hidden border border-peacock-500/30 bg-dark-700 aspect-video flex items-center justify-center max-w-sm"
        >
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent flex items-end justify-center pb-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <button 
              type="button"
              onClick={retakePhoto}
              className="flex items-center gap-2 px-4 py-2 bg-dark-800/80 backdrop-blur text-white rounded-lg hover:bg-dark-700 transition-colors shadow-lg border border-dark-600"
            >
              <RefreshCw className="w-4 h-4" />
              Retake
            </button>
          </div>
        </motion.div>
      )}

      {/* Active Camera View */}
      {isActive && !capturedImage && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="relative rounded-xl overflow-hidden border border-peacock-500/50 bg-black aspect-video max-w-sm"
        >
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              type="button"
              onClick={cancelCapture}
              className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-sm shadow-xl transition-transform hover:scale-105 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="p-3 bg-peacock-500 hover:bg-peacock-400 text-white rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              <div className="p-1 border-2 border-white rounded-full">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* Initial Trigger Button */}
      {!isActive && !capturedImage && (
        <button
          type="button"
          onClick={startCamera}
          className="w-full max-w-sm flex items-center justify-center gap-2 py-4 border-2 border-dashed border-dark-600 rounded-xl text-dark-400 hover:text-peacock-400 hover:border-peacock-500/50 hover:bg-peacock-500/5 transition-all duration-300 group"
        >
          <div className="p-3 bg-dark-700 rounded-lg group-hover:bg-peacock-500/20 group-hover:text-peacock-400 transition-colors">
            <Camera className="w-6 h-6" />
          </div>
          <span className="font-medium">Open Camera</span>
        </button>
      )}

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
