
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
        return <Diamond className="inline h-4 w-4 text-red-500 ml-1" />;
      case "Coeur":
        return <Heart className="inline h-4 w-4 text-red-500 ml-1" />;
      case "Pique":
        return <Spade className="inline h-4 w-4 text-foreground ml-1" />;
      case "Trèfle":
        return <Club className="inline h-4 w-4 text-foreground ml-1" />;
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
          <span className="ml-1 text-xs font-semibold">{suitColor}</span>
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
      <Badge className={`${style.bg} ${style.text} text-[10px] px-1.5 py-0.5 whitespace-nowrap`}>
        {alerte}
      </Badge>
    );
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-2">Tableau {teamName}</h3>
      
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead 
                  key={header} 
                  className="bg-muted text-center font-bold whitespace-nowrap py-2 text-xs md:text-sm"
                  style={{ 
                    padding: '0.5rem 0.25rem',
                    width: header === "Alerte" ? '10%' : header === "Remarques" ? '10%' : header === "Mène" ? '5%' : header === "Chute" ? '6%' : '7%'
                  }}
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="text-center text-xs md:text-sm" style={{ padding: '0.5rem 0.25rem' }}>
                  {row.Mène}
                </TableCell>
                <TableCell 
                  className="text-center text-xs md:text-sm" 
                  style={{ padding: '0.5rem 0.25rem' }}
                >
                  {renderContractWithSuit(row.Contrat, row.SuitColor)}
                </TableCell>
                <TableCell className="text-center text-xs md:text-sm" style={{ padding: '0.5rem 0.25rem' }}>
                  {row.Chute}
                </TableCell>
                <TableCell className="text-center text-xs md:text-sm" style={{ padding: '0.5rem 0.25rem' }}>
                  {row.Réalisé}
                </TableCell>
                <TableCell className="text-center text-xs md:text-sm" style={{ padding: '0.5rem 0.25rem' }}>
                  {row.Ecart}
                </TableCell>
                <TableCell className="text-center text-xs md:text-sm" style={{ padding: '0.5rem 0.25rem' }}>
                  {row["Ecarts Théo"]}
                </TableCell>
                <TableCell className="text-center text-xs md:text-sm" style={{ padding: '0.5rem 0.25rem' }}>
                  {row.Belote}
                </TableCell>
                <TableCell className="text-center text-xs md:text-sm" style={{ padding: '0.5rem 0.25rem' }}>
                  <div dangerouslySetInnerHTML={{ __html: row.Remarques }} />
                </TableCell>
                <TableCell className="text-center text-xs md:text-sm" style={{ padding: '0.5rem 0.25rem' }}>
                  <div dangerouslySetInnerHTML={{ __html: row.Points }} />
                </TableCell>
                <TableCell className="text-center text-xs md:text-sm" style={{ padding: '0.5rem 0.25rem' }}>
                  {renderAlertBadge(row.Alerte)}
                </TableCell>
                <TableCell 
                  className="text-center font-semibold text-xs md:text-sm" 
                  style={{ 
                    backgroundColor: row.Total.backgroundColor,
                    padding: '0.5rem 0.25rem' 
                  }}
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
