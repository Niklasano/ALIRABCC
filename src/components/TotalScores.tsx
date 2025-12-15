
import React, { useRef } from 'react';
import { Trophy, Download } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import html2canvas from 'html2canvas';

interface TotalScoresProps {
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  team1Winner: boolean;
  team2Winner: boolean;
  victoryPoints: number;
  onSaveScores?: () => void;
}

const TotalScores: React.FC<TotalScoresProps> = ({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  team1Winner,
  team2Winner,
  victoryPoints,
  onSaveScores
}) => {
  // Calculate progress percentages based on victory threshold
  const team1Percentage = Math.min((team1Score / victoryPoints) * 100, 100);
  const team2Percentage = Math.min((team2Score / victoryPoints) * 100, 100);
  
  // Check if team is close to victory (within 200 points)
  const team1CloseToVictory = !team1Winner && (victoryPoints - team1Score) <= 200;
  const team2CloseToVictory = !team2Winner && (victoryPoints - team2Score) <= 200;

  // Add this log to debug
  console.log('Debug animation:', { 
    team1Score, 
    team2Score, 
    victoryPoints, 
    team1CloseToVictory, 
    team2CloseToVictory,
    team1Percentage,
    team2Percentage
  });

  // Reference to this component for screenshot
  const scoresRef = useRef<HTMLDivElement>(null);
  
  // Function to save the current scores section as image
  const handleSaveScoreImage = async () => {
    if (!scoresRef.current) return;
    
    try {
      const canvas = await html2canvas(scoresRef.current, {
        backgroundColor: null,
        scale: 2, // Better quality
        logging: false,
        allowTaint: true,
        useCORS: true
      });
      
      // Convert canvas to data URL
      const image = canvas.toDataURL("image/png");
      
      // Create download link
      const link = document.createElement("a");
      link.href = image;
      link.download = `Belote_Scores_${team1Name}_vs_${team2Name}_${new Date().toISOString().slice(0, 10)}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error saving scores:", error);
    }
  };
  
  return (
    <div ref={scoresRef} className="glass-card rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-center">Scores actuels</h3>
      
      <div className="space-y-6">
        {/* Équipe 1 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-team1"></span>
              <span className="font-medium text-lg">{team1Name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">{team1Score}</span>
              <span className="text-sm ml-2 text-gray-500">/ {victoryPoints}</span>
              {team1Winner && (
                <Trophy className="ml-2 h-5 w-5 text-yellow-500 animate-pulse" />
              )}
            </div>
          </div>
          
          {/* Victory alert above progress bar */}
          {team1CloseToVictory && (
            <div className="mb-1">
              <div className="inline-block bg-pink-600 px-3 py-0.5 rounded-sm text-base uppercase font-extrabold tracking-wider text-pink-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-pulse">
                PROCHE DE LA VICTOIRE
              </div>
            </div>
          )}
          
          <div className="relative">
            <Progress 
              value={team1Percentage} 
              className={`h-2.5 bg-gray-200 ${team1CloseToVictory ? 'border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : ''}`} 
            />
            {team1CloseToVictory && (
              <div 
                className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                style={{ width: `${team1Percentage}%` }} // Important: limit width to actual percentage
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-victory-pulse"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Équipe 2 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-team2"></span>
              <span className="font-medium text-lg">{team2Name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-red-600">{team2Score}</span>
              <span className="text-sm ml-2 text-gray-500">/ {victoryPoints}</span>
              {team2Winner && (
                <Trophy className="ml-2 h-5 w-5 text-yellow-500 animate-pulse" />
              )}
            </div>
          </div>
          
          {/* Victory alert above progress bar */}
          {team2CloseToVictory && (
            <div className="mb-1">
              <div className="inline-block bg-pink-600 px-3 py-0.5 rounded-sm text-base uppercase font-extrabold tracking-wider text-pink-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-pulse">
                PROCHE DE LA VICTOIRE
              </div>
            </div>
          )}
          
          <div className="relative">
            <Progress 
              value={team2Percentage} 
              className={`h-2.5 bg-gray-200 ${team2CloseToVictory ? 'border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : ''}`} 
            />
            {team2CloseToVictory && (
              <div 
                className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                style={{ width: `${team2Percentage}%` }} // Important: limit width to actual percentage
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-500 to-red-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-victory-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Winner section & Save button */}
      {(team1Winner || team2Winner) && (
        <div className="mt-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full font-bold">
              Partie terminée !
            </div>
            
            <Button 
              onClick={handleSaveScoreImage}
              variant="outline" 
              size="sm"
              className="bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800/50"
            >
              <Download className="mr-2 h-4 w-4" />
              Sauvegarder les scores
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalScores;
