import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.sen-services.com/api/v2';
const SSE_URL = `${API_URL}/sse`;

export function useSSE() {
  const qc = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;

    let es: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      es = new EventSource(`${SSE_URL}?token=${encodeURIComponent(token!)}`);

      es.addEventListener('commande', () => {
        qc.invalidateQueries({ queryKey: ['commandes-reception'] });
        qc.invalidateQueries({ queryKey: ['dashboard-commandes-raw'] });
        qc.invalidateQueries({ queryKey: ['bon-commandes'] });
      });

      es.onerror = () => {
        es.close();
        retryTimeout = setTimeout(connect, 5_000);
      };
    }

    connect();

    return () => {
      clearTimeout(retryTimeout);
      es?.close();
    };
  }, [qc]);
}
