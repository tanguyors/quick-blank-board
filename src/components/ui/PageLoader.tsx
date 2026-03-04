import { motion } from 'framer-motion';
import logoSoma from '@/assets/logo-soma.png';

export function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <motion.img
        src={logoSoma}
        alt="Chargement…"
        className="h-14 w-14 object-contain"
        initial={{ opacity: 0.4, scale: 0.85 }}
        animate={{
          opacity: [0.4, 1, 0.4],
          scale: [0.85, 1.05, 0.85],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
