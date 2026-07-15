export function startAnimatedFavicon() {
  const isMobile = navigator.maxTouchPoints > 0 || /Mobi|Android/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (!isMobile || isStandalone) return;

  const SIZE = 64;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.src = '/capa-c-icon-512.png';

  img.onload = () => {
    // Find or create the favicon link element
    let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      document.head.appendChild(link);
    }

    let t = 0;
    let rafId: number;

    function draw() {
      if (document.hidden) { rafId = requestAnimationFrame(draw); return; }

      t += 0.07;
      const bobY = Math.sin(t) * 4;       // gentle float ±4 px
      const scale = 1 + Math.sin(t * 0.5) * 0.04; // subtle breathe

      ctx.clearRect(0, 0, SIZE, SIZE);

      // Black background to match the C icon
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // Ghost — centred with bob
      const gs = Math.round(SIZE * 0.72 * scale);
      const gx = (SIZE - gs) / 2;
      const gy = (SIZE - gs) / 2 + bobY;
      ctx.drawImage(img, gx, gy, gs, gs);

      link!.href = canvas.toDataURL('image/png');
      rafId = requestAnimationFrame(draw);
    }

    draw();
  };
}
