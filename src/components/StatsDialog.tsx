
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BeloteRow } from '@/types/belote';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsDialogProps {
  open: boolean;
  onClose: () => void;
  team1Name: string;
  team2Name: string;
  data: BeloteRow[];
}

const StatsDialog: React.FC<StatsDialogProps> = ({ open, onClose, team1Name, team2Name, data }) => {
  // Calcul des statistiques
  const totalManches = data.length;
  const foisPrisE1 = data.filter(row => row.Contrat > 0).length;
  const foisPrisE2 = data.filter(row => row.Contrat_E2 > 0).length;
  const chutesE1 = data.reduce((sum, row) => sum + row.Chute, 0);
  const chutesE2 = data.reduce((sum, row) => sum + row.Chute_E2, 0);
  
  // Moyennes pour l'équipe 1
  const contratsE1 = data.filter(row => row.Contrat > 0);
  const moyenneContratE1 = contratsE1.length > 0 
    ? Math.round(contratsE1.reduce((sum, row) => sum + row.Contrat, 0) / contratsE1.length) 
    : 0;
  const moyenneRealiseE1 = contratsE1.length > 0 
    ? Math.round(contratsE1.reduce((sum, row) => sum + row.Réalisé, 0) / contratsE1.length) 
    : 0;
  const moyenneEcartsE1 = contratsE1.length > 0 
    ? Math.round(contratsE1.reduce((sum, row) => sum + row.Ecart, 0) / contratsE1.length) 
    : 0;
  
  // Moyennes pour l'équipe 2
  const contratsE2 = data.filter(row => row.Contrat_E2 > 0);
  const moyenneContratE2 = contratsE2.length > 0 
    ? Math.round(contratsE2.reduce((sum, row) => sum + row.Contrat_E2, 0) / contratsE2.length) 
    : 0;
  const moyenneRealiseE2 = contratsE2.length > 0 
    ? Math.round(contratsE2.reduce((sum, row) => sum + row.Réalisé_E2, 0) / contratsE2.length) 
    : 0;
  const moyenneEcartsE2 = contratsE2.length > 0 
    ? Math.round(contratsE2.reduce((sum, row) => sum + row.Ecart_E2, 0) / contratsE2.length) 
    : 0;

  // Préparation des données pour le graphique
  const chartData = data.map((row, index) => {
    // Calculer les scores cumulés
    const scoreE1Cum = data.slice(0, index + 1).reduce((sum, r) => sum + r.Points, 0);
    const scoreE2Cum = data.slice(0, index + 1).reduce((sum, r) => sum + r.Points_E2, 0);
    
    // Calculer les écarts théoriques cumulés avec les scores
    const ecartTheoE1 = row["Ecarts Théorique"];
    const ecartTheoE2 = row["Ecarts Théorique_E2"];
    const theoE1 = scoreE1Cum + ecartTheoE1;
    const theoE2 = scoreE2Cum + ecartTheoE2;
    
    return {
      manche: row.Mène,
      scoreE1: scoreE1Cum,
      scoreE2: scoreE2Cum,
      theoE1,
      theoE2,
      name: `Manche ${row.Mène}`
    };
  });

  const chartConfig = {
    scoreE1: {
      label: `${team1Name} Réel`,
      color: "#3b82f6" // blue-500
    },
    theoE1: {
      label: `${team1Name} Réel + Écart Théo`,
      color: "#60a5fa" // blue-400
    },
    scoreE2: {
      label: `${team2Name} Réel`,
      color: "#f97316" // orange-500
    },
    theoE2: {
      label: `${team2Name} Réel + Écart Théo`,
      color: "#fb923c" // orange-400
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] h-[95vh] max-w-none max-h-none p-3 sm:p-6 bg-white dark:bg-gray-900 shadow-xl rounded-lg sm:rounded-xl overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-2xl font-bold text-center">
            Statistiques de la partie
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400">
              Évolution des scores et performance des équipes
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-6">
          {/* Statistiques des deux équipes côte à côte */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            {/* Stats Équipe 1 */}
            <Card className="border shadow-sm overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-900 dark:border-blue-900/20">
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-blue-500"></div>
                    <span className="text-blue-700 dark:text-blue-400 font-semibold truncate">{team1Name}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Parties prises</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                      {foisPrisE1}/{totalManches}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Chutes</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">
                      {chutesE1}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Moy. Contrats</span>
                    <span className="font-mono font-medium text-xs sm:text-sm">{moyenneContratE1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Moy. Réalisé</span>
                    <span className="font-mono font-medium text-xs sm:text-sm">{moyenneRealiseE1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Moy. Écarts</span>
                    <span className="font-mono font-medium text-xs sm:text-sm">{moyenneEcartsE1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Stats Équipe 2 */}
            <Card className="border shadow-sm overflow-hidden bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/30 dark:to-gray-900 dark:border-orange-900/20">
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-orange-500"></div>
                    <span className="text-orange-700 dark:text-orange-400 font-semibold truncate">{team2Name}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Parties prises</span>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 text-xs">
                      {foisPrisE2}/{totalManches}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Chutes</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">
                      {chutesE2}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Moy. Contrats</span>
                    <span className="font-mono font-medium text-xs sm:text-sm">{moyenneContratE2}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Moy. Réalisé</span>
                    <span className="font-mono font-medium text-xs sm:text-sm">{moyenneRealiseE2}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Moy. Écarts</span>
                    <span className="font-mono font-medium text-xs sm:text-sm">{moyenneEcartsE2}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Graphique optimisé pour mobile */}
          <Card className="border shadow-sm dark:border-gray-800">
            <CardContent className="p-2 sm:p-4">
              <div className="h-[250px] sm:h-[400px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={chartData} 
                      margin={{ 
                        top: 10, 
                        right: 10, 
                        left: 0, 
                        bottom: 20 
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                      <XAxis 
                        dataKey="manche" 
                        tick={{ fontSize: 10 }}
                        stroke="#9CA3AF"
                        height={40}
                        tickMargin={5}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }}
                        stroke="#9CA3AF"
                        width={35}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '6px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          border: '1px solid rgba(229, 231, 235, 1)',
                          fontSize: '12px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '10px' }}
                        iconSize={8}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="scoreE1" 
                        name={`${team1Name} Réel`}
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        dot={{ r: 3, strokeWidth: 1 }} 
                        activeDot={{ r: 5, strokeWidth: 1 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="theoE1" 
                        name={`${team1Name} + Théo`}
                        stroke="#3b82f6" 
                        strokeWidth={1.5} 
                        strokeDasharray="3 3" 
                        dot={{ r: 2, strokeWidth: 1 }} 
                        opacity={0.7} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="scoreE2" 
                        name={`${team2Name} Réel`}
                        stroke="#f97316" 
                        strokeWidth={2} 
                        dot={{ r: 3, strokeWidth: 1 }} 
                        activeDot={{ r: 5, strokeWidth: 1 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="theoE2" 
                        name={`${team2Name} + Théo`}
                        stroke="#f97316" 
                        strokeWidth={1.5} 
                        strokeDasharray="3 3" 
                        dot={{ r: 2, strokeWidth: 1 }} 
                        opacity={0.7} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatsDialog;
