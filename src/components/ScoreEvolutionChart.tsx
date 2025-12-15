import React from 'react';
import { BeloteRow } from '@/types/belote';
import {
  ChartContainer,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreEvolutionChartProps {
  team1Name: string;
  team2Name: string;
  data: BeloteRow[];
  compact?: boolean;
}

const ScoreEvolutionChart: React.FC<ScoreEvolutionChartProps> = ({ 
  team1Name, 
  team2Name, 
  data,
  compact = false 
}) => {
  if (data.length === 0) return null;

  // Préparation des données pour le graphique
  const chartData = data.map((row, index) => {
    const scoreE1Cum = data.slice(0, index + 1).reduce((sum, r) => sum + r.Points, 0);
    const scoreE2Cum = data.slice(0, index + 1).reduce((sum, r) => sum + r.Points_E2, 0);
    
    return {
      manche: row.Mène,
      scoreE1: scoreE1Cum,
      scoreE2: scoreE2Cum,
      name: `Manche ${row.Mène}`
    };
  });

  const chartConfig = {
    scoreE1: {
      label: team1Name,
      color: "#3b82f6"
    },
    scoreE2: {
      label: team2Name,
      color: "#f97316"
    }
  };

  return (
    <Card className="border shadow-sm bg-card">
      <CardHeader className={compact ? "pb-2 pt-3 px-3" : "pb-2"}>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Évolution des scores
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "p-2" : "p-4"}>
        <div className={compact ? "h-[200px]" : "h-[280px]"}>
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData} 
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="manche" 
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickMargin={5}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid hsl(var(--border))',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px' }}
                  iconSize={10}
                />
                <Line 
                  type="monotone" 
                  dataKey="scoreE1" 
                  name={team1Name}
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: 3, strokeWidth: 1 }} 
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="scoreE2" 
                  name={team2Name}
                  stroke="#f97316" 
                  strokeWidth={2} 
                  dot={{ r: 3, strokeWidth: 1 }} 
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreEvolutionChart;
