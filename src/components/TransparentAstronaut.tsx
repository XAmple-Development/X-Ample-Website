import React from 'react';
import astronautImage from '/lovable-uploads/3237898c-e13b-4345-9118-47e64deb4e31.png';

interface TransparentAstronautProps {
  className?: string;
  style?: React.CSSProperties;
}

const TransparentAstronaut: React.FC<TransparentAstronautProps> = ({ className, style }) => {
  return (
    <img 
      src={astronautImage}
      alt="Cosmic astronaut holding X-Ample Development sign"
      className={className}
      style={style}
    />
  );
};

export default TransparentAstronaut;