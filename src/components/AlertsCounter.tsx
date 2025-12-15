import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BeloteRow } from '@/types/belote';

interface AlertsCounterProps {
  gameData: BeloteRow[];
  team1Name: string;
  team2Name: string;
}

const AlertsCounter: React.FC<AlertsCounterProps> = ({ gameData, team1Name, team2Name }) => {
  // Compter les différentes alertes pour chaque équipe
  const countAlerts = () => {
    const alerts = {
      team1: {
        epicerie: 0,
        vousEtesNuls: 0,
        commerceDeGros: 0,
      },
      team2: {
        epicerie: 0,
        vousEtesNuls: 0,
        commerceDeGros: 0,
      }
    };

    gameData.forEach(row => {
      // Épicerie Fine (écart théorique >= 30)
      const ecartTheoE1 = row["Ecarts Théorique"];
      const ecartTheoE2 = row["Ecarts Théorique_E2"];
      
      if (ecartTheoE1 >= 30) alerts.team1.epicerie++;
      if (ecartTheoE2 >= 30) alerts.team2.epicerie++;

      // Commerce de Gros (écart théorique >= 50)
      if (ecartTheoE1 >= 50) alerts.team1.commerceDeGros++;
      if (ecartTheoE2 >= 50) alerts.team2.commerceDeGros++;

      // Vous êtes nuls (capot non annoncé)
      if (row.Remarques === "Vous êtes nuls") alerts.team1.vousEtesNuls++;
      if (row.Remarques_E2 === "Vous êtes nuls") alerts.team2.vousEtesNuls++;
    });

    return alerts;
  };

  const alerts = countAlerts();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Alertes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Équipe 1 */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground">{team1Name}</h4>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm">Épicerie Fine</span>
              <Badge variant="secondary">{alerts.team1.epicerie}</Badge>
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
              <span className="text-sm">Épicerie Fine</span>
              <Badge variant="secondary">{alerts.team2.epicerie}</Badge>
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
      </CardContent>
    </Card>
  );
};

export default AlertsCounter;
