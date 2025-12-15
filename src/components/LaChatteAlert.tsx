
import React, { useEffect, useState } from 'react';

interface LaChatteAlertProps {
  onClose: () => void;
}

const LaChatteAlert: React.FC<LaChatteAlertProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Fermer automatiquement après 3 secondes
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Laisser le temps pour l'animation de sortie
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-in fade-in">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-purple-600 text-white rounded-lg p-8 shadow-xl transform scale-125 animate-in scale-in">
        <h2 className="text-5xl font-extrabold tracking-tight text-center">LA CHATTE</h2>
      </div>
    </div>
  );
};

export default LaChatteAlert;
