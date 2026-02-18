import Image from 'next/image';

export default function NotFound() {
  return (
    <div style={{ 
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000'
    }}>
      {/* Top blurred background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}>
        <Image 
          src="/404_page.png" 
          alt="Background" 
          fill
          style={{ 
            objectFit: 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.1)'
          }}
          priority
        />
      </div>

      {/* Main centered image */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        aspectRatio: 'auto',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Image 
          src="/404_page.png" 
          alt="404 Not Found" 
          width={1920}
          height={1080}
          style={{ 
            width: '100%',
            height: 'auto',
            maxHeight: '100vh',
            objectFit: 'contain'
          }}
          priority
        />
      </div>
    </div>
  );
}
