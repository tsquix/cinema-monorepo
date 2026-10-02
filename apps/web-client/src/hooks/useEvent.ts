import { useCallback, useInsertionEffect, useRef } from "react";

// Keeps a stable callback identity across renders so it can be passed to memoized children.
export function useEvent<Args extends unknown[], Result>(
  handler: (...args: Args) => Result,
) {
  const handlerRef = useRef(handler);

  useInsertionEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args: Args) => handlerRef.current(...args), []);
}
