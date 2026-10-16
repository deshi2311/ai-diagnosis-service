"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Stack } from "@mui/material";

export default function DiagnosisDetailActions({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    if (!window.confirm("この診断結果を削除しますか？")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/diagnosis/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "削除に失敗しました");
      }
      router.push("/diagnosis/history");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "削除に失敗しました");
      setDeleting(false);
    }
  };

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
      <Button href={`/diagnosis/${id}/edit`} variant="contained">
        編集
      </Button>
      <Button href="/diagnosis/history" variant="outlined">
        履歴へ
      </Button>
      <Button color="error" variant="outlined" onClick={onDelete} disabled={deleting}>
        {deleting ? "削除中..." : "削除"}
      </Button>
    </Stack>
  );
}
