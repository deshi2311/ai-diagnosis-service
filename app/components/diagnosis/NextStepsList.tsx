import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";
import { dqColors } from "@/app/theme";

type NextStepsListProps = {
  steps: string[];
};

/** 先頭を「今日やること」、残りを「そのあと」として表示 */
export default function NextStepsList({ steps }: NextStepsListProps) {
  const [today, ...later] = steps;

  if (!today) {
    return (
      <Typography sx={{ color: dqColors.inkMuted }}>次の一歩はまだありません</Typography>
    );
  }

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "var(--font-display), DotGothic16, monospace",
          color: dqColors.crimson,
          letterSpacing: "0.08em",
          mb: 1,
        }}
      >
        きょうやること
      </Typography>
      <Box
        sx={{
          p: 2,
          mb: later.length ? 2.5 : 0,
          border: `2px solid ${dqColors.gold}`,
          bgcolor: "#FFF8E7",
        }}
      >
        <Typography className="dq-cursor" sx={{ color: dqColors.ink, lineHeight: 1.8 }}>
          {today}
        </Typography>
      </Box>

      {later.length > 0 ? (
        <>
          <Typography
            sx={{
              fontFamily: "var(--font-display), DotGothic16, monospace",
              color: dqColors.inkMuted,
              letterSpacing: "0.06em",
              mb: 1,
            }}
          >
            そのあと
          </Typography>
          <List dense disablePadding>
            {later.map((step) => (
              <ListItem key={step} disableGutters>
                <ListItemText
                  primary={
                    <Typography className="dq-cursor" sx={{ color: dqColors.ink }}>
                      {step}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </>
      ) : null}
    </Box>
  );
}
