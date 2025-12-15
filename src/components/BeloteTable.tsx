import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DisplayRow, AlertType } from '@/types/belote';
import { Club, Diamond, Heart, Spade, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BeloteTableProps {
  teamName: string;
  rows: DisplayRow[];
}

const BeloteTable: React.FC<BeloteTableProps> = ({ teamName, rows }) => {
  // Définition des en-têtes du tableau (ajout de "Alerte")
  const headers = ["Mène", "Contrat", "Chute", "Réalisé", "Ecart", "Ecarts Théo", "Belote", "Remarques", "Points", "Alerte", "Total"];

  // Fonction pour rendre l'icône de couleur
  const renderSuitIcon = (color: string) => {
    switch (color) {
      case "Carreau":
        return <Diamond className="inline h-3 w-3 text-red-500 ml-0.5" />;
      case "Coeur":
        return <Heart className="inline h-3 w-3 text-red-500 ml-0.5" />;
      case "Pique":
        return <Spade className="inline h-3 w-3 text-foreground ml-0.5" />;
      case "Trèfle":
        return <Club className="inline h-3 w-3 text-foreground ml-0.5" />;
      default:
        return null;
    }
  };

  // Fonction pour rendre le contrat avec la couleur
  const renderContractWithSuit = (contractValue: string, suitColor?: string) => {
    if (!suitColor || contractValue === "0" || suitColor === "") {
      return contractValue;
    }
    
    // Si c'est TA ou SA, afficher directement sans icône
    if (suitColor === "TA" || suitColor === "SA") {
      return (
        <div className="flex items-center justify-center">
          <span>{contractValue}</span>
          <span className="ml-0.5 text-[10px] font-semibold">{suitColor}</span>
        </div>
      );
    }
    
    // Pour les autres couleurs, afficher avec l'icône
    return (
      <div className="flex items-center justify-center">
        <span>{contractValue}</span>
        {renderSuitIcon(suitColor)}
      </div>
    );
  };

  // Fonction pour afficher le badge d'alerte avec la bonne couleur
  const renderAlertBadge = (alerte: AlertType) => {
    if (!alerte) return null;

    const alertStyles: Record<string, { bg: string; text: string }> = {
      "Épicerie": { bg: "bg-orange-500", text: "text-white" },
      "Épicerie Fine": { bg: "bg-yellow-500", text: "text-black" },
      "Commerce de Gros": { bg: "bg-red-600", text: "text-white" },
      "Vous êtes nuls": { bg: "bg-purple-600", text: "text-white" },
    };

    const style = alertStyles[alerte] || { bg: "bg-muted", text: "text-foreground" };

    return (
      <Badge className={`${style.bg} ${style.text} text-[9px] px-1 py-0.5 whitespace-nowrap`}>
        {alerte}
      </Badge>
    );
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-2">Tableau {teamName}</h3>
      
      <div className="w-full overflow-hidden">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead 
                  key={header} 
                  className="bg-muted text-center font-bold whitespace-nowrap py-1 px-0.5 text-[10px] sm:text-xs"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="text-center text-[10px] sm:text-xs py-1 px-0.5">
                  {row.Mène}
                </TableCell>
                <TableCell className="text-center text-[10px] sm:text-xs py-1 px-0.5">
                  {renderContractWithSuit(row.Contrat, row.SuitColor)}
                </TableCell>
                <TableCell className="text-center text-[10px] sm:text-xs py-1 px-0.5">
                  {row.Chute}
                </TableCell>
                <TableCell className="text-center text-[10px] sm:text-xs py-1 px-0.5">
                  {row.Réalisé}
                </TableCell>
                <TableCell className="text-center text-[10px] sm:text-xs py-1 px-0.5">
                  {row.Ecart}
                </TableCell>
                <TableCell className="text-center text-[10px] sm:text-xs py-1 px-0.5">
                  {row["Ecarts Théo"]}
                </TableCell>
                <TableCell className="text-center text-[10px] sm:text-xs py-1 px-0.5">
                  {row.Belote}
                </TableCell>
                <TableCell className="text-center text-[10px] sm:text-xs py-1 px-0.5">
                  <div dangerouslySetInnerHTML={{ __html: row.Remarques }} />
                </TableCell>
                <TableCell className="text-center text-[10px] sm:text-xs py-1 px-0.5">
                  <div dangerouslySetInnerHTML={{ __html: row.Points }} />
                </TableCell>
                <TableCell className="text-center text-[10px] sm:text-xs py-1 px-0.5">
                  {renderAlertBadge(row.Alerte)}
                </TableCell>
                <TableCell 
                  className="text-center font-semibold text-[10px] sm:text-xs py-1 px-0.5"
                  style={{ backgroundColor: row.Total.backgroundColor }}
                >
                  {row.Total.text}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BeloteTable;
