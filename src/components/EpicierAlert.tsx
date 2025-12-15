
import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EpicierAlertProps {
  teamName: string;
  ecartTheo: number;
  onClose: () => void;
}

const EpicierAlert: React.FC<EpicierAlertProps> = ({ teamName, ecartTheo, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Fermer automatiquement après 3 secondes
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Laisser le temps pour l'animation de sortie
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  // Déterminer quel message afficher en fonction de l'écart théorique
  const getMessage = () => {
    if (ecartTheo >= 50) return "COMMERCE DE GROS";
    if (ecartTheo >= 40) return "ÉPICERIE FINE";
    return "ÉPICERIE";
  };

  // Déterminer la classe de couleur en fonction de l'écart théorique
  const getColorClass = () => {
    if (ecartTheo >= 50) return "bg-purple-700 text-white";
    if (ecartTheo >= 40) return "bg-blue-600 text-white";
    return "bg-red-600 text-white";
  };

  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-in fade-in">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className={`rounded-lg p-8 shadow-xl transform scale-125 animate-in scale-in ${getColorClass()}`}>
        <h2 className="text-5xl font-extrabold tracking-tight text-center">{getMessage()}</h2>
      </div>
    </div>
  );
};

export default EpicierAlert;
