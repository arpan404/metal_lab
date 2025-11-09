"use client";

import { useEffect } from 'react';

/**
 * Utility hook to capture screenshots from BabylonJS scenes
 * Press 'S' key to capture and download a screenshot
 */
export const useScreenshotCapture = (labId: string) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'S') {
        // Look for canvas elements (BabylonJS uses canvas)
        const canvas = document.querySelector('canvas');
        if (!canvas) {
          console.warn('No canvas found to capture');
          return;
        }

        try {
          // Create a link element and trigger download
          canvas.toBlob((blob) => {
            if (!blob) return;
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${labId}-screenshot-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            
            console.log(`Screenshot saved: ${link.download}`);
          });
        } catch (error) {
          console.error('Failed to capture screenshot:', error);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [labId]);
};

/**
 * Utility to capture screenshot from THREE.js renderer
 */
export const captureThreeJSScreenshot = (
  renderer: any,
  labId: string
) => {
  try {
    const dataURL = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${labId}-screenshot-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    console.log(`Screenshot saved: ${link.download}`);
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
  }
};

/**
 * Screenshot Button Component
 * Add this to any lab to enable easy screenshot capture
 */
export function ScreenshotButton({ 
  labId, 
  onCapture 
}: { 
  labId: string;
  onCapture?: () => string | HTMLCanvasElement | null;
}) {
  const handleCapture = () => {
    try {
      let canvas: HTMLCanvasElement | null = null;
      
      if (onCapture) {
        const result = onCapture();
        if (typeof result === 'string') {
          // Direct data URL
          const link = document.createElement('a');
          link.download = `${labId}-screenshot-${Date.now()}.png`;
          link.href = result;
          link.click();
          return;
        } else if (result instanceof HTMLCanvasElement) {
          canvas = result;
        }
      } else {
        // Find canvas automatically
        canvas = document.querySelector('canvas');
      }

      if (!canvas) {
        console.warn('No canvas found to capture');
        return;
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${labId}-screenshot-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        console.log(`Screenshot saved: ${link.download}`);
        alert('Screenshot saved to Downloads!');
      });
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      alert('Failed to capture screenshot');
    }
  };

  return (
    <button
      onClick={handleCapture}
      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm border border-white/20 transition-colors"
      title="Capture Screenshot (or press 'S')"
    >
      📸 Capture
    </button>
  );
}
