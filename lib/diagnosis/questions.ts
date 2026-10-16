export const DIAGNOSIS_QUESTIONS = [
  {
    id: "q1" as const,
    label: "今の状況に一番近いものはどれですか？",
    placeholder: "例: 就活中で業界が決まらない / 転職を検討中 / キャリアの方向性に悩んでいる",
  },
  {
    id: "q2" as const,
    label: "仕事で大切にしたい価値観は何ですか？",
    placeholder: "例: 成長、安定、裁量、人の役に立つこと、報酬 など",
  },
  {
    id: "q3" as const,
    label: "得意なこと・好きなことは何ですか？",
    placeholder: "例: 人と話す、調べる、作る、まとめる、教える など",
  },
  {
    id: "q4" as const,
    label: "避けたいこと・苦手だと感じることは何ですか？",
    placeholder: "例: ノルマ重視、単調作業、長時間拘束 など",
  },
  {
    id: "q5" as const,
    label: "1〜3年後に目指したい姿を教えてください",
    placeholder: "例: 専門性を身につけたい / チームをリードしたい / 働き方を変えたい",
  },
] as const;

export type DiagnosisAnswers = {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
};

export function validateAnswers(input: unknown): DiagnosisAnswers | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  const answers = {
    q1: typeof obj.q1 === "string" ? obj.q1.trim() : "",
    q2: typeof obj.q2 === "string" ? obj.q2.trim() : "",
    q3: typeof obj.q3 === "string" ? obj.q3.trim() : "",
    q4: typeof obj.q4 === "string" ? obj.q4.trim() : "",
    q5: typeof obj.q5 === "string" ? obj.q5.trim() : "",
  };
  if (Object.values(answers).some((v) => v.length < 1 || v.length > 1000)) {
    return null;
  }
  return answers;
}
