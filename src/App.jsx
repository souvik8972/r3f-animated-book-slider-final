import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState, useEffect } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import audio from "/audios/bgm.mp3";
import { GoUnmute, GoMute } from "react-icons/go";
import CherryBlossoms from "./components/CherryBlossoms";
import FallingBalloons from "./components/FallingBalloons";
import "../public/fonts/fonts.css";

function App() {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showCover, setShowCover] = useState(true);

  // Effect to update root element's background based on mute state
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.style.background = isMuted 
        ? 'linear-gradient(to bottom, #8d99ae, black)'
        : 'radial-gradient(#e9147e, #232323 80%)';
      root.style.backgroundAttachment = 'fixed';
      root.style.backgroundSize = 'cover';
    }
  }, [isMuted]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false;
        audioRef.current.play();
      } else {
        audioRef.current.muted = true;
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleStartExperience = () => {
    setShowCover(false);
    toggleAudio(); // Unmute when starting
  };

  return (
    <>
      {/* Audio element */}
      <audio id="myAudio" ref={audioRef} loop muted>
        <source src={audio} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Full-screen cover */}
      {showCover && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black bg-opacity-100">
          <div className="text-center p-8 max-w-md mx-auto">
            <h1 className="text-4xl font-bold bonheur-royale-regular text-white mb-6">Happy Birthday</h1>
            <p className="text-white mb-8 text-4xl bonheur-royale-regular">Neha</p>
            <button
              onClick={handleStartExperience}
              className="px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-full text-xl transition-all transform hover:scale-105"
            >
              Click Here
            </button>
          </div>
        </div>
      )}

      {/* Mute/Unmute toggle button */}
      {!showCover && (
        <button
          className="fixed top-0 left-0 z-[100000] font-extrabold px-4 py-2 m-2 rounded transition-colors duration-200"
          style={{
            color: isMuted ? 'black' : '#3b82f6',
            backgroundColor: isMuted ? 'white' : ''
          }}
          onClick={toggleAudio}
        >
          {isMuted ? <GoMute size={24} /> : <GoUnmute size={24} />}
        </button>
      )}
      {!showCover && isMuted && <span className="fixed top-14 left-2 z-[100000] text-white text-[10px] animate-bounce">play Audio</span>}

      {/* Cherry Blossoms Effect */}
      {!isMuted && !showCover && <CherryBlossoms />}

      <>
          <UI setIsMuted={setIsMuted} isMuted={isMuted} />
          <Loader />

          <Canvas
            className=""
            shadows
            camera={{
              position: [-0.5, 1, window.innerWidth > 800 ? 4 : 9],
              fov: 45,
            }}
          >
            <group position-y={0}>
              <Suspense fallback={null}>
                <Experience setIsMuted={setIsMuted} />
              </Suspense>
            </group>
          </Canvas>
        </>
    </>
  );
}

export default App;