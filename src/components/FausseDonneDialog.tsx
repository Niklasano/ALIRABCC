import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FausseDonneDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectTeam: (team: 1 | 2) => void;
  team1Name: string;
  team2Name: string;
}

const FausseDonneDialog: React.FC<FausseDonneDialogProps> = ({
  open,
  onClose,
  onSelectTeam,
  team1Name,
  team2Name,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Fausse Donne</AlertDialogTitle>
          <AlertDialogDescription>
            Quelle équipe reçoit les 160 points de fausse donne ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onClose}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onSelectTeam(1)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {team1Name}
          </AlertDialogAction>
          <AlertDialogAction
            onClick={() => onSelectTeam(2)}
            className="bg-red-600 hover:bg-red-700"
          >
            {team2Name}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FausseDonneDialog;
