import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 1. Fonction pour déterminer le thème selon la date actuelle
const getAutoTheme = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // Janvier est 1
  const day = now.getDate();

  // Noël : Tout le mois de Décembre
  if (month === 12) return 'christmas';
  
  // Halloween : Du 20 Octobre au 3 Novembre
  if ((month === 10 && day >= 20) || (month === 11 && day <= 3)) return 'halloween';
  
  // Été : Juin, Juillet, Août
  if (month >= 6 && month <= 8) return 'summer';
  
  // Saint Valentin : du 10 au 17 Février
  if (month === 2 && day >= 10 && day <= 17) return 'valentine';

  // Thème par défaut (Lumineux)
  return 'light';
};

const App = () => {
  const currentTheme = getAutoTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme={currentTheme} 
        forcedTheme={currentTheme} 
        enableSystem={false}
      >
        <TooltipProvider>
          {/* 2. On applique la classe du thème sur ce conteneur principal */}
          <div className={`theme-${currentTheme} min-h-screen transition-colors duration-500`}>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/game/:sessionUrl" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;