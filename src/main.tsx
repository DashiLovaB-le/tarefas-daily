
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Registro do service worker com verificação de MIME type
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', {
      type: 'module'
    })
      .then((registration) => {
        console.log('SW registrado com sucesso:', registration);
        
        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova atualização disponível
                console.log('Nova versão do SW disponível');
                showUpdateNotification();
              }
            });
          }
        });
        
        // Verificar se há um SW esperando para ser ativado
        if (registration.waiting) {
          showUpdateNotification();
        }
      })
      .catch((registrationError) => {
        console.log('Erro no registro do SW:', registrationError);
      });
  });
}

// Função para mostrar notificação de atualização
function showUpdateNotification() {
  if (confirm('Nova versão disponível. Atualizar agora?')) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }
}

// Listener para quando o SW é atualizado
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  console.log('SW atualizado, recarregando página...');
  window.location.reload();
});
