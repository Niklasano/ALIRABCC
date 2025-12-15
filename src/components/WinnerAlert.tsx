
import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles, Star, Crown } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface WinnerAlertProps {
  winnerTeam: string;
  winnerScore: number;
  loserScore: number;
  bonusMalusDetails?: string;
  onClose: () => void;
}

const WinnerAlert: React.FC<WinnerAlertProps> = ({ 
  winnerTeam, 
  winnerScore, 
  loserScore,
  bonusMalusDetails,
  onClose 
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Générer des confettis aléatoirement
  const confettiElements = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-2 h-2 animate-bounce opacity-80 ${
        i % 4 === 0 ? 'bg-yellow-400' :
        i % 4 === 1 ? 'bg-red-500' :
        i % 4 === 2 ? 'bg-blue-500' : 'bg-green-500'
      } rounded-full`}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${2 + Math.random() * 2}s`
      }}
    />
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Overlay avec confettis */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiElements}
        </div>
      )}
      
      {/* Alerte principale */}
      <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 rounded-2xl shadow-2xl animate-scale-in max-w-md w-full mx-4">
        <div className="bg-white rounded-xl p-8 text-center relative overflow-hidden">
          {/* Étoiles décoratives */}
          <div className="absolute top-4 left-4 text-yellow-400 animate-pulse">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div className="absolute top-4 right-4 text-yellow-400 animate-pulse">
            <Star className="w-6 h-6 fill-current" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute bottom-4 left-8 text-yellow-300 animate-pulse">
            <Sparkles className="w-5 h-5" style={{ animationDelay: '1s' }} />
          </div>
          <div className="absolute bottom-4 right-8 text-yellow-300 animate-pulse">
            <Sparkles className="w-5 h-5" style={{ animationDelay: '1.5s' }} />
          </div>
          
          {/* Icône de couronne */}
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <Crown className="w-16 h-16 text-yellow-500 animate-bounce" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-spin">
                <Trophy className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          {/* Titre principal */}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text mb-2 animate-fade-in">
            🎉 VICTOIRE ! 🎉
          </h2>
          
          {/* Nom de l'équipe gagnante */}
          <div className="mb-4">
            <p className="text-lg text-gray-600 mb-1">Félicitations à</p>
            <p className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
              {winnerTeam}
            </p>
          </div>
          
          {/* Score final */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Score final</p>
            <p className="text-xl font-bold text-gray-800">
              {winnerScore} - {loserScore}
            </p>
          </div>
          
          {/* Message de félicitations */}
          <div className="mb-6 space-y-2">
            <p className="text-gray-700 font-medium">
              🏆 Une partie exceptionnelle !
            </p>
            <p className="text-sm text-gray-600">
              Bravo pour cette belle victoire !
            </p>
          </div>

          {/* Détails bonus/malus */}
          {bonusMalusDetails && (
            <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border-l-4 border-gradient-to-b from-blue-500 to-purple-500 shadow-sm">
              <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {bonusMalusDetails}
              </div>
            </div>
          )}
          
          {/* Bouton de fermeture */}
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Nouvelle partie
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WinnerAlert;
