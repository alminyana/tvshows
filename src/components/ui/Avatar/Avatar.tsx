import styles from './Avatar.module.scss';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  initials?: string;
}

export function Avatar({ src, alt = '', size = 'md', initials }: AvatarProps) {
  if (src) {
    return <img src={src} alt={alt} className={[styles.avatar, styles[size]].join(' ')} />;
  }

  return (
    <span
      className={[styles.avatar, styles.placeholder, styles[size]].join(' ')}
      aria-label={alt || undefined}
    >
      {initials ?? '?'}
    </span>
  );
}
