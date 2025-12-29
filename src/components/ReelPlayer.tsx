import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export default function ReelPlayer({ video, thumbnail }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;

        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    return (
        <div className="w-full h-[60dvh] flex justify-center">
            <div className="relative w-80 h-full rounded-2xl overflow-hidden bg-black shadow-lg">

                {/* Video */}
                <video
                    ref={videoRef}
                    src={video}
                    className="w-full h-full object-cover"
                    loop
                    muted={isMuted}
                    playsInline
                    onClick={togglePlay}
                    poster={!isPlaying ? thumbnail : undefined}
                />

                {/* Play / Pause Button */}
                <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 transition"
                >
                    <div className="bg-white/30 w-10 h-10 flex items-center justify-center rounded-full">
                        {isPlaying ? (
                            <Pause className="w-5 h-5" />
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                    </div>
                </button>

                {/* Mute Button */}
                <button
                    onClick={toggleMute}
                    className="absolute bottom-3 right-3 bg-black/60 p-2 rounded-full text-white"
                >
                    {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                    ) : (
                        <Volume2 className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
}
