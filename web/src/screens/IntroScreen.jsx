import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, MapPin, Zap } from 'lucide-react';
import { theme } from '../theme/appTheme';

export default function IntroScreen({ onFinish }) {
  const [phase, setPhase] = useState(0); 

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 1900);
    const t4 = setTimeout(() => setPhase(4), 2800);
    const autoFinish = setTimeout(() => {
      if (onFinish) onFinish();
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(autoFinish);
    };
  }, [onFinish]);

  const brandLetters = ['B', 'O', 'K', 'I', 'V', 'O'];

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#F8FAFC', // Ultra-clean, modern light canvas
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: '#0F172A',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes floatMesh {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.08); }
        }
        @keyframes softPulse {
          0% { transform: scale(0.92); opacity: 0.6; }
          50% { transform: scale(1.12); opacity: 0.2; }
          100% { transform: scale(0.92); opacity: 0.6; }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes subtleShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Modern Light Mode Gradient Mesh Spheres */}
      <div
        style={{
          position: 'absolute',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 122, 0, 0.12) 0%, rgba(255, 158, 66, 0.04) 50%, transparent 70%)',
          top: '-10%',
          left: '15%',
          filter: 'blur(70px)',
          animation: 'floatMesh 10s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.12) 0%, rgba(45, 212, 191, 0.03) 50%, transparent 70%)',
          bottom: '-5%',
          right: '15%',
          filter: 'blur(80px)',
          animation: 'floatMesh 12s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30, 58, 95, 0.08) 0%, transparent 70%)',
          top: '35%',
          right: '35%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Geometric Dot Grid Pattern (Crisp Light Theme) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(rgba(15, 23, 42, 0.08) 1.2px, transparent 1.2px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
          pointerEvents: 'none',
        }}
      />

      {/* Center Interactive Glass Stage */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '48px 32px',
          maxWidth: '680px',
          width: '100%',
        }}
      >
        {/* Animated Brand Emblem & Floating Halo */}
        <div
          style={{
            position: 'relative',
            width: '160px',
            height: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
          }}
        >
          {/* Subtle Outer Orange/Teal Glow Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '50%',
              border: '2px dashed rgba(255, 122, 0, 0.25)',
              animation: 'softPulse 4s ease-in-out infinite',
              opacity: phase >= 1 ? 1 : 0,
              transition: 'opacity 0.8s ease',
            }}
          />

          {/* Frosted Aura behind the logo card */}
          <div
            style={{
              position: 'absolute',
              inset: '8px',
              borderRadius: '36px',
              background: 'linear-gradient(135deg, rgba(255, 122, 0, 0.25), rgba(13, 148, 136, 0.2))',
              filter: 'blur(16px)',
              opacity: phase >= 1 ? 0.8 : 0,
              transform: phase >= 1 ? 'scale(1)' : 'scale(0.6)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {/* Central Glossy Logo Card */}
          <div
            style={{
              position: 'relative',
              width: '124px',
              height: '124px',
              borderRadius: '32px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 20px 40px -10px rgba(15, 30, 54, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px',
              transform: phase >= 1 ? 'scale(1) rotate(0deg)' : 'scale(0.4) rotate(-15deg)',
              opacity: phase >= 1 ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: phase >= 2 ? 'logoFloat 4s ease-in-out infinite' : 'none',
            }}
          >
            <img
              src="/logo.png"
              alt="Bokivo Brand Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>

        {/* Brand Name Typography with Staggered Kinetic Reveal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '14px',
          }}
        >
          {brandLetters.map((letter, idx) => {
            const isVisible = phase >= 2;
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  fontSize: '3.6rem',
                  fontWeight: 900,
                  letterSpacing: '4px',
                  background: 'linear-gradient(135deg, #0F1E36 0%, #1E3A5F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(24px) scale(0.7)',
                  opacity: isVisible ? 1 : 0,
                  transition: `all 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.07}s`,
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>

        {/* Modern Clean Tagline with Orange & Teal Accents */}
        <p
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#64748B',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            margin: '0 0 32px 0',
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)',
            opacity: phase >= 3 ? 1 : 0,
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          Your Time, <span style={{ color: theme.colors.sunsetOrange, fontWeight: 900 }}>Simplified.</span>
        </p>

        {/* Translucent Glass Pill Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '40px',
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(18px)',
            opacity: phase >= 3 ? 1 : 0,
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
          }}
        >
          {[
            { icon: <MapPin size={15} color={theme.colors.sunsetOrange} />, text: 'City-wide Discovery' },
            { icon: <CheckCircle2 size={15} color="#10B981" />, text: 'Instant Appointments' },
            { icon: <ShieldCheck size={15} color="#0284C7" />, text: 'Verified Partners' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #E2E8F0',
                fontSize: '0.84rem',
                fontWeight: 800,
                color: theme.colors.primaryNavy,
                boxShadow: '0 4px 14px -2px rgba(15, 30, 54, 0.05)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Vibrant Orange Interactive "Get Started" CTA Button */}
        <button
          onClick={onFinish}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '999px',
            padding: '16px 40px',
            fontSize: '1rem',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 10px 25px -4px rgba(255, 122, 0, 0.38)',
            transform: phase >= 3 ? 'scale(1)' : 'scale(0.95)',
            opacity: phase >= 3 ? 1 : 0,
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 14px 30px -4px rgba(255, 122, 0, 0.48)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px -4px rgba(255, 122, 0, 0.38)';
          }}
        >
          <span>Get Started</span>
          <ArrowRight size={18} />
        </button>

        {/* Minimalist Light Progress Bar at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '180px',
            height: '4px',
            backgroundColor: '#E2E8F0',
            borderRadius: '999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #FF7A00 0%, #0D9488 100%)',
              borderRadius: '999px',
              width: phase === 0 ? '15%' : phase === 1 ? '40%' : phase === 2 ? '70%' : '100%',
              transition: 'width 0.8s ease-in-out',
            }}
          />
        </div>
      </div>
    </div>
  );
}
