import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimedMessage(defaultTimeoutMs: number = 4000) {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setMessage(null);
  }, []);

  const show = useCallback(
    (msg: string, timeoutMs?: number) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setMessage(msg);
      const ms = timeoutMs ?? defaultTimeoutMs;
      if (ms > 0) {
        timeoutRef.current = setTimeout(() => {
          setMessage(null);
          timeoutRef.current = null;
        }, ms);
      }
    },
    [defaultTimeoutMs],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return { message, show, clear } as const;
}
