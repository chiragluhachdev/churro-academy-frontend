"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

interface IntroModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Cinematic lightbox for the 60-second Churro Academy intro animation.
 * Opens with a scale-up effect, plays background music, closes with fade-out.
 */
export function IntroModal({ open, onClose }: IntroModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fade out audio over ~600ms then pause
  const fadeOutAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;

    const step = 0.05;
    const interval = setInterval(() => {
      if (audio.volume > step) {
        audio.volume -= step;
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(interval);
      }
    }, 30);
  }, []);

  const handleClose = useCallback(() => {
    fadeOutAudio();
    onClose();
  }, [fadeOutAudio, onClose]);

  // Play/stop music when modal opens/closes
  useEffect(() => {
    if (open) {
      // Create or reuse the audio element
      if (!audioRef.current) {
        audioRef.current = new Audio("/intro-music.mp3");
        audioRef.current.loop = true;
      }
      const audio = audioRef.current;
      audio.volume = 0.35;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Autoplay may be blocked — that's fine, the intro still works without music
      });
    }

    return () => {
      // Cleanup on unmount
      if (!open && audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [open]);

  // Sync audio with iframe scrubbing events
  useEffect(() => {
    if (!open) return;
    const handleMessage = (e: MessageEvent) => {
      const audio = audioRef.current;
      if (!audio) return;
      
      if (e.data?.type === "SCRUB") {
        audio.currentTime = e.data.time;
        audio.pause();
      } else if (e.data?.type === "PLAY") {
        audio.play().catch(() => {});
      } else if (e.data?.type === "REPLAY") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Modal content */}
          <motion.div
            className="relative z-10 w-full max-w-[1020px]"
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close intro video"
              className="absolute -top-12 right-0 z-20 flex size-10 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:text-white sm:-right-12 sm:top-0"
            >
              <X className="size-6" />
            </button>

            {/* Iframe container with 16:9 aspect ratio */}
            <div className="relative overflow-hidden rounded-xl shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
              <div className="aspect-[16/9]">
                <iframe
                  src="/intro.html"
                  title="Churro Academy — 60s Intro"
                  className="absolute inset-0 size-full border-0"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Subtle label */}
            <p className="mt-4 text-center text-[0.78rem] font-medium tracking-wide text-white/45">
              CHURRO ACADEMY · INTRO
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
