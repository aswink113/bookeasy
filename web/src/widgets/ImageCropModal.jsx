import React, { useState, useRef, useEffect } from 'react';
import { Crop, ZoomIn, ZoomOut, Check, X, Move, Sparkles } from 'lucide-react';
import { theme } from '../theme/appTheme';

/**
 * ImageCropModal
 * Allows merchant/partner to crop an image to the exact card aspect ratio (16:9 ~ 1.78)
 * using HTML5 Canvas with smooth pan and zoom controls.
 */
export default function ImageCropModal({ isOpen, imageSrc, onClose, onCropComplete, aspectRatio = 16 / 9 }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleGenerateCrop = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const outputWidth = 1200;
    const outputHeight = Math.round(1200 / aspectRatio); // 675 for 16:9

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Calculate scale factor between on-screen container and canvas output
    const scaleFactor = outputWidth / containerRect.width;

    // Calculate image position relative to container
    const relativeX = (imgRect.left - containerRect.left) * scaleFactor;
    const relativeY = (imgRect.top - containerRect.top) * scaleFactor;
    const scaledWidth = imgRect.width * scaleFactor;
    const scaledHeight = imgRect.height * scaleFactor;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, outputWidth, outputHeight);
    ctx.drawImage(img, relativeX, relativeY, scaledWidth, scaledHeight);

    // Export as high quality JPEG data URL
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '680px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(15, 30, 54, 0.3)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: theme.colors.sunsetOrangeLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Crop size={20} color={theme.colors.sunsetOrange} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
                Crop Partner Cover Photo
              </h3>
              <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>
                Fixed 16:9 widescreen ratio for crisp partner card display
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewport & Crop Frame Area */}
        <div
          style={{
            padding: '24px',
            backgroundColor: '#0F172A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            userSelect: 'none',
          }}
        >
          {/* 16:9 Viewport Box */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              width: '100%',
              maxWidth: '560px',
              aspectRatio: '16 / 9',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '16px',
              boxShadow: '0 0 0 2px #FF7A00, 0 10px 40px rgba(0,0,0,0.5)',
              cursor: isDragging ? 'grabbing' : 'grab',
              backgroundColor: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={() => setImageLoaded(true)}
              style={{
                position: 'absolute',
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                maxWidth: 'none',
                pointerEvents: 'none',
                willChange: 'transform',
                opacity: imageLoaded ? 1 : 0,
              }}
            />

            {/* Rule of Thirds Guide Grid */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gridTemplateRows: '1fr 1fr 1fr',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.25)', borderBottom: '1px dashed rgba(255, 255, 255, 0.25)' }} />
              <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.25)', borderBottom: '1px dashed rgba(255, 255, 255, 0.25)' }} />
              <div style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.25)' }} />
              <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.25)', borderBottom: '1px dashed rgba(255, 255, 255, 0.25)' }} />
              <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.25)', borderBottom: '1px dashed rgba(255, 255, 255, 0.25)' }} />
              <div style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.25)' }} />
              <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.25)' }} />
              <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.25)' }} />
              <div />
            </div>

            {/* Drag Hint Pill */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(4px)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                pointerEvents: 'none',
              }}
            >
              <Move size={12} color={theme.colors.sunsetOrange} /> Drag image to position
            </div>
          </div>
        </div>

        {/* Controls Bar: Zoom Slider */}
        <div style={{ padding: '20px 24px', backgroundColor: '#FFFFFF', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <ZoomOut size={18} color="#64748B" />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: theme.colors.sunsetOrange,
                cursor: 'pointer',
              }}
            />
            <ZoomIn size={18} color="#64748B" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.colors.primaryNavy, minWidth: '45px' }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: theme.radii.md,
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                color: theme.colors.textSecondary,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerateCrop}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: theme.radii.md,
                border: 'none',
                background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(255, 122, 0, 0.35)',
              }}
            >
              <Check size={18} />
              <span>Apply & Save 16:9 Cover</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

