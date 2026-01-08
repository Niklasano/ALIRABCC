import React, { useEffect, useState } from 'react';

interface VousEtesNulsAlertProps {
  onClose: () => void;
}

const VousEtesNulsAlert: React.FC<VousEtesNulsAlertProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${isVisible ? 'animate-in fade-in' : 'animate-out fade-out'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-purple-600 text-white rounded-lg p-8 shadow-2xl transform scale-100 animate-in zoom-in duration-300">
        <h2 className="text-4xl font-bold text-center">VOUS ÊTES NULS</h2>
        <p className="text-xl text-center mt-2">Capot non annoncé !</p>
      </div>
    </div>
  );
};

export default VousEtesNulsAlert;
