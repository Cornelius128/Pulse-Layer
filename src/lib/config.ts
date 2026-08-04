export const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:5001`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
};

export const getWsUrl = (): string => {
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${window.location.hostname}:5001/ws`;
  }
  return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5001/ws';
};
