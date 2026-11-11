import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { resolveAssetUrl, useExperienceEngine } from "../../experience-engine";

interface ProfilePhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export default function ProfilePhotoViewer({
  isOpen,
  onClose,
  triggerRef,
}: ProfilePhotoViewerProps) {
  const { reducedMotion } = useExperienceEngine();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    resetZoom();
    onClose();
  }, [resetZoom, onClose]);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const previousActive = document.activeElement as HTMLElement | null;
    const triggerElement = triggerRef?.current;

    // Focus first interactive control in dialog
    const focusTimer = setTimeout(() => {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      const restoreTarget = triggerElement || previousActive;
      if (restoreTarget && typeof restoreTarget.focus === "function") {
        restoreTarget.focus();
      }
    };
  }, [isOpen, handleClose, triggerRef]);

  // Wheel zoom handler on the image container (non-passive)
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container || !isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.25 : -0.25;
      setScale((prev) => {
        const next = Math.min(Math.max(prev + zoomFactor, 1), 4);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pinch and pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist - touchDistanceRef.current;
      touchDistanceRef.current = dist;
      setScale((prev) => {
        const next = Math.min(Math.max(prev + delta * 0.01, 1), 4);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
    setIsDragging(false);
  };

  if (!isOpen) return null;

  const content = (
    <div
      className="profile-viewer-backdrop"
      onClick={handleClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="profile-viewer-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Full-Size Profile Photograph Viewer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Controls Bar */}
        <div className="profile-viewer-toolbar">
          <div className="profile-viewer-zoom-controls">
            <button
              type="button"
              className="profile-viewer-btn"
              onClick={handleZoomIn}
              disabled={scale >= 4}
              title="Zoom in (+)"
              aria-label="Zoom in photograph"
            >
              <ZoomIn size={18} />
            </button>
            <span className="profile-viewer-scale-text">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              className="profile-viewer-btn"
              onClick={handleZoomOut}
              disabled={scale <= 1}
              title="Zoom out (-)"
              aria-label="Zoom out photograph"
            >
              <ZoomOut size={18} />
            </button>
            <button
              type="button"
              className="profile-viewer-btn"
              onClick={resetZoom}
              disabled={scale === 1 && position.x === 0 && position.y === 0}
              title="Reset view (Double-click/tap)"
              aria-label="Reset zoom and center photograph"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <button
            type="button"
            className="profile-viewer-close-btn"
            onClick={onClose}
            title="Close viewer (Esc)"
            aria-label="Close photograph viewer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Viewport & Interactive Image Container */}
        <div
          ref={imageContainerRef}
          className={`profile-viewer-stage ${scale > 1 ? "is-zoomed" : ""}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={resetZoom}
        >
          <img
            src={resolveAssetUrl("/assets/aistudio/Kamalesh_S_P_bc8ac915.png")}
            alt="Kamalesh Suresh Kumar — Original High Resolution Profile Photograph"
            className={`profile-viewer-img ${reducedMotion ? "reduced-motion" : ""}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
