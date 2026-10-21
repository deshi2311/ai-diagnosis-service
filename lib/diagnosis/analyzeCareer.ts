import Anthropic from "@anthropic-ai/sdk";
import type { DiagnosisAnswers } from "@/lib/diagnosis/questions";
import { DIAGNOSIS_QUESTIONS } from "@/lib/diagnosis/questions";

export const CLAUDE_MODEL = "claude-haiku-5-5";
export const CLAUDE_MAX_TOKENS = 8192;

/** 2026-10-11 時点の標準料金（USD / 100万トークン） */
const PRICE = {
  low: { input: 0.1, output: 0.5 },
  high: { input: 0.5, output: 2.5 },
  threshold: 100_000,
} as const;

export type CareerAnalysis = {
  strengthType: string;
  suitableJobs: string[];
  nextSteps: string[];
  summary: string;
  careerRoadmap: {
    shortTerm: string;
    midTerm: string;
    longTerm: string;
  };
};

export type AnalysisSuccess = {
  ok: true;
  analysis: CareerAnalysis;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheCreationTokens: number;
  };
  estimatedCostUsd: number;
  stopReason: string | null;
};

export type AnalysisFailure = {
  ok: false;
  code: "refusal" | "max_tokens" | "context_exceeded" | "parse_error" | "api_error";
  message: string;
};

export type AnalysisResult = AnalysisSuccess | AnalysisFailure;

function buildUserPrompt(answers: DiagnosisAnswers) {
  const lines = DIAGNOSIS_QUESTIONS.map((q) => {
    return `【${q.label}】\n${answers[q.id]}`;
  });
  return [
    "あなたはキャリアアドバイザーです。以下の回答をもとに、日本語でキャリア診断をしてください。",
    "出力は必ず次のJSONオブジェクトのみ（前後に説明文やコードフェンスを付けない）:",
    `{
  "strengthType": "強みタイプを短い日本語で",
  "suitableJobs": ["向いている職種1", "職種2", "職種3"],
  "nextSteps": [
    "今日できる具体的な行動1つ（所要時間を必ず含める。例: 職務経歴の棚卸しを書く（約20分））",
    "そのあとに取り組む行動2",
    "さらにそのあとの行動3"
  ],
  "summary": "全体の要約（2〜4文）",
  "careerRoadmap": {
    "shortTerm": "短期（〜6ヶ月）のプラン",
    "midTerm": "中期（6ヶ月〜2年）のプラン",
    "longTerm": "長期（2〜5年）のプラン"
  }
}`,
    "",
    "## nextSteps のルール（重要）",
    "- 必ず3件。順番は「今日やること → そのあと → さらにそのあと」。",
    "- 1件目だけが「今すぐ着手できる今日の行動」。所要時間（例: 約15分 / 約30分）を文中に必ず入れる。",
    "- 1件目は棚卸し・比較・申し出などを並列に並べず、最初の一手に絞る。",
    "- 2件目・3件目は今日やらなくてもよい後続アクションにする。",
    "",
    "## 労働条件・待遇についてのルール（重要）",
    "- 残業の多少、休日、給与、リモート可否、裁量の有無など、職域一般の労働条件を事実のように断定しない。",
    "- 「無理な残業が少ない」「ワークライフバランスが良い」「給料が高い」などの推測を書いてはいけない。",
    "- 条件に触れる場合は、必ず「求人ごと／企業ごとに条件を確認しましょう」など確認を促す表現にする。",
    "- summary・suitableJobs・careerRoadmap・nextSteps のいずれでも、未確認の労働条件を断定しない。",
    "",
    "## 回答",
    ...lines,
  ].join("\n");
}

function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function parseAnalysisJson(text: string): CareerAnalysis | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const data = JSON.parse(cleaned) as Partial<CareerAnalysis>;
    if (
      typeof data.strengthType !== "string" ||
      !Array.isArray(data.suitableJobs) ||
      !Array.isArray(data.nextSteps) ||
      typeof data.summary !== "string" ||
      !data.careerRoadmap ||
      typeof data.careerRoadmap.shortTerm !== "string" ||
      typeof data.careerRoadmap.midTerm !== "string" ||
      typeof data.careerRoadmap.longTerm !== "string"
    ) {
      return null;
    }
    return {
      strengthType: data.strengthType,
      suitableJobs: data.suitableJobs.map(String),
      nextSteps: data.nextSteps.map(String),
      summary: data.summary,
      careerRoadmap: {
        shortTerm: data.careerRoadmap.shortTerm,
        midTerm: data.careerRoadmap.midTerm,
        longTerm: data.careerRoadmap.longTerm,
      },
    };
  } catch {
    return null;
  }
}

export function estimateCostUsd(usage: {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
}) {
  const inputLike =
    usage.inputTokens + usage.cacheReadTokens + usage.cacheCreationTokens;
  const tier = inputLike <= PRICE.threshold ? PRICE.low : PRICE.high;
  const inputCost = (inputLike / 1_000_000) * tier.input;
  const outputCost = (usage.outputTokens / 1_000_000) * tier.output;
  return Number((inputCost + outputCost).toFixed(6));
}

export async function analyzeCareer(
  answers: DiagnosisAnswers,
): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      code: "api_error",
      message: "ANTHROPIC_API_KEY が設定されていません",
    };
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      messages: [{ role: "user", content: buildUserPrompt(answers) }],
      output_config: { effort: "low" },
    });

    const stopReason = response.stop_reason;
    if (stopReason === "refusal") {
      return {
        ok: false,
        code: "refusal",
        message: "AIが回答を拒否しました。表現を変えて再度お試しください。",
      };
    }
    if (stopReason === "max_tokens") {
      return {
        ok: false,
        code: "max_tokens",
        message: "回答が途中で切れました。もう一度お試しください。",
      };
    }
    if (stopReason === "model_context_window_exceeded") {
      return {
        ok: false,
        code: "context_exceeded",
        message: "入力が長すぎます。回答を短くして再度お試しください。",
      };
    }

    const text = extractText(response.content);
    const analysis = parseAnalysisJson(text);
    if (!analysis) {
      return {
        ok: false,
        code: "parse_error",
        message: "AIの回答形式を解析できませんでした。もう一度お試しください。",
      };
    }

    const usage = {
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
      cacheReadTokens:
        (response.usage as { cache_read_input_tokens?: number })
          ?.cache_read_input_tokens ?? 0,
      cacheCreationTokens:
        (response.usage as { cache_creation_input_tokens?: number })
          ?.cache_creation_input_tokens ?? 0,
    };

    return {
      ok: true,
      analysis,
      usage,
      estimatedCostUsd: estimateCostUsd(usage),
      stopReason,
    };
  } catch (error) {
    console.error("analyzeCareer", error);
    return {
      ok: false,
      code: "api_error",
      message: "AI分析に失敗しました。しばらくしてから再度お試しください。",
    };
  }
}
