import React from 'react';

/**
 * Simple Screenshot Capture Utility
 * Add this to any lab component to enable easy screenshot capture
 *
 * Usage: Press 'S' key or click button to capture canvas
 */

export function useLabScreenshot(labId: string) {
  const captureScreenshot = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      alert('No canvas found to capture!');
      return;
    }

    try {
      // Create download link
      const link = document.createElement('a');
      link.download = `${labId}-screenshot-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      console.log(`Screenshot saved: ${link.download}`);
      alert(`Screenshot saved as ${link.download}!`);
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Screenshot failed. Check console for details.');
    }
  };

  // Listen for 'S' key press
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'S') {
        captureScreenshot();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return { captureScreenshot };
}

/**
 * Screenshot Button Component
 * Add this to your lab UI for easy access
 */
export function ScreenshotButton({ labId }: { labId: string }) {
  const { captureScreenshot } = useLabScreenshot(labId);

  return (
    <button
      onClick={captureScreenshot}
      className="fixed top-4 right-4 z-50 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
      title="Capture Screenshot (or press 'S')"
    >
      📸 Capture
    </button>
  );
}
