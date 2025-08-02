import { atom, useAtom } from "jotai";
import { useEffect,useState } from "react";
import { motion, useAnimation } from "framer-motion";
const pictures = [
  "DSC00680",
  "DSC00933",
  "DSC00966",
  "DSC00983",
  "DSC01011",
  "DSC01040",
  "DSC01064",
  "DSC01071",
  "DSC01103",
  "DSC01145",
  "DSC01420",
  "DSC01461",
  "DSC01489",
  "DSC02031",
  "DSC02064",
  "DSC02069",
  "hhh",
  "w3",
];

export const pageAtom = atom(0);
export const pages = [
  {
    front: "book-cover",
    back: pictures[0],
  },
];
for (let i = 1; i < pictures.length - 1; i += 2) {
  pages.push({
    front: pictures[i % pictures.length],
    back: pictures[(i + 1) % pictures.length],
  });
}


pages.push({
  front: pictures[pictures.length - 1],
  back: "book-back",
});

const WavingText = ({ children, index }) => {
  return (
    <motion.span
      className="inline-block"
      initial={{ y: -1000, opacity: 0 }} // Start above the screen
      animate={{ 
        y: 0, 
        opacity: 1,
        rotate: [0, -5, 5, 0] // Small wave effect
      }}
      transition={{
        y: {
          type: "spring",
          stiffness: 20,
          damping: 10,
          delay: index * 0.1
        },
        rotate: {
          delay: index * 0.1 + 0.5,
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }
      }}
    >
      {children}
    </motion.span>
  );
};

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);
  const [showText, setShowText] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play();
    
    // Start the animation after a short delay
    const timer = setTimeout(() => {
      setShowText(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [page]);

  return (
    <>
      <style jsx global>{`
        .outline-text {
          -webkit-text-stroke: 2px white;
          color: transparent;
        }
      `}</style>

      {/* ... (your existing main element) */}

      <div className="fixed inset-0 flex items-center justify-center select-none">
        <div className="relative w-full h-full overflow-hidden">
          {/* Main centered text with physics-based falling */}
          <div className="absolute -bottom-5 xl:top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            {showText && (
              <motion.h1 
                className="text-transparent text-4xl xl:text-8xl bonheur-royale-regular text-nowrap md:text-13xl font-bold outline-text italic mb-4"
              >
                {'Happy Birthday'.split('').map((char, i) => (
                  <WavingText key={i} index={i}>
                    {char === ' ' ? '\u00A0' : char}
                  </WavingText>
                ))}
              </motion.h1>
            )}
            
            {showText && (
              <motion.h2 className="text-transparent text-7xl md:text-10xl bonheur-royale-regular font-bold outline-text italic">
                {'Mona'.split('').map((char, i) => (
                  <WavingText key={i} index={i + 5}>
                    {char}
                  </WavingText>
                ))}
              </motion.h2>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
