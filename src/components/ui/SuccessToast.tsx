import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export default function SuccessToast({ show, message, onClose }: SuccessToastProps) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.8, y: 20, x: '-50%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-[400px]"
          >
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-stone-50 relative overflow-hidden">
              {/* Subtle background decoration */}
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500/10" />
              
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 15 
                }}
                className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-10 border-8 border-emerald-50/50"
              >
                <CheckCircle2 size={56} strokeWidth={2} />
              </motion.div>
              
              <h3 className="text-3xl font-bold text-stone-800 mb-4 tracking-tight">
                {message.includes('Kelas') ? 'Data Kelas Tersimpan' : 
                 message.includes('Sekolah') ? 'Data Sekolah Tersimpan' : 
                 'Data Tersimpan'}
              </h3>
              <p className="text-stone-400 text-lg font-medium">
                Data telah diperbarui di database.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
