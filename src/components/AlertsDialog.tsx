import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { BeloteRow } from '@/types/belote';
import { Badge } from "@/components/ui/badge";

interface AlertsDialogProps {
  gameData: BeloteRow[];
  team1Name: string;
  team2Name: string;
  disabled?: boolean;
}

const AlertsDialog: React.FC<AlertsDialogProps> = ({ gameData, team1Name, team2Name, disabled = false }) => {
  // Compter les différentes alertes pour chaque équipe
  // IMPORTANT: On compte uniquement pour l'équipe qui a annoncé le contrat (Mène)
  const countAlerts = () => {
    const alerts = {
      team1: {
        epicerie: 0,
        epicerieFine: 0,
        commerceDeGros: 0,
        vousEtesNuls: 0,
      },
      team2: {
        epicerie: 0,
        epicerieFine: 0,
        commerceDeGros: 0,
        vousEtesNuls: 0,
      }
    };

    gameData.forEach((row, index) => {
      // Déterminer quelle équipe a annoncé le contrat (basé sur qui a un contrat > 0)
      const team1HasContract = row.Contrat > 0;
      const team2HasContract = row.Contrat_E2 > 0;
      
      // Calculer l'écart de cette mène uniquement (pas le cumulé)
      const prevEcartTheoE1 = index > 0 ? gameData[index - 1]["Ecarts Théorique"] : 0;
      const prevEcartTheoE2 = index > 0 ? gameData[index - 1]["Ecarts Théorique_E2"] : 0;
      const ecartMeneE1 = row["Ecarts Théorique"] - prevEcartTheoE1;
      const ecartMeneE2 = row["Ecarts Théorique_E2"] - prevEcartTheoE2;
      
      if (team1HasContract) {
        // Team1 a annoncé, on compte ses alertes basées sur l'écart de la mène
        // Vous êtes nuls pour Team1
        if (row.Remarques === "Vous êtes nuls" || row.Remarques === "Capot non annoncé") {
          alerts.team1.vousEtesNuls++;
        } else if (ecartMeneE1 >= 50) {
          alerts.team1.commerceDeGros++;
        } else if (ecartMeneE1 >= 40) {
          alerts.team1.epicerieFine++;
        } else if (ecartMeneE1 >= 30) {
          alerts.team1.epicerie++;
        }
      }
      
      if (team2HasContract) {
        // Team2 a annoncé, on compte ses alertes basées sur l'écart de la mène
        // Vous êtes nuls pour Team2
        if (row.Remarques_E2 === "Vous êtes nuls" || row.Remarques_E2 === "Capot non annoncé") {
          alerts.team2.vousEtesNuls++;
        } else if (ecartMeneE2 >= 50) {
          alerts.team2.commerceDeGros++;
        } else if (ecartMeneE2 >= 40) {
          alerts.team2.epicerieFine++;
        } else if (ecartMeneE2 >= 30) {
          alerts.team2.epicerie++;
        }
      }
    });

    return alerts;
  };

  const alerts = countAlerts();
  const totalAlerts = 
    alerts.team1.epicerie + alerts.team1.epicerieFine + alerts.team1.commerceDeGros + alerts.team1.vousEtesNuls +
    alerts.team2.epicerie + alerts.team2.epicerieFine + alerts.team2.commerceDeGros + alerts.team2.vousEtesNuls;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled} className="gap-2">
          <AlertCircle className="h-4 w-4" />
          Alertes durant la partie
          {totalAlerts > 0 && (
            <Badge variant="secondary" className="ml-1">
              {totalAlerts}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Alertes durant la partie</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Équipe 1 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">{team1Name}</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm">Épicerie</span>
                <Badge variant="secondary">{alerts.team1.epicerie}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Épicerie Fine</span>
                <Badge variant="secondary">{alerts.team1.epicerieFine}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Commerce de Gros</span>
                <Badge variant="secondary">{alerts.team1.commerceDeGros}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Vous êtes nuls</span>
                <Badge variant="destructive">{alerts.team1.vousEtesNuls}</Badge>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">{team2Name}</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm">Épicerie</span>
                <Badge variant="secondary">{alerts.team2.epicerie}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Épicerie Fine</span>
                <Badge variant="secondary">{alerts.team2.epicerieFine}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Commerce de Gros</span>
                <Badge variant="secondary">{alerts.team2.commerceDeGros}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Vous êtes nuls</span>
                <Badge variant="destructive">{alerts.team2.vousEtesNuls}</Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertsDialog;
