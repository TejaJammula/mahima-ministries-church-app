// Chapter quiz: questions one by one, 4 options each, then a total score
// screen. Score is saved via store.saveQuizScore. Quiz language follows the
// Bible version the user was reading.
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { MutedText, PrimaryButton } from "../ui";
import { useAppTheme } from "../../theme/ThemeContext";
import { getQuiz } from "../../data/quiz";
import { store } from "../../storage/store";

interface QuizFlowProps {
  chapterKey: string;
  language: "te" | "en";
  chapterLabel: string;
  onClose: () => void;
  onFinished: () => void;
}

export function QuizFlow({ chapterKey, language, chapterLabel, onClose, onFinished }: QuizFlowProps) {
  const { colors, fs } = useAppTheme();
  const questions = getQuiz(chapterKey, language);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  if (questions.length === 0) {
    return (
      <QuizShell onClose={onClose}>
        <MutedText style={{ color: colors.textMuted, fontSize: fs(15), textAlign: "center" }}>
          No quiz is available for this chapter yet.
        </MutedText>
        <PrimaryButton title="Close" onPress={onClose} />
      </QuizShell>
    );
  }

  const q = questions[idx];
  const total = questions.length;

  const next = async () => {
    if (picked === null) return;
    const wasCorrect = picked === q.answer;
    const newCorrect = correct + (wasCorrect ? 1 : 0);
    setCorrect(newCorrect);
    setPicked(null);
    if (idx + 1 >= total) {
      await store.saveQuizScore(chapterKey, newCorrect, total);
      setDone(true);
    } else {
      setIdx(idx + 1);
    }
  };

  if (done) {
    const pct = Math.round((correct / total) * 100);
    return (
      <QuizShell onClose={onClose}>
        <Text style={{ color: colors.primary, fontSize: fs(14), fontWeight: "800", letterSpacing: 1.2, textAlign: "center" }}>
          QUIZ COMPLETE
        </Text>
        <Text style={{ color: colors.text, fontSize: fs(44), fontWeight: "800", textAlign: "center", marginTop: 12 }}>
          {pct}%
        </Text>
        <Text style={{ color: colors.text, fontSize: fs(17), fontWeight: "700", textAlign: "center", marginTop: 4 }}>
          {correct} of {total} correct
        </Text>
        <MutedText style={{ color: colors.textMuted, fontSize: fs(14), textAlign: "center", marginTop: 8 }}>
          {pct === 100 ? "Perfect — well done! 🎉" : pct >= 67 ? "Good work — keep growing! 🌱" : "Keep reading and try again! 📖"}
        </MutedText>
        <PrimaryButton title="Done" onPress={onFinished} />
      </QuizShell>
    );
  }

  return (
    <QuizShell onClose={onClose}>
      <Text style={{ color: colors.textMuted, fontSize: fs(13), fontWeight: "700" }}>
        Quiz · {chapterLabel} · {idx + 1} of {total}
      </Text>
      <Text style={{ color: colors.text, fontSize: fs(18), fontWeight: "700", marginTop: 10, lineHeight: fs(26) }}>
        {q.q}
      </Text>
      <View style={{ marginTop: 14 }}>
        {q.options.map((opt, i) => {
          const selected = picked === i;
          return (
            <Pressable
              key={i}
              onPress={() => setPicked(i)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={{
                borderWidth: 1.5,
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.primarySoft : colors.background,
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: colors.text, fontSize: fs(15), fontWeight: selected ? "700" : "400" }}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <PrimaryButton title={idx + 1 >= total ? "Finish" : "Next"} onPress={() => void next()} />
    </QuizShell>
  );
}

function QuizShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        padding: 20,
        paddingTop: 64,
        zIndex: 10,
      }}
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close quiz"
        style={{ alignSelf: "flex-end", padding: 8, marginBottom: 8 }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 22, fontWeight: "700" }}>✕</Text>
      </Pressable>
      {children}
    </View>
  );
}
