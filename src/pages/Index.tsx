import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BeloteApp from "@/components/BeloteApp";
import ThemeToggle from "@/components/ThemeToggle";

export default function Index() {
  const navigate = useNavigate();
  const { sessionUrl } = useParams();

  useEffect(() => {
    // Si l'utilisateur arrive sur la racine "/" sans identifiant de session dans l'URL
    if (!sessionUrl && window.location.pathname === '/') {
      // Génère un identifiant aléatoire de 5 caractères pour la session
      const newSessionId = Math.random().toString(36).substring(2, 7);
      
      // Redirige vers /game/identifiant sans ajouter la page actuelle à l'historique du navigateur
      navigate(`/game/${newSessionId}`, { replace: true });
    }
  }, [sessionUrl, navigate]);

  return (
    <div className="min-h-screen bg-background pt-4">
      {/* Bouton de bascule du thème (clair/sombre) */}
      <ThemeToggle />
      
      {/* Application principale de Belote */}
      <BeloteApp />
    </div>
  );
}