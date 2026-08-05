import React, { useState, useEffect, useRef } from 'react';

// Define prop interface without extending HTML attributes
interface ReactImageProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
  [key: string]: any; // For additional props
}

// Simple function declaration with JSX return type
function ReactImage(props: ReactImageProps): JSX.Element {
  const { src, alt, placeholderSrc, ...restProps } = props;
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isVisible ? src : placeholderSrc}
      alt={alt}
      style={{
        filter: isVisible ? 'none' : 'blur(10px)',
        transition: 'filter 0.3s ease-in-out',
      }}
      {...restProps}
    />
  );
}

export default ReactImage;
