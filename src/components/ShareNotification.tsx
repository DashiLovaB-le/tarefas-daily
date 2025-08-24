import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Copy, X } from 'lucide-react';
import { toast } from 'sonner';

export function ShareNotification() {
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [textToCopy, setTextToCopy] = useState('');

  useEffect(() => {
    const handleShareCopied = (event: CustomEvent) => {
      toast.success(event.detail.message, {
        icon: <Check className="h-4 w-4" />,
        duration: 3000,
      });
    };

    const handleManualCopy = (event: CustomEvent) => {
      setTextToCopy(event.detail.text);
      setShowManualCopy(true);
    };

    window.addEventListener('share-copied', handleShareCopied as EventListener);
    window.addEventListener('share-manual-copy', handleManualCopy as EventListener);

    return () => {
      window.removeEventListener('share-copied', handleShareCopied as EventListener);
      window.removeEventListener('share-manual-copy', handleManualCopy as EventListener);
    };
  }, []);

  const handleManualCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Texto copiado para a área de transferência!', {
        icon: <Check className="h-4 w-4" />,
      });
      setShowManualCopy(false);
    } catch (error) {
      toast.error('Erro ao copiar texto');
    }
  };

  const handleSelectAll = () => {
    const textArea = document.getElementById('manual-copy-text') as HTMLTextAreaElement;
    if (textArea) {
      textArea.select();
      textArea.setSelectionRange(0, 99999); // Para dispositivos móveis
    }
  };

  return (
    <Dialog open={showManualCopy} onOpenChange={setShowManualCopy}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Compartilhar Conteúdo
          </DialogTitle>
          <DialogDescription>
            Copie o texto abaixo para compartilhar:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <textarea
            id="manual-copy-text"
            value={textToCopy}
            readOnly
            className="w-full h-32 p-3 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleSelectAll}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleManualCopy}
              className="flex-1"
              size="sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Texto
            </Button>
            <Button
              onClick={() => setShowManualCopy(false)}
              variant="outline"
              size="sm"
            >
              Fechar
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Toque no texto para selecioná-lo, depois use Ctrl+C (ou Cmd+C no Mac) para copiar
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}