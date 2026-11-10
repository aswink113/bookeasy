import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { theme } from '../theme/appTheme';

export default function IntroScreen({ onFinish }) {
  const [phase, setPhase] = useState(0); 
  // Phase 0: Initial dark reveal & particle pulse (0 - 800ms)
  // Phase 1: Logo 3D tilt & radiant neon glow burst (800 - 1800ms)
  // Phase 2: Letter-by-letter brand name reveal "B O K I V O" (1800 - 2800ms)
  // Phase 3: Tagline & feature pills cascade (2800 - 3800ms)
  // Phase 4: Ready / smooth exit transition (4000ms+)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setPhase(3), 2300);
    const t4 = setTimeout(() => setPhase(4), 3400);
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
        backgroundColor: '#070D19',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: '#FFFFFF',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes floatGlow {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.45; }
          50% { transform: translateY(-20px) scale(1.08); opacity: 0.7; }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.85); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.3; }
          100% { transform: scale(0.85); opacity: 0.8; }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }
        @keyframes shimmerBorder {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(56, 182, 255, 0.4), 0 0 40px rgba(56, 182, 255, 0.2); }
          50% { text-shadow: 0 0 35px rgba(56, 182, 255, 0.8), 0 0 70px rgba(56, 182, 255, 0.4); }
        }
      `}</style>

      {/* Dynamic Ambient Background Glow Elements */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 182, 255, 0.3) 0%, rgba(15, 23, 42, 0) 70%)',
          top: '15%',
          left: '25%',
          filter: 'blur(80px)',
          animation: 'floatGlow 8s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.22) 0%, rgba(15, 23, 42, 0) 70%)',
          bottom: '10%',
          right: '20%',
          filter: 'blur(90px)',
          animation: 'floatGlow 9s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }}
      />

      {/* Cyber Grid Pattern Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '24px',
          maxWidth: '680px',
          width: '100%',
        }}
      >
        {/* Animated Rotating Halo Rings */}
        <div
          style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          {/* Outer Pulsing Glow Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-12px',
              borderRadius: '50%',
              border: '2px dashed rgba(56, 182, 255, 0.35)',
              animation: 'pulseRing 3s ease-in-out infinite',
              opacity: phase >= 1 ? 1 : 0,
              transition: 'opacity 1s ease',
            }}
          />

          {/* Glowing Aura backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: '10px',
              borderRadius: '32px',
              background: 'linear-gradient(135deg, rgba(56, 182, 255, 0.4), rgba(249, 115, 22, 0.4))',
              filter: 'blur(20px)',
              opacity: phase >= 1 ? 0.9 : 0,
              transform: phase >= 1 ? 'scale(1)' : 'scale(0.5)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {/* Central Animated Logo Container */}
          <div
            style={{
              position: 'relative',
              width: '130px',
              height: '130px',
              borderRadius: '32px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(56, 182, 255, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              transform: phase >= 1 ? 'scale(1) rotate(0deg)' : 'scale(0.2) rotate(-20deg)',
              opacity: phase >= 1 ? 1 : 0,
              transition: 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: phase >= 2 ? 'logoFloat 4s ease-in-out infinite' : 'none',
            }}
          >
            <img
              src="/logo.png"
              alt="Bokivo Brand"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
              }}
            />
          </div>
        </div>

        {/* Brand Name with Staggered Letter Reveal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '16px',
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
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(30px) scale(0.6)',
                  opacity: isVisible ? 1 : 0,
                  transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.08}s`,
                  animation: phase >= 3 ? 'textGlow 3s ease-in-out infinite' : 'none',
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>

        {/* Tagline Animation */}
        <p
          style={{
            fontSize: '1.25rem',
            fontWeight: 400,
            color: '#94A3B8',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            margin: '0 0 28px 0',
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(20px)',
            opacity: phase >= 3 ? 1 : 0,
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          Your Time, <span style={{ color: '#38B6FF', fontWeight: 800 }}>Simplified.</span>
        </p>

        {/* Dynamic Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '40px',
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(20px)',
            opacity: phase >= 3 ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
          }}
        >
          {[
            { icon: <MapPin size={14} color="#38B6FF" />, text: 'Worldwide Discovery' },
            { icon: <CheckCircle2 size={14} color="#10B981" />, text: 'Instant Appointments' },
            { icon: <ShieldCheck size={14} color="#F97316" />, text: 'Verified Partners' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#E2E8F0',
                backdropFilter: 'blur(8px)',
              }}
            >
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Enter / Skip Interactive Button */}
        <button
          onClick={onFinish}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: phase >= 3 ? '#38B6FF' : 'transparent',
            color: phase >= 3 ? '#070D19' : '#FFFFFF',
            border: phase >= 3 ? 'none' : '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '999px',
            padding: '14px 34px',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: phase >= 3 ? '0 0 35px rgba(56, 182, 255, 0.5)' : 'none',
            transform: phase >= 3 ? 'scale(1)' : 'scale(0.95)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.06)';
            e.currentTarget.style.boxShadow = '0 0 45px rgba(56, 182, 255, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 35px rgba(56, 182, 255, 0.5)';
          }}
        >
          <span>Get Started</span>
          <ArrowRight size={18} />
        </button>

        {/* Elegant Progress bar at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '180px',
            height: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#38B6FF',
              borderRadius: '2px',
              width: phase === 0 ? '15%' : phase === 1 ? '40%' : phase === 2 ? '70%' : '100%',
              transition: 'width 0.9s ease-in-out',
              boxShadow: '0 0 10px #38B6FF',
            }}
          />
        </div>
      </div>
    </div>
  );
}
