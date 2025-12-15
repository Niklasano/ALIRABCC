
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ValuesDialogProps {
  open: boolean;
  onClose: () => void;
  type: "normal" | "tasa";
}

const ValuesDialog: React.FC<ValuesDialogProps> = ({ open, onClose, type }) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {type === "normal" ? "Valeur des points - Normal" : "Valeur des points - TA/SA"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="w-full">
            {type === "normal" && (
              <img 
                src="/lovable-uploads/696111e4-f1ea-4f59-8591-71380db9274a.png" 
                alt="Valeurs des cartes" 
                className="w-full h-auto rounded-md"
              />
            )}
            {type === "tasa" && (
              <img 
                src="/lovable-uploads/24b6001b-7474-4a0d-99d0-ede65246e1bb.png" 
                alt="Valeurs TA SA" 
                className="w-full h-auto rounded-md"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ValuesDialog;
