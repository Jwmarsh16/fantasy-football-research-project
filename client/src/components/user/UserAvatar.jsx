import { useState } from 'react';
import '../../style/UserAvatar.css';

function UserAvatar({ username, src, className = '' }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const initials = String(username ?? '').trim().split(/\s+/).slice(0, 2)
    .map(word => word[0]).join('').toUpperCase();

  return (
    <div className={`user-avatar ${className}`} aria-hidden="true">
      {src && failedSrc !== src ? (
        <img key={src} src={src} alt="" onError={() => setFailedSrc(src)} />
      ) : (
        initials
      )}
    </div>
  );
}

export default UserAvatar;
