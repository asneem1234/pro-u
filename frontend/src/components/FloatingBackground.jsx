import { useState, useEffect } from 'react';

const FloatingBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredOrb, setHoveredOrb] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const orbs = [
    { id: 1, size: 300, x: '10%', y: '20%', color: 'emerald', delay: 0 },
    { id: 2, size: 200, x: '80%', y: '10%', color: 'amber', delay: 2 },
    { id: 3, size: 250, x: '70%', y: '60%', color: 'emerald', delay: 4 },
    { id: 4, size: 180, x: '20%', y: '70%', color: 'teal', delay: 1 },
    { id: 5, size: 150, x: '50%', y: '40%', color: 'amber', delay: 3 },
    { id: 6, size: 120, x: '85%', y: '85%', color: 'emerald', delay: 5 },
    { id: 7, size: 100, x: '5%', y: '50%', color: 'yellow', delay: 2.5 },
    { id: 8, size: 80, x: '40%', y: '80%', color: 'teal', delay: 1.5 },
  ];

  const getOrbColors = (color, isHovered) => {
    const colors = {
      emerald: {
        base: 'from-emerald-400/20 to-emerald-600/10',
        glow: 'from-emerald-400/50 to-emerald-500/30',
        shadow: 'shadow-emerald-500/50',
      },
      amber: {
        base: 'from-amber-400/20 to-yellow-500/10',
        glow: 'from-amber-400/50 to-yellow-400/30',
        shadow: 'shadow-amber-500/50',
      },
      teal: {
        base: 'from-teal-400/20 to-cyan-500/10',
        glow: 'from-teal-400/50 to-cyan-400/30',
        shadow: 'shadow-teal-500/50',
      },
      yellow: {
        base: 'from-yellow-300/20 to-orange-400/10',
        glow: 'from-yellow-300/50 to-orange-300/30',
        shadow: 'shadow-yellow-500/50',
      },
    };
    return isHovered ? colors[color].glow : colors[color].base;
  };

  const getShadowColor = (color) => {
    const shadows = {
      emerald: 'shadow-emerald-500/60',
      amber: 'shadow-amber-500/60',
      teal: 'shadow-teal-500/60',
      yellow: 'shadow-yellow-500/60',
    };
    return shadows[color];
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient base layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating orbs */}
      {orbs.map((orb) => {
        const isHovered = hoveredOrb === orb.id;
        return (
          <div
            key={orb.id}
            className={`
              absolute rounded-full pointer-events-auto cursor-pointer
              bg-gradient-to-br ${getOrbColors(orb.color, isHovered)}
              backdrop-blur-3xl transition-all duration-500 ease-out
              ${isHovered ? `shadow-2xl ${getShadowColor(orb.color)} scale-125` : 'shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50'}
            `}
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              animation: `float ${8 + orb.delay}s ease-in-out infinite`,
              animationDelay: `${orb.delay}s`,
              transform: isHovered 
                ? 'scale(1.25) translateZ(0)' 
                : 'scale(1) translateZ(0)',
            }}
            onMouseEnter={() => setHoveredOrb(orb.id)}
            onMouseLeave={() => setHoveredOrb(null)}
          />
        );
      })}

      {/* Mouse follow gradient */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          left: mousePos.x - 192,
          top: mousePos.y - 192,
        }}
      />

      {/* CSS Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(2deg);
          }
          50% {
            transform: translateY(-10px) translateX(-10px) rotate(-1deg);
          }
          75% {
            transform: translateY(-25px) translateX(5px) rotate(1deg);
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingBackground;
