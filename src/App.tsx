import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react"; // NE PAS OUBLIER CET IMPORT

const queryClient = new QueryClient();

const getAutoTheme = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  if (month === 12) return 'christmas';
  if ((month === 10 && day >= 20) || (month === 11 && day <= 3)) return 'halloween';
  if (month >= 6 && month <= 8) return 'summer';
  if (month === 2 && day >= 10 && day <= 17) return 'valentine';

  return 'light';
};

const App = () => {
  const autoTheme = getAutoTheme();

  // FORCE LE NETTOYAGE POUR FIREFOX
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    // Si on n'est plus en décembre mais que Firefox a gardé "christmas"
    if (savedTheme === 'christmas' && autoTheme !== 'christmas') {
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