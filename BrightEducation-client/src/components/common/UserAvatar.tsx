import { useState, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';
import { getProfileImageUrl } from '../../lib/axios';

interface UserAvatarProps {
  profileImg?: string | null;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ profileImg, alt, className = '', size = 'md' }) => {
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    if (!profileImg) {
      setLoading(false);
      return;
    }

    // Load URL asynchronously to free up main thread rendering
    const timer = setTimeout(() => {
      const url = getProfileImageUrl(profileImg);
      if (url) {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          setSrcUrl(url);
          setLoading(false);
        };
        img.onerror = () => {
          setError(true);
          setLoading(false);
        };
      } else {
        setLoading(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [profileImg]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-24 h-24 text-lg',
    xl: 'w-32 h-32 text-2xl',
  };

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 animate-pulse`}>
        <div className="w-1/2 h-1/2 rounded-full bg-gray-200"></div>
      </div>
    );
  }

  if (error || !srcUrl) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 shadow-2xs`}>
        <FiUser className="w-1/2 h-1/2" />
      </div>
    );
  }

  return (
    <img
      src={srcUrl}
      alt={alt}
      loading="lazy"
      className={`${sizeClasses[size]} ${className} rounded-full object-cover border border-gray-200 shadow-2xs transition-all`}
    />
  );
};

export default UserAvatar;
