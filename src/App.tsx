import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const getAutoTheme = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // NOËL : Uniquement en Décembre
  if (month === 12) return 'christmas';
  
  // HALLOWEEN : 20 Octobre au 3 Novembre
  if ((month === 10 && day >= 20) || (month === 11 && day <= 3)) return 'halloween';
  
  // ÉTÉ : Juin, Juillet, Août
  if (month >= 6 && month <= 8) return 'summer';
  
  // SAINT VALENTIN : 10 au 17 Février
  if (month === 2 && day >= 10 && day <= 17) return 'valentine';

  return 'light'; // Standard
};

const App = () => {
  const autoTheme = getAutoTheme();

  useEffect(() => {
    // SECURITÉ NAVIGATEUR (Chrome/Firefox) : 
    // Si on n'est plus en période de fête, on nettoie le stockage local
    const savedTheme = localStorage.getItem('theme');
    const festiveThemes = ['christmas', 'halloween', 'summer', 'valentine'];
    
    if (festiveThemes.includes(savedTheme || '') && savedTheme !== autoTheme) {
      localStorage.removeItem('theme');
      // On ne reload que si nécessaire pour éviter les boucles
      if (savedTheme !== 'light') window.location.reload();
    }
  }, [autoTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme={autoTheme} 
        enableSystem={false}
        key={autoTheme}
      >
        <TooltipProvider>
          {/* La classe theme-xxx permet d'appliquer les couleurs du CSS */}
          <div className={`theme-${autoTheme} min-h-screen transition-colors duration-500`}>
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