const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ open, onClose }) => {
  return (
    <>
      {/* 
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Pépite, est-ce que t'es prêt à (encore) te prendre une roustasse ?
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={onClose} className="px-8 py-3 text-lg font-bold">
              OUI
            </Button>
            <Button onClick={onClose} className="px-8 py-3 text-lg font-bold">
              OUI
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      */}
    </>
  );
};
export default WelcomeDialog;
