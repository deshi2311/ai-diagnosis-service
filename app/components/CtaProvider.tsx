"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Snackbar, Alert } from "@mui/material";

type CtaContextValue = {
  onCtaClick: () => void;
};

const CtaContext = createContext<CtaContextValue | null>(null);

export function useCta() {
  const ctx = useContext(CtaContext);
  if (!ctx) {
    throw new Error("useCta must be used within CtaProvider");
  }
  return ctx;
}

export default function CtaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const onCtaClick = useCallback(() => {
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ onCtaClick }), [onCtaClick]);

  return (
    <CtaContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Coming Soon
        </Alert>
      </Snackbar>
    </CtaContext.Provider>
  );
}
