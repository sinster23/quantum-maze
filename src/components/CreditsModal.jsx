import React from "react";

export default function CreditsModal({setShowCredits}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
      <div className="relative z-10 text-center space-y-8 ">
        <div className="border-4 border-cyan-400 p-8 bg-[#1a2742] shadow-[0_0_30px_rgba(0,217,255,0.5)]">
          <h1 className="text-4xl mb-8 text-cyan-400 pixelated">CREDITS</h1>

          <div className="space-y-6 text-cyan-300 text-sm pixelated">
            <div>
              <p className="mb-2">GAME DESIGN</p>
              <p className="text-white">NEXTJS + TAILWIND</p>
            </div>

            <div>
              <p className="mb-2">DEVELOPER</p>
              <p className="text-white">UPAYAN</p>
            </div>

            <div>
              <p className="mb-2">POWERED BY</p>
              <p className="text-white">KINETEX LAB</p>
            </div>

            <div className="pt-4">
              <p className="text-xs text-cyan-500">© 2025 QUANTUM MAZE</p>
            </div>
          </div>

          <button
            onClick={() => setShowCredits(false)}
            className="mt-8 px-8 py-3 bg-cyan-400 text-[#0a1628] font-bold hover:bg-cyan-300 transition-all pixelated"
          >
            BACK
          </button>
        </div>
      </div>
    </div>
  );
}
