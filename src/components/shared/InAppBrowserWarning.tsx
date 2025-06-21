import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const InAppBrowserWarning = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    // A simple regex to detect common in-app browsers (webviews)
    const isWebView = /linkedin|fbav|fban|instagram|wv/.test(userAgent);

    if (isWebView) {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) {
    return null;
  }

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Open in your main browser</DialogTitle>
          <DialogDescription className="mt-2">
            To log in securely, please open this page in your main mobile browser.
            <br /><br />
            Tap the three dots (⋮) in the corner and select 'Open in Browser'.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default InAppBrowserWarning;
