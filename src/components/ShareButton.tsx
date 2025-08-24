import { Button } from '@/components/ui/button';
import { Share2, Copy, ExternalLink } from 'lucide-react';
import { useShare } from '@/hooks/useShare';
import { type Task } from '@/lib/share';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  task?: Task;
  project?: { name: string; taskCount: number };
  type?: 'task' | 'project' | 'app';
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function ShareButton({ 
  task, 
  project, 
  type = 'app', 
  variant = 'outline', 
  size = 'sm',
  className,
  children 
}: ShareButtonProps) {
  const { shareTask, shareProject, shareApp, isSharing, shareMethod } = useShare();

  const handleShare = async () => {
    let success = false;

    if (type === 'task' && task) {
      success = await shareTask(task);
    } else if (type === 'project' && project) {
      success = await shareProject(project.name, project.taskCount);
    } else if (type === 'app') {
      success = await shareApp();
    }

    if (success) {
      console.log('ShareButton: Compartilhamento realizado com sucesso');
    }
  };

  const getIcon = () => {
    switch (shareMethod) {
      case 'native':
        return <Share2 className="h-4 w-4" />;
      case 'clipboard':
      case 'legacy':
        return <Copy className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    if (children) return children;
    
    switch (shareMethod) {
      case 'native':
        return 'Compartilhar';
      case 'clipboard':
      case 'legacy':
        return 'Copiar Link';
      default:
        return 'Compartilhar';
    }
  };

  const getTooltip = () => {
    switch (shareMethod) {
      case 'native':
        return 'Compartilhar usando apps do dispositivo';
      case 'clipboard':
        return 'Copiar link para área de transferência';
      case 'legacy':
        return 'Copiar texto para compartilhar';
      default:
        return 'Compartilhamento não disponível';
    }
  };

  if (shareMethod === 'none') {
    return null; // Não mostra o botão se não há suporte
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={isSharing}
      className={cn(className)}
      title={getTooltip()}
    >
      {isSharing ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : (
        getIcon()
      )}
      {size !== 'icon' && (
        <span className="ml-2">
          {isSharing ? 'Compartilhando...' : getLabel()}
        </span>
      )}
    </Button>
  );
}