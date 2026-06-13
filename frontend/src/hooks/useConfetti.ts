// useConfetti.ts — Hook para lanzar confetti al lograr BCNF
import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const fireConfetti = () => {
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366F1', '#8B5CF6', '#06B6D4'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366F1', '#8B5CF6', '#06B6D4'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const fireSuccess = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#10B981', '#6366F1', '#F59E0B', '#EF4444'],
    });
  };

  return { fireConfetti, fireSuccess };
};
