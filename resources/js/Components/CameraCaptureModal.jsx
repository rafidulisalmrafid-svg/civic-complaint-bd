import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, SwitchCamera } from 'lucide-react';

export default function CameraCaptureModal({ isOpen, onClose, onCapture }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const nativeInputRef = useRef(null);

    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
    const [errorMsg, setErrorMsg] = useState(null);
    const [isInitializing, setIsInitializing] = useState(false);

    // Start live camera stream
    const startCamera = async (mode = facingMode) => {
        setIsInitializing(true);
        setErrorMsg(null);
        setCapturedImage(null);

        // Stop any active stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('BROWSER_UNSUPPORTED');
            }

            const constraints = {
                video: {
                    facingMode: { ideal: mode },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: false,
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsInitializing(false);
        } catch (err) {
            console.error('Camera access error:', err);
            setIsInitializing(false);

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setErrorMsg('ক্যামেরা ব্যবহারের অনুমতি দেওয়া হয়নি। অনুগ্রহ করে ব্রাউজার সেটিংসে গিয়ে ক্যামেরার অনুমতি দিন অথবা সরাসরি নিচের বাটনে চাপ দিন।');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setErrorMsg('আপনার ডিভাইসে কোনো উপযুক্ত ক্যামেরা পাওয়া যায়নি।');
            } else {
                setErrorMsg('সরাসরি ক্যামেরা চালু করতে সমস্যা হয়েছে। অনুগ্রহ করে নিচের বোতামটি ব্যবহার করে সরাসরি মোবাইল ক্যামেরা দিয়ে ছবি তুলুন।');
            }
        }
    };

    // Initialize or stop camera when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            startCamera(facingMode);
        } else {
            stopCamera();
            setCapturedImage(null);
            setErrorMsg(null);
        }

        return () => {
            stopCamera();
        };
    }, [isOpen]);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    // Toggle Front / Back camera
    const toggleCamera = () => {
        const nextMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(nextMode);
        startCamera(nextMode);
    };

    // Capture photo from video stream
    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], `evidence_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const previewUrl = URL.createObjectURL(blob);
            setCapturedImage({ file, previewUrl });
            stopCamera();
        }, 'image/jpeg', 0.92);
    };

    // Handle native mobile capture input fallback
    const handleNativeFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setCapturedImage({ file, previewUrl });
            stopCamera();
        }
    };

    // Confirm photo and add to complaint form
    const confirmPhoto = () => {
        if (capturedImage?.file) {
            onCapture(capturedImage.file);
            onClose();
        }
    };

    // Retake photo
    const retakePhoto = () => {
        if (capturedImage?.previewUrl) {
            URL.revokeObjectURL(capturedImage.previewUrl);
        }
        setCapturedImage(null);
        startCamera(facingMode);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Camera className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900">সরাসরি ক্যামেরা দিয়ে ছবি তুলুন</h3>
                            <p className="text-[11px] text-slate-500">ঘটনাস্থলের সরাসরি ছবি প্রমাণ হিসেবে সংযুক্ত করুন</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Viewfinder Area */}
                <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
                    {/* Live Stream View */}
                    {!capturedImage && !errorMsg && (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            {isInitializing && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs gap-2">
                                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                                    <span>ক্যামেরা চালু হচ্ছে...</span>
                                </div>
                            )}

                            {/* Camera overlay switch button */}
                            <button
                                type="button"
                                onClick={toggleCamera}
                                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full backdrop-blur-xs transition-colors"
                                title="ক্যামেরা পরিবর্তন করুন"
                            >
                                <SwitchCamera className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* Captured Image Preview */}
                    {capturedImage && (
                        <img
                            src={capturedImage.previewUrl}
                            alt="Captured Evidence"
                            className="w-full h-full object-contain bg-black"
                        />
                    )}

                    {/* Permission or Device Error Screen */}
                    {errorMsg && !capturedImage && (
                        <div className="p-6 text-center text-white space-y-4">
                            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed px-4">{errorMsg}</p>

                            {/* Native Mobile Camera Trigger */}
                            <button
                                type="button"
                                onClick={() => nativeInputRef.current?.click()}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-transform active:scale-95"
                            >
                                <Camera className="w-4 h-4" />
                                <span>মোবাইল ক্যামেরা চালু করুন</span>
                            </button>
                        </div>
                    )}

                    {/* Hidden canvas for image rendering */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Hidden direct native capture input (strictly camera, no gallery) */}
                    <input
                        ref={nativeInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleNativeFileChange}
                    />
                </div>

                {/* Footer Controls */}
                <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between">
                    {!capturedImage ? (
                        <>
                            {/* Native camera trigger button */}
                            <button
                                type="button"
                                onClick={() => nativeInputRef.current?.click()}
                                className="text-xs font-semibold text-slate-600 hover:text-slate-800 underline underline-offset-4"
                            >
                                সরাসরি ফোন ক্যামেরা
                            </button>

                            {/* Shutter Button */}
                            <button
                                type="button"
                                disabled={isInitializing || !!errorMsg}
                                onClick={takePhoto}
                                className="w-14 h-14 rounded-full border-4 border-emerald-600 bg-white hover:bg-emerald-50 flex items-center justify-center shadow-lg transition-transform active:scale-90 disabled:opacity-50"
                                title="ছবি তুলুন"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-600" />
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                বাতিল
                            </button>
                        </>
                    ) : (
                        <div className="w-full flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={retakePhoto}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>পুনরায় তুলুন</span>
                            </button>

                            <button
                                type="button"
                                onClick={confirmPhoto}
                                className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                <span>ছবি নিশ্চিত করুন</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
