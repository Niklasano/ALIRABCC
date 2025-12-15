import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Plus, Minus } from 'lucide-react';

interface PointsRulesDialogProps {
  open: boolean;
  onClose: () => void;
}

const PointsRulesDialog: React.FC<PointsRulesDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Système de Points - Classement
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Points de base */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Points de Base
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                <span className="font-medium">Victoire</span>
                <Badge variant="secondary" className="bg-green-600 text-white">6 points</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <span className="font-medium">Défaite</span>
                <Badge variant="secondary" className="bg-gray-600 text-white">0 point</Badge>
              </div>
            </div>
          </div>

          {/* Bonus */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Points Bonus
            </h3>
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Chutes adverses</span>
                  <p className="text-sm text-gray-600">Si une équipe fait chuter son adversaire au moins 2 fois</p>
                </div>
                <Badge variant="secondary" className="bg-blue-600 text-white">+1 point</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Peut bénéficier à l'équipe gagnante ou perdante
              </p>
            </div>
          </div>

          {/* Malus */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Minus className="h-5 w-5 text-red-600" />
              Points Malus
            </h3>
            <div className="space-y-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Alarmes Épicerie</span>
                  <Badge variant="secondary" className="bg-red-600 text-white">-1 point</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Toutes les 2 alarmes "Épicerie", "Épicerie fine" ou "Commerce de gros"
                </p>
              </div>
              
              <div className="bg-orange-100 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">"Vous êtes nuls"</span>
                  <Badge variant="secondary" className="bg-orange-600 text-white">-2 points</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Chaque fois que l'alarme "vous êtes nuls" apparaît pour l'équipe qui annonce un contrat
                </p>
              </div>
            </div>
            <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-300">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Important : Les malus ne s'appliquent qu'à l'équipe gagnante
              </p>
            </div>
          </div>

          {/* Calcul final */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">Calcul Final</h3>
            <div className="space-y-2 text-sm">
              <p><strong>1.</strong> Points de base (6 pour victoire, 0 pour défaite)</p>
              <p><strong>2.</strong> + Bonus chutes adverses (si applicable)</p>
              <p><strong>3.</strong> - Malus (uniquement pour l'équipe gagnante)</p>
              <p className="text-blue-600 font-medium">
                <strong>4.</strong> Score minimum de 2 points pour l'équipe gagnante
              </p>
            </div>
            <div className="mt-3 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Même si l'équipe gagnante a un score négatif après calculs, son score final est ramené à 2 points minimum.
              </p>
            </div>
          </div>

          {/* Exemples */}
          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">Exemples</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-green-600">Équipe gagnante classique :</p>
                <p>6 (victoire) + 1 (bonus chutes) - 0 (pas de malus) = 7 points</p>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-blue-600">Équipe perdante avec bonus :</p>
                <p>0 (défaite) + 1 (bonus chutes) = 1 point</p>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-orange-600">Équipe gagnante avec malus :</p>
                <p>6 (victoire) + 0 (pas de bonus) - 3 (malus épicerie + vous êtes nuls) = 3 points</p>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-red-600">Score minimum appliqué :</p>
                <p>6 (victoire) + 0 (pas de bonus) - 5 (gros malus) = 1 → 2 points (minimum)</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PointsRulesDialog;