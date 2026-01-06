import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DisplayRow, AlertType } from '@/types/belote';
import { Club, Diamond, Heart, Spade } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BeloteTableProps {
  teamName: string;
  rows: DisplayRow[];
}

const ROW_HEIGHT = "48px"; // Hauteur fixe pour l'alignement vertical

const BeloteTable: React.FC<BeloteTableProps> = ({ teamName, rows }) => {
  const headers = ["Mène", "Contrat", "Chute", "Réalisé", "Ecart", "Ecarts Théo", "Belote", "Remarques", "Points", "Alerte", "Total"];

  const renderSuitIcon = (color: string) => {
    switch (color) {
      case "Carreau": return <Diamond className="inline h-3 w-3 text-red-500 ml-0.5" />;
      case "Coeur": return <Heart className="inline h-3 w-3 text-red-500 ml-0.5" />;
      case "Pique": return <Spade className="inline h-3 w-3 text-foreground ml-0.5" />;
      case "Trèfle": return <Club className="inline h-3 w-3 text-foreground ml-0.5" />;
      default: return null;
    }
  };

  const renderContractWithSuit = (contractValue: string, suitColor?: string) => {
    if (!suitColor || contractValue === "0" || suitColor === "") return contractValue;
    if (suitColor === "TA" || suitColor === "SA") {
      return (
        <div className="flex items-center justify-center">
          <span>{contractValue}</span>
          <span className="ml-0.5 text-[10px] font-semibold">{suitColor}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center">
        <span>{contractValue}</span>
        {renderSuitIcon(suitColor)}
      </div>
    );
  };

  const renderAlertBadge = (alerte: AlertType, chuteValue: string | number) => {
    // CONDITION : Si pas d'alerte OU si la colonne Chute est à "Oui" ou "1"
    if (!alerte || chuteValue === "Oui" || chuteValue === 1 || chuteValue === "1") {
      return null;
    }

    const alertStyles: Record<string, string> = {
      "Épicerie": "bg-orange-500 text-white border-orange-600",
      "Épicerie Fine": "bg-yellow-500 text-black border-yellow-600",
      "Commerce de Gros": "bg-red-600 text-white border-red-700",
      "Vous êtes nuls": "bg-purple-600 text-white border-purple-700",
    };

    const badgeClass = alertStyles[alerte] || "bg-muted text-foreground";

    return (
      <Badge className={`${badgeClass} text-[8px] px-1 py-0.5 whitespace-nowrap leading-none border shadow-md font-bold uppercase`}>
        {alerte}
      </Badge>
    );
  };

  // Gestion précise des largeurs pour éviter les chevauchements
  const getHeaderWidth = (header: string) => {
    switch (header) {
      case "Mène": return "6%";
      case "Ecarts Théo": return "11%";
      case "Belote": return "8%";
      case "Alerte": return "14%";
      case "Remarques": return "12%";
      case "Total": return "10%";
      default: return "auto";
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-2">Tableau {teamName}</h3>
      
      <div className="w-full overflow-hidden border rounded-md">
        <Table className="w-full table-fixed border-collapse">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              {headers.map((header) => (
                <TableHead 
                  key={header} 
                  className="bg-muted text-center font-bold py-1 px-0.5 text-[9px] sm:text-[10px] leading-tight"
                  style={{ width: getHeaderWidth(header) }}
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-muted/50 border-b last:border-0" style={{ height: ROW_HEIGHT }}>
                {[
                  row.Mène,
                  renderContractWithSuit(row.Contrat, row.SuitColor),
                  row.Chute,
                  row.Réalisé,
                  row.Ecart,
                  row["Ecarts Théo"],
                  row.Belote,
                  <div dangerouslySetInnerHTML={{ __html: row.Remarques }} />,
                  <div dangerouslySetInnerHTML={{ __html: row.Points }} />,
                  renderAlertBadge(row.Alerte, row.Chute),
                  row.Total.text
                ].map((content, i) => (
                  <TableCell 
                    key={i} 
                    className={`text-center py-0 px-0.5 text-[10px] sm:text-xs ${i === 10 ? 'font-semibold' : ''}`}
                    style={{ 
                      height: ROW_HEIGHT,
                      backgroundColor: i === 10 ? row.Total.backgroundColor : undefined 
                    }}
                  >
                    <div className="flex items-center justify-center h-full overflow-hidden leading-tight">
                      {content}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BeloteTable;