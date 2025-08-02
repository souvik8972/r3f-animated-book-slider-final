// components/FallingBalloons.jsx
import { useRef, useEffect, useState } from 'react';

const FallingBalloons = ({ isMuted = true }) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Orbit control state
  const orbitState = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    rotationX: 0,
    rotationY: 0,
    distance: 1000 // Initial distance from the scene
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Balloon settings
    const balloons = [];
    const balloonCount = Math.floor(30); // Fewer balloons since they're bigger
    const balloonImages = [];

    // Create balloon images with different colors
    for (let i = 0; i < 3; i++) {
      const img = new Image();
      const color = isMuted ? `rgba(255,255,255,${0.8 - i * 0.2})` 
                         : `rgba(${255 - i * 30},${105 - i * 20},${180 - i * 30},${0.8 - i * 0.2})`;
      
      img.src = `data:image/svg+xml;base64,${btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
          <ellipse cx="50" cy="70" rx="40" ry="50" fill="${color}"/>
          <path d="M50,120 Q55,110 60,120 Q65,110 70,120" stroke="${color}" stroke-width="2" fill="none"/>
        </svg>`
      )}`;
      balloonImages.push(img);
    }

    // Create balloons in 3D space
    for (let i = 0; i < balloonCount; i++) {
      balloons.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        z: Math.random() * 2000 - 1000,
        size: Math.random() * 30 + 40, // Bigger size than hearts
        speed: Math.random() * -1 + 0.5, // Slower movement
        angle: Math.random() * 360,
        rotationSpeed: Math.random() * -0.2 - 0.1,
        img: balloonImages[Math.floor(Math.random() * balloonImages.length)],
        popped: false,
        popTime: 0,
        popScale: 1
      });
    }

    // Mouse event handlers for orbit controls
    const handleMouseDown = (e) => {
      orbitState.current.isDragging = true;
      orbitState.current.lastX = e.clientX;
      orbitState.current.lastY = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (!orbitState.current.isDragging) return;
      
      const deltaX = e.clientX - orbitState.current.lastX;
      const deltaY = e.clientY - orbitState.current.lastY;
      
      orbitState.current.rotationY += deltaX * 0.2;
      orbitState.current.rotationX += deltaY * 0.2;
      
      orbitState.current.lastX = e.clientX;
      orbitState.current.lastY = e.clientY;
    };

    const handleMouseUp = () => {
      orbitState.current.isDragging = false;
    };

    const handleWheel = (e) => {
      orbitState.current.distance += e.deltaY * 0.5;
      orbitState.current.distance = Math.max(500, Math.min(2000, orbitState.current.distance));
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Check each balloon for click
      for (let i = 0; i < balloons.length; i++) {
        const balloon = balloons[i];
        
        if (balloon.popped) continue;
        
        // Apply 3D rotation to get screen position
        const cosX = Math.cos(orbitState.current.rotationX * Math.PI / 180);
        const sinX = Math.sin(orbitState.current.rotationX * Math.PI / 180);
        const cosY = Math.cos(orbitState.current.rotationY * Math.PI / 180);
        const sinY = Math.sin(orbitState.current.rotationY * Math.PI / 180);
        
        let x = balloon.x * cosY - balloon.z * sinY;
        let z = balloon.x * sinY + balloon.z * cosY;
        let y = balloon.y;
        
        y = balloon.y * cosX - z * sinX;
        z = balloon.y * sinX + z * cosX;
        
        const scale = orbitState.current.distance / (orbitState.current.distance + z);
        const screenX = dimensions.width / 2 + x * scale;
        const screenY = dimensions.height / 2 + y * scale;
        const screenSize = balloon.size * scale;
        
        // Check if click is within balloon bounds
        if (scale > 0 && 
            mouseX >= screenX - screenSize/2 && 
            mouseX <= screenX + screenSize/2 && 
            mouseY >= screenY - screenSize/2 && 
            mouseY <= screenY + screenSize/2) {
          balloon.popped = true;
          balloon.popTime = Date.now();
          break;
        }
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('click', handleClick);

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Gradient background
      const gradient = ctx.createRadialGradient(
        dimensions.width / 2,
        dimensions.height / 2,
        0,
        dimensions.width / 2,
        dimensions.height / 2,
        Math.max(dimensions.width, dimensions.height) / 2
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Project 3D positions to 2D with orbit controls
      for (let i = 0; i < balloons.length; i++) {
        const balloon = balloons[i];
        
        if (balloon.popped) {
          // Animate pop effect
          const popDuration = 300; // 300ms pop animation
          const elapsed = Date.now() - balloon.popTime;
          
          if (elapsed < popDuration) {
            balloon.popScale = 1 + (elapsed / popDuration) * 2;
            const alpha = 1 - (elapsed / popDuration);
            
            // Apply 3D rotation
            const cosX = Math.cos(orbitState.current.rotationX * Math.PI / 180);
            const sinX = Math.sin(orbitState.current.rotationX * Math.PI / 180);
            const cosY = Math.cos(orbitState.current.rotationY * Math.PI / 180);
            const sinY = Math.sin(orbitState.current.rotationY * Math.PI / 180);
            
            let x = balloon.x * cosY - balloon.z * sinY;
            let z = balloon.x * sinY + balloon.z * cosY;
            let y = balloon.y;
            
            y = balloon.y * cosX - z * sinX;
            z = balloon.y * sinX + z * cosX;
            
            const scale = orbitState.current.distance / (orbitState.current.distance + z);
            const screenX = dimensions.width / 2 + x * scale;
            const screenY = dimensions.height / 2 + y * scale;
            const screenSize = balloon.size * scale;
            
            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.scale(balloon.popScale, balloon.popScale);
            ctx.globalAlpha = alpha * scale;
            ctx.drawImage(
              balloon.img,
              -screenSize / 2,
              -screenSize / 2,
              screenSize,
              screenSize
            );
            ctx.restore();
          } else {
            // Reset balloon after pop animation
            balloon.popped = false;
            balloon.y = -1000;
            balloon.x = Math.random() * 2000 - 1000;
            balloon.z = Math.random() * 2000 - 1000;
          }
          continue;
        }
        
        // Apply floating motion in 3D space
        balloon.y += balloon.speed;
        balloon.angle += balloon.rotationSpeed;
        
        // Reset position if balloon floats out of view
        if (balloon.y > 1000) {
          balloon.y = -1000;
          balloon.x = Math.random() * 2000 - 1000;
          balloon.z = Math.random() * 2000 - 1000;
        }
        
        // Apply 3D rotation
        const cosX = Math.cos(orbitState.current.rotationX * Math.PI / 180);
        const sinX = Math.sin(orbitState.current.rotationX * Math.PI / 180);
        const cosY = Math.cos(orbitState.current.rotationY * Math.PI / 180);
        const sinY = Math.sin(orbitState.current.rotationY * Math.PI / 180);
        
        let x = balloon.x * cosY - balloon.z * sinY;
        let z = balloon.x * sinY + balloon.z * cosY;
        let y = balloon.y;
        
        y = balloon.y * cosX - z * sinX;
        z = balloon.y * sinX + z * cosX;
        
        const scale = orbitState.current.distance / (orbitState.current.distance + z);
        const screenX = dimensions.width / 2 + x * scale;
        const screenY = dimensions.height / 2 + y * scale;
        const screenSize = balloon.size * scale;
        
        if (scale > 0) {
          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate((balloon.angle * Math.PI) / 180);
          ctx.globalAlpha = scale;
          ctx.drawImage(
            balloon.img,
            -screenSize / 2,
            -screenSize / 2,
            screenSize,
            screenSize
          );
          ctx.restore();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('click', handleClick);
    };
  }, [dimensions, isMuted]); // Add isMuted to dependencies

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 0,
        cursor: 'grab'
      }}
    />
  );
};

export default FallingBalloons;