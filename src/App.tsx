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

  // Logique dynamique pour les thèmes futurs
  if (month === 12) return 'christmas';
  if ((month === 10 && day >= 20) || (month === 11 && day <= 3)) return 'halloween';
  if (month >= 6 && month <= 8) return 'summer';
  if (month === 2 && day >= 10 && day <= 17) return 'valentine';

  return 'light'; // Thème par défaut aujourd'hui
};

const App = () => {
  const autoTheme = getAutoTheme();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    // Sécurité pour forcer le nettoyage si on sort d'une période de fête
    const festiveThemes = ['christmas', 'halloween', 'summer', 'valentine'];
    if (festiveThemes.includes(savedTheme || '') && savedTheme !== autoTheme) {
      localStorage.removeItem('theme');
      window.location.reload(); 
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
          {/* On n'applique la classe theme-xxx que si on est en période de fête */}
          <div className={`${autoTheme !== 'light' ? `theme-${autoTheme}` : ''} min-h-screen transition-colors duration-500`}>
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