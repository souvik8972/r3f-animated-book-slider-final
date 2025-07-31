// components/FallingHearts.jsx
import { useRef, useEffect, useState } from 'react';

const FallingHearts = () => {
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

    // Heart settings
    const hearts = [];
    const heartCount = Math.floor(50);
    const heartImages = [];

    // Create heart images with different sizes and slight opacity variations
    for (let i = 0; i < 3; i++) {
      const img = new Image();
      img.src = `data:image/svg+xml;base64,${btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path fill="rgba(255,255,255,${0.7 - i * 0.1})" d="M50,30 Q30,10 10,30 Q-5,50 25,75 Q50,95 50,95 Q50,95 75,75 Q105,50 90,30 Q70,10 50,30 Z"/>
        </svg>`
      )}`;
      heartImages.push(img);
    }

    // Create hearts in 3D space
    for (let i = 0; i < heartCount; i++) {
      hearts.push({
        x: Math.random() * 2000 - 1000, // Wider spread in 3D space
        y: Math.random() * 2000 - 1000,
        z: Math.random() * 2000 - 1000,
        size: Math.random() * 10 + 10,
        speed: Math.random() * -2 + 1,
        angle: Math.random() * 360,
        rotationSpeed: Math.random() * -0.5 - 0.25,
        img: heartImages[Math.floor(Math.random() * heartImages.length)]
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
      // Limit the zoom range
      orbitState.current.distance = Math.max(500, Math.min(2000, orbitState.current.distance));
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Add a subtle gradient background
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
      for (let i = 0; i < hearts.length; i++) {
        const heart = hearts[i];
        
        // Apply falling motion in 3D space
        heart.y += heart.speed;
        heart.angle += heart.rotationSpeed;
        
        // Reset position if heart falls out of view
        if (heart.y > 1000) {
          heart.y = -1000;
          heart.x = Math.random() * 2000 - 1000;
          heart.z = Math.random() * 2000 - 1000;
        }
        
        // Apply 3D rotation based on orbit controls
        const cosX = Math.cos(orbitState.current.rotationX * Math.PI / 180);
        const sinX = Math.sin(orbitState.current.rotationX * Math.PI / 180);
        const cosY = Math.cos(orbitState.current.rotationY * Math.PI / 180);
        const sinY = Math.sin(orbitState.current.rotationY * Math.PI / 180);
        
        // Rotate around Y axis
        let x = heart.x * cosY - heart.z * sinY;
        let z = heart.x * sinY + heart.z * cosY;
        let y = heart.y;
        
        // Rotate around X axis
        y = heart.y * cosX - z * sinX;
        z = heart.y * sinX + z * cosX;
        
        // Apply perspective projection
        const scale = orbitState.current.distance / (orbitState.current.distance + z);
        const screenX = dimensions.width / 2 + x * scale;
        const screenY = dimensions.height / 2 + y * scale;
        const screenSize = heart.size * scale;
        
        // Only draw if the heart is in front of the camera
        if (scale > 0) {
          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate((heart.angle * Math.PI) / 180);
          ctx.globalAlpha = scale; // Fade out as they go further away
          ctx.drawImage(
            heart.img,
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
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto', // Changed to allow interaction
        zIndex: 0,
        cursor: 'grab'
      }}
    />
  );
};

export default FallingHearts;