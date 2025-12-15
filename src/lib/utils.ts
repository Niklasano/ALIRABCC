
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction utilitaire pour définir la largeur des colonnes du tableau en fonction du nom de l'en-tête
export function getColumnWidth(header: string): string {
  switch (header) {
    case "Mène":
      return "5%";
    case "Chute":
      return "6%";
    case "Remarques":
      return "12%";
    default:
      return "8%";
  }
}
