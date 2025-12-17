import { useState } from "react";
import BeloteApp from "@/components/BeloteApp";
import WelcomeDialog from "@/components/WelcomeDialog";
import ThemeToggle from "@/components/ThemeToggle";

export default function Index() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <>
      <ThemeToggle />
      <WelcomeDialog 
        open={showWelcome} 
        onClose={() => setShowWelcome(false)} 
      />
      <div className="flex justify-center mb-2">
        <img 
          src="/lovable-uploads/88d78836-a013-4b12-bd37-dea6ec9e1b44.png" 
          alt="ALIRABCC" 
          className="h-24 w-auto" 
        />
      </div>
      <div className="bg-background">
        <BeloteApp />
      </div>
    </>
  );
}
