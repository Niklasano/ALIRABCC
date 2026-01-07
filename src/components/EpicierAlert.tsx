import React, { useEffect, useState } from 'react';

interface EpicierAlertProps {
  teamName: string;
  ecartTheo: number;
  onClose: () => void;
  isSpecial?: boolean; // Capot/Générale réussi
  isChute?: boolean;   // Contrat chuté
}

const EpicierAlert: React.FC<EpicierAlertProps> = ({ 
  teamName, ecartTheo, onClose, isSpecial, isChute 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Bloquer l'affichage si c'est un cas exclu (Chute ou Capot/Générale réussi) [cite: 32, 33]
  if (isChute || isSpecial) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  // 1. Déterminer le message [cite: 4, 5]
  const getMessage = () => {
    if (ecartTheo >= 50) return "COMMERCE DE GROS";
    if (ecartTheo >= 40) return "ÉPICERIE FINE";
    return "ÉPICERIE";
  };

  // 2. Déterminer la couleur [cite: 6, 7, 8]
  const getColorClass = () => {
    if (ecartTheo >= 50) return "bg-red-600 text-white";    // ROUGE
    if (ecartTheo >= 40) return "bg-yellow-500 text-black"; // JAUNE
    return "bg-orange-500 text-white";                      // ORANGE
  };

  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] animate-in fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`rounded-2xl p-12 shadow-2xl transform scale-150 border-4 border-white/20 animate-in zoom-in-95 duration-300 ${getColorClass()}`}>
        <h2 className="text-6xl font-black tracking-tighter text-center italic">
          {getMessage()}
        </h2>
        <p className="text-center mt-2 font-bold opacity-90 uppercase tracking-widest">
          Équipe {teamName}
        </p>
      </div>
    </div>
  );
};

export default EpicierAlert;