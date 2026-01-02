import BeloteApp from "@/components/BeloteApp";
import ThemeToggle from "@/components/ThemeToggle";

export default function Index() {
  return (
    <div className="min-h-screen bg-background pt-4">
      {/* Le bouton thème reste accessible */}
      <ThemeToggle />
      
      {/* Le jeu commence directement ici, sans le bandeau du haut */}
      <BeloteApp />
    </div>
  );
}