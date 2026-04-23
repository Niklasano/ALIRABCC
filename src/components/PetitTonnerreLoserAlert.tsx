import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface PetitTonnerreLoserAlertProps {
  onClose: () => void;
}

const PetitTonnerreLoserAlert: React.FC<PetitTonnerreLoserAlertProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-in fade-in">
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={handleClose} />
      <div className="relative z-10 bg-black rounded-xl p-4 shadow-2xl max-w-2xl w-full mx-4">
        <h2 className="text-white text-3xl font-black text-center mb-4">
          ⛈️ PETIT TONNERRE S'EST ENCORE ANNONCE BRAZIL ⛈️
        </h2>
        <video
          src="/petit-tonnerre-loser.mp4"
          autoPlay
          controls
          className="w-full rounded-lg"
        />
        <Button onClick={handleClose} className="mt-4 w-full">
          Fermer
        </Button>
      </div>
    </div>
  );
};

export default PetitTonnerreLoserAlert;