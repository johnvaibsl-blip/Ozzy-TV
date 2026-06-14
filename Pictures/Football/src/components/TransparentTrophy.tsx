import React, { useState, useEffect, useRef } from "react";

export const TransparentTrophy: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const img = new Image();
    img.src = "/assets/fifa_world_cup_trophy.png";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Match canvas dimensions to the image source
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Extract pixels
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Filter background pixels with a soft-feathered edge, preserving warm golden crevices
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const maxVal = Math.max(r, g, b);
        const isWarm = r > b + 3; // Gold shadows are warm-toned (R > B)

        if (!isWarm && maxVal < 45) {
          if (maxVal < 25) {
            data[i + 3] = 0; // Fully transparent
          } else {
            // Feather the edge: smoothly transition alpha from 0 to 255
            const ratio = (maxVal - 25) / (45 - 25);
            data[i + 3] = Math.round(ratio * 255);
          }
        }
      }

      // Re-apply transparent pixels to canvas
      ctx.putImageData(imgData, 0, 0);
      setIsLoaded(true);
    };
  }, []);

  return (
    <div className="relative h-full max-h-[440px] flex items-center justify-center" id="transparent_trophy_wrapper">
      {!isLoaded && (
        <div className="w-[220px] h-[400px] bg-slate-900/40 rounded-xl animate-pulse flex items-center justify-center text-slate-600 text-[10px] font-mono">
          LOADING...
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className={`h-full max-h-[440px] object-contain drop-shadow-[0_20px_40px_rgba(234,179,8,0.38)] transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0 absolute"}`} 
      />
    </div>
  );
};
