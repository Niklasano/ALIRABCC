
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Users, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlayerStats {
  id: string;
  player_name: string;
  team_name: string;
  victories: number;
  games_played: number;
}

interface PlayerMergeDialogProps {
  open: boolean;
  onClose: () => void;
  players: PlayerStats[];
  onMergeComplete: () => void;
}

const PlayerMergeDialog: React.FC<PlayerMergeDialogProps> = ({
  open,
  onClose,
  players,
  onMergeComplete,
}) => {
  const [sourcePlayer, setSourcePlayer] = useState('');
  const [targetPlayer, setTargetPlayer] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMerge = async () => {
    if (!sourcePlayer || !targetPlayer) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner les deux joueurs",
        variant: "destructive",
      });
      return;
    }

    if (sourcePlayer === targetPlayer) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez pas fusionner un joueur avec lui-même",
        variant: "destructive",
      });
      return;
    }

    if (password !== 'sanslejeu') {
      toast({
        title: "Erreur",
        description: "Mot de passe incorrect",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('merge_player_stats', {
        source_player_name: sourcePlayer,
        target_player_name: targetPlayer,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Succès",
        description: `Statistiques de "${sourcePlayer}" fusionnées dans "${targetPlayer}"`,
      });

      onMergeComplete();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la fusion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de fusionner les joueurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSourcePlayer('');
    setTargetPlayer('');
    setPassword('');
    onClose();
  };

  const sourcePlayerData = players.find(p => p.player_name === sourcePlayer);
  const targetPlayerData = players.find(p => p.player_name === targetPlayer);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Fusionner les joueurs
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Joueur source (sera supprimé) :</Label>
            <Select value={sourcePlayer} onValueChange={setSourcePlayer}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le joueur source..." />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => (
                  <SelectItem key={`source-${player.id}`} value={player.player_name}>
                    {player.player_name} ({player.victories}V - {player.games_played}P)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Joueur cible (recevra les stats) :</Label>
            <Select value={targetPlayer} onValueChange={setTargetPlayer}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le joueur cible..." />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => (
                  <SelectItem key={`target-${player.id}`} value={player.player_name}>
                    {player.player_name} ({player.victories}V - {player.games_played}P)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sourcePlayerData && targetPlayerData && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
                <AlertTriangle className="w-4 h-4" />
                Aperçu de la fusion
              </div>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>"{sourcePlayerData.player_name}"</strong> sera supprimé</p>
                <p><strong>"{targetPlayerData.player_name}"</strong> aura :</p>
                <p className="ml-4">• Victoires: {targetPlayerData.victories + sourcePlayerData.victories}</p>
                <p className="ml-4">• Parties: {targetPlayerData.games_played + sourcePlayerData.games_played}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="mergePassword">Mot de passe requis :</Label>
            <Input
              id="mergePassword"
              type="password"
              placeholder="Entrez le mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleMerge} 
            disabled={loading || !sourcePlayer || !targetPlayer || !password}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fusion en cours...
              </>
            ) : (
              'Fusionner'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerMergeDialog;
