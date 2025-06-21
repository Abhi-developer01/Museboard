import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const LinkedInModal = () => {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="h3-bold">Unsupported Browser</DialogTitle>
          <DialogDescription className="text-light-3 small-regular mt-4">
            It looks like you're using the LinkedIn in-app browser. For the best
            experience and to ensure all features work correctly, please open
            this page in your main browser (like Chrome or Safari).
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedInModal;
