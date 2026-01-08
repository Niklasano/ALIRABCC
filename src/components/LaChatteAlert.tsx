import React, { useEffect, useState } from 'react';

interface LaChatteAlertProps {
  onClose: () => void;
}

const LaChatteAlert: React.FC<LaChatteAlertProps> = ({ onClose }) => {
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
      <div className="relative bg-pink-600 text-white rounded-lg p-8 shadow-2xl transform scale-100 animate-in zoom-in duration-300">
        <h2 className="text-4xl font-bold text-center">LA CHATTE</h2>
        <p className="text-xl text-center mt-2">Générale non annoncée !</p>
      </div>
    </div>
  );
};

export default LaChatteAlert;
