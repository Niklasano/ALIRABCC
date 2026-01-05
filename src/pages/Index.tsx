import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import BeloteApp from "@/components/BeloteApp";
import ThemeToggle from "@/components/ThemeToggle";

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionUrl } = useParams();

  useEffect(() => {
    // On ne génère un ID que si on est strictement sur la racine "/"
    // et qu'il n'y a pas déjà d'identifiant de session
    if (!sessionUrl && location.pathname === '/') {
      const newSessionId = Math.random().toString(36).substring(2, 7);
      navigate(`/game/${newSessionId}`, { replace: true });
    }
  }, [sessionUrl, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background pt-4">
      <ThemeToggle />
      <BeloteApp />
    </div>
  );
}