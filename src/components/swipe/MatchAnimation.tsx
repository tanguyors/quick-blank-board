import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface MatchAnimationProps {
  onClose: () => void;
}

export function MatchAnimation({ onClose }: MatchAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center px-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Animated sparkle ring */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
          className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/40"
        >
          <Sparkles className="h-14 w-14 text-primary-foreground" />
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-white mb-2"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          C'est un coup de cœur !
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-white/80 mb-8 max-w-xs mx-auto"
        >
          Nous prévenons le Propriétaire de votre coup de cœur pour son bien via Soma Gate.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            className="px-8 h-12 rounded-2xl text-base font-semibold shadow-lg"
            onClick={onClose}
          >
            Continuer
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-white/40 mt-6 tracking-wider"
        >
          SOMA GATE — INTELLIGENCE IMMOBILIÈRE
        </motion.p>
      </motion.div>
    </div>
  );
}
