// Quiz bank: 3 questions per chapter, in Telugu and English.
// Quiz language follows the user's picked Bible version.
// Keys match bible.ts chapter keys ("gen:1").
export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // index into options
}

export const QUIZ_BANK: Record<string, { te: QuizQuestion[]; en: QuizQuestion[] }> = {
  "gen:1": {
    te: [
      {
        q: "మొదటి రోజున దేవుడు ఏమి సృజించారు?",
        options: ["ఆకాశం", "వెలుగు", "భూమి", "నక్షత్రాలు"],
        answer: 1,
      },
      {
        q: "దేవుని ఆత్మ ఎక్కడ అల్లాడుతూ ఉంది?",
        options: ["పర్వతాల మీద", "నీళ్ల మీద", "అడవిలో", "ఆకాశంలో"],
        answer: 1,
      },
      {
        q: "దేవుడు వెలుగును చూసి ఏమన్నారు?",
        options: ["అది చిన్నది", "అది బాగుంది", "అది చీకటి", "అది దూరం"],
        answer: 1,
      },
    ],
    en: [
      {
        q: "What did God create on the first day?",
        options: ["The firmament", "Light", "The earth", "The stars"],
        answer: 1,
      },
      {
        q: "Where was the Spirit of God moving?",
        options: ["Over the mountains", "Over the waters", "In the forest", "In the sky"],
        answer: 1,
      },
      {
        q: "What did God see about the light?",
        options: ["That it was small", "That it was good", "That it was dark", "That it was far"],
        answer: 1,
      },
    ],
  },
  "psa:23": {
    te: [
      {
        q: "కీర్తనకారుని కాపరి ఎవరు?",
        options: ["రాజు", "యెహోవా", "ప్రవక్త", "స్నేహితుడు"],
        answer: 1,
      },
      {
        q: "ఆయన ఎక్కడ పడుకోనిస్తారు?",
        options: ["ఎడారిలో", "పచ్చికలో", "కొండమీద", "ఇంట్లో"],
        answer: 1,
      },
      {
        q: "మృత్యు నీడల లోయలో ఎందుకు భయపడడు?",
        options: ["ధైర్యవంతుడు కాబట్టి", "దేవుడు తోడున్నాడు కాబట్టి", "ఆయుధం ఉంది కాబట్టి", "లోయ చిన్నది కాబట్టి"],
        answer: 1,
      },
    ],
    en: [
      {
        q: "Who is the psalmist's shepherd?",
        options: ["The king", "The LORD", "The prophet", "A friend"],
        answer: 1,
      },
      {
        q: "Where does He make him lie down?",
        options: ["In the desert", "In green pastures", "On the mountain", "At home"],
        answer: 1,
      },
      {
        q: "Why does he fear no evil in the valley?",
        options: ["He is brave", "God is with him", "He has a weapon", "The valley is small"],
        answer: 1,
      },
    ],
  },
  "jhn:1": {
    te: [
      {
        q: "ఆదిలో ఎవరు ఉన్నారు?",
        options: ["దూత", "వాక్యం", "ప్రవక్త", "రాజు"],
        answer: 1,
      },
      {
        q: "సృష్టిలో ఉన్నవన్నీ ఎవరి ద్వారా కలిగాయి?",
        options: ["మానవుల ద్వారా", "వాక్యం ద్వారా", "దూతల ద్వారా", "ప్రకృతి ద్వారా"],
        answer: 1,
      },
      {
        q: "ఆయనలో ఏమి ఉన్నది?",
        options: ["ధనం", "జీవం", "అధికారం", "జ్ఞానం మాత్రమే"],
        answer: 1,
      },
    ],
    en: [
      {
        q: "Who was in the beginning?",
        options: ["An angel", "The Word", "A prophet", "A king"],
        answer: 1,
      },
      {
        q: "Through whom were all things made?",
        options: ["Through men", "Through the Word", "Through angels", "Through nature"],
        answer: 1,
      },
      {
        q: "What was in Him?",
        options: ["Riches", "Life", "Power", "Knowledge only"],
        answer: 1,
      },
    ],
  },
};

export function getQuiz(chapterKey: string, language: "te" | "en"): QuizQuestion[] {
  const entry = QUIZ_BANK[chapterKey];
  if (!entry) return [];
  return entry[language];
}
