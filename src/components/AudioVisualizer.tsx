import React, { useEffect, useRef } from 'react';
import { useCalibration } from '../context/CalibrationContext';

export const AudioVisualizer: React.FC = () => {
  const { audioActive, analyserNode } = useCalibration();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI retina displays
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Clear with slight alpha to create motion blur trail
      ctx.fillStyle = '#06080e';
      ctx.fillRect(0, 0, width, height);

      // Draw horizontal grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      
      // Grid lines
      for (let y = height / 4; y < height; y += height / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (audioActive && analyserNode) {
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteTimeDomainData(dataArray);

        // Neon Glow style
        ctx.strokeStyle = 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)';
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(139, 92, 246, 0.6)';

        // Create gradient stroke
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(0.5, '#6366f1');
        grad.addColorStop(1, '#06b6d4');
        ctx.strokeStyle = grad;

        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; // Normalized around 1.0
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Reset shadow for next render
        ctx.shadowBlur = 0;
      } else {
        // Draw flat center line when idle
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.font = '12px var(--font-sans)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AUDIO SIGNAL IDLE - INITIALIZE TUNER INPUT', width / 2, height / 2 - 15);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioActive, analyserNode]);

  return (
    <div id="waveform-card" className="panel-glass" style={{ padding: '8px', overflow: 'hidden', height: '140px' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          borderRadius: '8px',
        }}
      />
    </div>
  );
};
export default AudioVisualizer;
