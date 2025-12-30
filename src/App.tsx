import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Fonction pour déterminer le thème selon la date
const getAutoTheme = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // Janvier = 1
  const day = now.getDate();

  // Noël (Décembre)
  if (month === 12) return 'christmas';
  
  // Halloween (20 Oct au 3 Nov)
  if ((month === 10 && day >= 20) || (month === 11 && day <= 3)) return 'halloween';
  
  // Été (Juin, Juillet, Août)
  if (month >= 6 && month <= 8) return 'summer';
  
  // St Valentin (10 au 17 Février)
  if (month === 2 && day >= 10 && day <= 17) return 'valentine';

  // Par défaut
  return 'light';
};

const App = () => {
  // On récupère le thème automatique
  const autoTheme = getAutoTheme();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Ici on utilise 'defaultTheme' au lieu de 'forcedTheme'.
          Cela permet au bouton de thème de reprendre la main si l'utilisateur clique dessus.
      */}
      <ThemeProvider 
        attribute="class" 
        defaultTheme={autoTheme} 
        enableSystem={false}
      >
        <TooltipProvider>
          {/* On garde la classe 'theme-...' pour injecter les couleurs de Noël/Été, 
              mais on laisse le ThemeProvider gérer la classe 'dark' ou 'light'.
          */}
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