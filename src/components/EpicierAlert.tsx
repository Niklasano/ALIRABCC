import React, { useEffect, useState } from 'react';

interface EpicierAlertProps {
  teamName: string;
  ecartTheo: number;
  onClose: () => void;
}

const EpicierAlert: React.FC<EpicierAlertProps> = ({ teamName, ecartTheo, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Déterminer le message basé sur l'écart
  const getMessage = () => {
    if (ecartTheo >= 50) return "COMMERCE DE GROS";
    if (ecartTheo >= 40) return "ÉPICERIE FINE";
    return "ÉPICERIE";
  };

  // Déterminer la couleur basée sur l'écart
  const getColorClass = () => {
    if (ecartTheo >= 50) return "bg-red-600 text-white";
    if (ecartTheo >= 40) return "bg-yellow-500 text-black";
    return "bg-orange-500 text-white";
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${isVisible ? 'animate-in fade-in' : 'animate-out fade-out'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative ${getColorClass()} rounded-lg p-8 shadow-2xl transform scale-100 animate-in zoom-in duration-300`}>
        <h2 className="text-4xl font-bold text-center mb-2">{getMessage()}</h2>
        <p className="text-xl text-center">Équipe {teamName}</p>
      </div>
    </div>
  );
};

export default EpicierAlert;
