"use client";
import CreditsModal from "@/components/CreditsModal";
import React, { useState, useEffect, useRef } from "react";
import * as THREE from 'three';
import { useRouter } from "next/navigation";

export default function QuantumMazeMenu() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showCredits, setShowCredits] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showGame, setShowGame] = useState(false);
  const canvasRef = useRef(null);
  const router = useRouter();

  const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_PASSWORD;
  
  const menuItems = [
    { label: "START GAME", action: "start" },
    { label: "CREDITS", action: "credits" },
    { label: "EXIT", action: "exit" }
  ];

  // Three.js Globe Animation
  useEffect(() => {
    if (!canvasRef.current || showPassword || showCredits) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    
    renderer.setSize(600, 600);
    renderer.setClearColor(0x0a1628, 0);
    camera.position.z = 3;

    // Create pixelated globe geometry
    const geometry = new THREE.SphereGeometry(1.2, 16, 16);
    
    // Create wireframe material with cyan color
    const material = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add points for pixelated effect
    const pointsGeometry = new THREE.SphereGeometry(1.21, 16, 16);
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x00d9ff,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);

    // Add inner glow sphere
    const glowGeometry = new THREE.SphereGeometry(1.15, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      globe.rotation.y += 0.003;
      globe.rotation.x += 0.001;
      points.rotation.y += 0.002;
      points.rotation.x += 0.001;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      renderer.dispose();
    };
  }, [showPassword, showCredits]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showPassword || showCredits || showGame) return;
      
      if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
      } else if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "Enter") {
        handleSelect();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, showPassword, showCredits, showGame]);

  const handleSelect = () => {
    const action = menuItems[selectedIndex].action;
    
    if (action === "start") {
      setShowPassword(true);
    } else if (action === "credits") {
      setShowCredits(true);
    } else if (action === "exit") {
      window.close();
    }
  };

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem("maze_access", "granted");
      router.push("/game");
    } else {
      setPasswordError("ACCESS DENIED!");
      setTimeout(() => setPasswordError(""), 2000);
      setPassword("");
    }
  };

  const handlePasswordKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePasswordSubmit();
    }
  };



  return (
    <div className="min-h-screen bg-[#0a1628] relative overflow-hidden">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixelated { font-family: 'Press Start 2P', monospace; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(0.8); opacity: 1; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
      
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5), rgba(0,0,0,0.5) 1px, transparent 1px, transparent 2px)'
        }}
      />
      
      <div className="flex h-screen">
        {/* LEFT SIDE - Menu */}
        <div className="w-1/2 flex items-center justify-center p-8 relative z-10">
          <div className="w-full max-w-xl">
            {/* Title Box */}
            <div className=" p-8 mb-12 ">
              <h1 className="text-5xl md:text-6xl text-cyan-400 tracking-wider pixelated" >
                Quantum Maze
              </h1>
            </div>
            
            {/* Menu */}
            <div className="space-y-4">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    setSelectedIndex(index);
                    handleSelect();
                  }}
                  className={`
                    border-2 p-4 cursor-pointer transition-all duration-200
                    ${selectedIndex === index 
                      ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_20px_rgba(0,217,255,0.6)] translate-x-4' 
                      : 'border-cyan-600 bg-[#1a2742]/50 hover:border-cyan-500 hover:bg-cyan-400/10'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl ${selectedIndex === index ? 'text-cyan-400 animate-pulse' : 'text-transparent'}`}>
                      ▶
                    </span>
                    <span 
                      className={`text-xl pixelated ${selectedIndex === index ? 'text-white' : 'text-cyan-300'}`}
                      style={{ 
                        textShadow: selectedIndex === index ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Instructions */}
            <div className="mt-12 space-y-2">
              <p className="text-cyan-500 text-xs flex items-center gap-4 pixelated">
                <span className="flex items-center gap-2">
                  <span className="w-8 h-8 border-2 border-cyan-500 flex items-center justify-center">O</span>
                  SELECT
                </span>
              </p>
              <p className="text-cyan-600 text-xs pixelated">
                USE ARROW KEYS + ENTER
              </p>
            </div>
          </div>
        </div>
        
        {/* RIGHT SIDE - Animated Visualization */}
        <div className="w-1/2 flex items-center justify-center p-8 relative">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Three.js Canvas for Globe */}
            <canvas 
              ref={canvasRef} 
              className="w-[600px] h-[600px]"
              style={{ filter: 'drop-shadow(0 0 50px rgba(0, 217, 255, 0.5))' }}
            />
            
            {/* Grid lines background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="w-full h-px bg-cyan-400 absolute top-1/4"></div>
              <div className="w-full h-px bg-cyan-400 absolute top-2/4"></div>
              <div className="w-full h-px bg-cyan-400 absolute top-3/4"></div>
              <div className="w-px h-full bg-cyan-400 absolute left-1/4"></div>
              <div className="w-px h-full bg-cyan-400 absolute left-2/4"></div>
              <div className="w-px h-full bg-cyan-400 absolute left-3/4"></div>
            </div>
            
            {/* Floating text */}
            <div className="absolute bottom-20 text-center pointer-events-none">
              <p className="text-cyan-400 text-xl pixelated animate-pulse" style={{textShadow: '0 0 20px rgba(0,217,255,0.8)'}}>
                QUANTUM REALITY
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Credits Modal */}
      {showCredits && (
        <CreditsModal setShowCredits={setShowCredits} />
      )}

      {/* Password Modal */}
      {showPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative z-10 w-full max-w-md">
            <div className="border-4 border-cyan-400 p-8 bg-[#1a2742] shadow-[0_0_30px_rgba(0,217,255,0.5)]">
              <h2 className="text-2xl mb-6 text-cyan-400 text-center pixelated" >
                ENTER PASSWORD
              </h2>
              
              <div className="space-y-6">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handlePasswordKeyPress}
                    className="w-full px-4 py-3 bg-[#0a1628] border-2 border-cyan-400 text-cyan-300 text-sm focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_15px_rgba(0,217,255,0.5)] pixelated"
                    autoFocus
                  />
                </div>
                
                {passwordError && (
                  <div className="text-red-500 text-xs text-center animate-pulse pixelated">
                    {passwordError}
                  </div>
                )}
                
                <div className="flex gap-4">
                  <button
                    onClick={handlePasswordSubmit}
                    className="flex-1 px-6 py-3 bg-cyan-400 text-[#0a1628] font-bold hover:bg-cyan-300 transition-all text-sm pixelated"
                  >
                    ENTER
                  </button>
                  <button
                    onClick={() => {
                      setShowPassword(false);
                      setPassword("");
                      setPasswordError("");
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-bold hover:bg-red-500 transition-all text-sm pixelated"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}