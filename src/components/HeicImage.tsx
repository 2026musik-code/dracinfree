import { useState, useEffect, ImgHTMLAttributes } from 'react';
import heic2any from 'heic2any';

interface HeicImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
}

export default function HeicImage({ src, alt, className, ...props }: HeicImageProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let objectUrl = '';

    const loadImage = async () => {
      if (!src) {
        if (isMounted) setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      if (src.toLowerCase().includes('.heic')) {
        try {
          const response = await fetch(src);
          if (!response.ok) throw new Error('Network response was not ok');
          const blob = await response.blob();
          const conversionResult = await heic2any({ blob, toType: 'image/jpeg', quality: 0.8 });
          
          const finalBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
          objectUrl = URL.createObjectURL(finalBlob);
          
          if (isMounted) {
            setImgSrc(objectUrl);
            setLoading(false);
          }
        } catch (e) {
          console.error('Error converting HEIC:', e);
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setImgSrc(src);
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (loading) {
    return <div className={`animate-pulse bg-zinc-800 ${className}`}></div>;
  }

  if (error || !imgSrc) {
    return (
      <div className={`flex flex-col items-center justify-center bg-zinc-800 text-zinc-500 ${className}`}>
        <span className="text-xs">No Image</span>
      </div>
    );
  }

  return <img src={imgSrc} alt={alt} className={className} {...props} />;
}
