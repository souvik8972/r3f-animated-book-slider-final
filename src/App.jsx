import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import audio from "/audios/bgm.mp3";
import { GoUnmute, GoMute } from "react-icons/go";
import CherryBlossoms from "./components/CherryBlossoms"; // Add this import

function App() {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false;
        audioRef.current.play();
      } else {
        audioRef.current.muted = true;
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      {/* Audio element */}
      <audio id="myAudio" ref={audioRef} loop muted>
        <source src={audio} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Mute/Unmute toggle button */}
      <button
  className="fixed top-0 left-0 z-[100000] font-extrabold px-4 py-2 m-2 rounded transition-colors duration-200"
  style={{
    color: isMuted ? 'white' : '#3b82f6', // red when muted, blue when not
    
  }}
  onClick={toggleAudio}
>
        {isMuted ? <GoMute size={24} /> : <GoUnmute size={24} />}
      </button>
     {isMuted &&  <span className="fixed top-10 left-2 z-[100000] text-white  text-[10px] animate-bounce"> play Audio</span>}

      {/* Cherry Blossoms Effect */}
      {!isMuted && <CherryBlossoms />}

      <UI setIsMuted={setIsMuted} />
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
  );
}

export default App;