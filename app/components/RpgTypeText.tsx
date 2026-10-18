"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Box, Typography, type TypographyProps } from "@mui/material";
import { dqColors } from "../theme";

type RpgTypeTextProps = Omit<TypographyProps, "children"> & {
  text: string;
  /** 1文字あたりの待ち時間(ms) */
  msPerChar?: number;
  /** 完了後に点滅カーソルを出す */
  showCursor?: boolean;
  onDone?: () => void;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export default function RpgTypeText({
  text,
  msPerChar = 48,
  showCursor = true,
  onDone,
  sx,
  ...typographyProps
}: RpgTypeTextProps) {
  const chars = useMemo(() => Array.from(text), [text]);
  const reducedMotion = usePrefersReducedMotion();
  const [count, setCount] = useState(0);
  const done = chars.length > 0 && count >= chars.length;
  const doneNotified = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const skip = useCallback(() => {
    setCount(chars.length);
  }, [chars.length]);

  useEffect(() => {
    doneNotified.current = false;
    setCount(reducedMotion ? chars.length : 0);
  }, [text, chars.length, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || done) return;
    const id = window.setTimeout(() => setCount((c) => c + 1), msPerChar);
    return () => window.clearTimeout(id);
  }, [count, done, msPerChar, reducedMotion]);

  useEffect(() => {
    if (!done || doneNotified.current) return;
    doneNotified.current = true;
    onDoneRef.current?.();
  }, [done]);

  useEffect(() => {
    if (done) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, skip]);

  const visible = chars.slice(0, count).join("");

  return (
    <Typography
      component="span"
      role="button"
      tabIndex={0}
      aria-label={text}
      aria-live="polite"
      onClick={skip}
      onKeyDown={(e: ReactKeyboardEvent<HTMLSpanElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          skip();
        }
      }}
      title={done ? undefined : "クリックで全文表示"}
      sx={{
        display: "inline",
        cursor: done ? "inherit" : "pointer",
        ...sx,
      }}
      {...typographyProps}
    >
      {visible}
      {showCursor && !done ? (
        <Box
          component="span"
          aria-hidden
          className="dq-type-cursor"
          sx={{ color: dqColors.gold }}
        />
      ) : null}
      {showCursor && done ? (
        <Box
          component="span"
          aria-hidden
          className="dq-type-cursor dq-type-cursor-done"
          sx={{ color: dqColors.gold }}
        />
      ) : null}
    </Typography>
  );
}
