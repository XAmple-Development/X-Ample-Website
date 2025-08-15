import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import astronautImage from '/lovable-uploads/a6d25c89-5433-4195-82f5-e9dc0e61d2c0.png';
import { removeBackground, loadImage } from '@/utils/backgroundRemover';

interface TransparentAstronautProps {
  className?: string;
  style?: React.CSSProperties;
}

const TransparentAstronaut: React.FC<TransparentAstronautProps> = ({ className, style }) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processImage = async () => {
      setIsProcessing(true);
      try {
        // Create image element from the astronaut image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = astronautImage;
        });

        console.log('Image loaded, removing background...');
        
        // Remove background
        const resultBlob = await removeBackground(img);
        
        // Create URL for the processed image
        const url = URL.createObjectURL(resultBlob);
        setProcessedImageUrl(url);
        
        console.log('Background removal completed successfully');
      } catch (error) {
        console.error('Failed to process astronaut image:', error);
        // Fallback to original image
        setProcessedImageUrl(astronautImage);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

    // Cleanup function
    return () => {
      if (processedImageUrl && processedImageUrl !== astronautImage) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, []);

  if (isProcessing) {
    return (
      <div className={className} style={style}>
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-white/60 text-sm">Processing astronaut...</div>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={processedImageUrl || astronautImage}
      alt="Cosmic astronaut holding X-Ample Development sign"
      className={className}
      style={style}
    />
  );
};

export default TransparentAstronaut;