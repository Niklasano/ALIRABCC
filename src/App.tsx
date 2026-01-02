import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * Détermine le thème visuel selon le calendrier.
 * Aujourd'hui (2 Janvier), elle retournera 'light'.
 */
const getAutoTheme = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // Janvier = 1
  const day = now.getDate();

  // NOËL : Uniquement en Décembre
  if (month === 12) return 'christmas';
  
  // HALLOWEEN : Du 20 Octobre au 3 Novembre
  if ((month === 10 && day >= 20) || (month === 11 && day <= 3)) return 'halloween';
  
  // ÉTÉ : Juin, Juillet, Août
  if (month >= 6 && month <= 8) return 'summer';
  
  // SAINT VALENTIN : Du 10 au 17 Février
  if (month === 2 && day >= 10 && day <= 17) return 'valentine';

  // THÈME STANDARD : Pour tout le reste de l'année
  return 'light';
};

const App = () => {
  const autoTheme = getAutoTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme={autoTheme} 
        enableSystem={false}
        // Le 'key' force le rafraîchissement immédiat quand on change de thème
        key={autoTheme} 
      >
        <TooltipProvider>
          {/* On applique la classe dynamique ici */}
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