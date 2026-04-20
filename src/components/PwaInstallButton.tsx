import { useEffect, useState } from "react";
import { CloudDownload, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const isIosDevice = (userAgent: string) => /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && (navigator as any).standalone);

const PwaInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIosInstallAvailable, setIsIosInstallAvailable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      setShowInstructions(false);
      setIsIosInstallAvailable(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleAppInstalled as EventListener);

    const userAgent = window.navigator.userAgent.toLowerCase();
    if (isIosDevice(userAgent) && !isStandalone()) {
      setVisible(true);
      setIsIosInstallAvailable(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", handleAppInstalled as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setVisible(false);
        setDeferredPrompt(null);
      }
    } else if (isIosInstallAvailable) {
      setShowInstructions((prev) => !prev);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Enlace copiado",
        description: "Página web compartida",
      });
    } catch {
      toast({
        title: "No se pudo copiar",
        description: "Intenta copiar manualmente el enlace",
        variant: "destructive",
      });
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="text-center">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
        >
          <CloudDownload className="h-4 w-4" />
          {deferredPrompt ? "Instalar app" : "Añadir a pantalla de inicio"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-foreground shadow-lg shadow-slate-900/10 transition hover:bg-secondary/90"
        >
          <Share2 className="h-4 w-4" />
          Compartir enlace
        </button>
      </div>
      {isIosInstallAvailable && showInstructions && (
        <p className="mt-3 max-w-xs text-xs text-muted-foreground">
          Para instalar en iOS, pulsa el icono de compartir y selecciona "Añadir a pantalla de inicio".
        </p>
      )}
    </div>
  );
};

export default PwaInstallButton;
