// Daily devotional content: verse of the day + 4-paragraph prayer (Telugu + English).
// The verse rotates by day-of-year. Architecture supports a full 365-day list;
// these sample days demonstrate the format. Prayers are written to be prayed
// aloud, grounded in the day's verse.
export interface DevotionalDay {
  ref: string; // e.g. "Psalm 23:1"
  refTe: string; // e.g. "కీర్తనలు 23:1"
  verseTe: string;
  verseEn: string;
  prayerTe: string[]; // 4 paragraphs
  prayerEn: string[]; // 4 paragraphs
}

export const DEVOTIONAL_DAYS: DevotionalDay[] = [
  {
    ref: "Psalm 23:1",
    refTe: "కీర్తనలు 23:1",
    verseTe: "యెహోవా నా కాపరి, నాకు ఏ కొరత లేదు.",
    verseEn: "The LORD is my shepherd; I shall not want.",
    prayerTe: [
      "ప్రభువా, నీవు నా కాపరివని ఈ ఉదయం నేను ఒప్పుకుంటున్నాను. నా జీవితంలోని ప్రతి అవసరం నీకు తెలుసు — నా కుటుంబం, నా పని, నా ఆరోగ్యం, నా భవిష్యత్తు. కాపరి తన మందను కాపాడినట్లు నీవు నన్ను కాపాడుతావని నమ్ముతున్నాను. నా హృదయంలోని ఆందోళనలన్నీ నీ పాదాల వద్ద ఉంచుతున్నాను.",
      "తండ్రీ, కొరత అనే మాట నా నోటి నుండి తొలగించు. నాకు లేనిదాన్ని చూసి దుఃఖించకుండా, నీవు ఇచ్చినదాన్ని చూసి కృతజ్ఞతతో నింపు. నా పిల్లలకు, నా ఇంటికి కావలసినదంతా నీవు సమకూరుస్తావని విశ్వసిస్తున్నాను. నా అవసరాల కంటే నీ వాగ్దానాలు గొప్పవని నాకు గుర్తుచేయి.",
      "యేసయ్యా, నీవు మంచి కాపరివి — నా కోసం ప్రాణం పెట్టినవాడివి. ఈ రోజు నేను నడిచే ప్రతి అడుగులో నీ స్వరం వినే చెవులు నాకు దయచేయి. తప్పుదారి పట్టకుండా, లోకపు శబ్దాలకు లొంగకుండా నన్ను కాపాడు. నా నిర్ణయాలన్నిటిలో నీ చిత్తమే జరగనివ్వు.",
      "పరిశుద్ధాత్మా, ఈ రోజంతా నాతో ఉండు. నేను పనిచేసే చోట, నేను మాట్లాడే మాటల్లో, నేను కలిసే ప్రతి వ్యక్తిలో నీ శాంతి నా ద్వారా ప్రవహించనివ్వు. సాయంత్రం నేను ఇంటికి తిరిగి వచ్చేటప్పుడు, 'నాకు ఏ కొరత లేదు' అని సాక్ష్యమిచ్చే హృదయంతో రానివ్వు. యేసు నామంలో ప్రార్థిస్తున్నాను, ఆమేన్.",
    ],
    prayerEn: [
      "Lord, this morning I confess that You are my shepherd. You know every need in my life — my family, my work, my health, my future. As a shepherd guards his flock, I believe You guard me. I lay every anxiety in my heart at Your feet today.",
      "Father, remove the word 'lack' from my mouth. Instead of grieving over what I do not have, fill me with gratitude for what You have given. I trust You to provide everything my children and my home need. Remind me that Your promises are greater than my needs.",
      "Jesus, You are the good shepherd who laid down His life for me. Give me ears to hear Your voice in every step I take today. Keep me from wandering, keep me from surrendering to the noise of this world. Let Your will be done in all my decisions.",
      "Holy Spirit, stay with me through this whole day. In my workplace, in my words, in every person I meet, let Your peace flow through me. When I return home this evening, let me come with a heart that testifies, 'I shall not want.' In Jesus' name I pray, Amen.",
    ],
  },
  {
    ref: "John 1:1",
    refTe: "యోహాను 1:1",
    verseTe: "ఆదిలో వాక్యం ఉన్నది. ఆ వాక్యం దేవునితో ఉన్నది, ఆ వాక్యమే దేవుడు.",
    verseEn: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    prayerTe: [
      "నిత్యుడవైన దేవా, ఆదికి ముందే ఉన్నవాడా, నీ మహిమను చూసి నేను ఆశ్చర్యపడుతున్నాను. నా చిన్న జీవితం, నా చిన్న సమస్యలు నీ నిత్యత్వం ముందు ఎంత చిన్నవో గ్రహిస్తున్నాను. అయినా నీవు నన్ను ప్రేమించి, నా వద్దకు వచ్చావు — ఈ ప్రేమకు నా కృతజ్ఞత చాలదు.",
      "వాక్యమైన యేసయ్యా, నీవే దేవుడవని నేను నమ్ముతున్నాను. నా నమ్మకం కేవలం మాటల్లో కాక, నా జీవితంలో కనిపించనివ్వు. నేను చదివే వాక్యం నా హృదయాన్ని మార్చనివ్వు — నా కోపాన్ని, నా అహాన్ని, నా భయాన్ని నీ వాక్యపు వెలుగులో కాల్చివేయి.",
      "తండ్రీ, నా ఇంట్లో నీ వాక్యానికి స్థానం దయచేయి. మేము భోజనం చేసే బల్ల వద్ద, మేము నిద్రపోయే ముందు, మేము ఉదయం లేవగానే నీ వాక్యం మా సంభాషణలో ఉండనివ్వు. నా పిల్లలు నీ వాక్యాన్ని ప్రేమించేలా నా జీవితమే వారికి ఉదాహరణ కానివ్వు.",
      "ప్రభువా, ఈ రోజు నా నోటి నుండి వచ్చే ప్రతి మాట నీ వాక్యానికి తగినట్లుండనివ్వు. నా మాటలు ఎవరినీ గాయపరచకుండా, ఎవరినో ఒకరిని ఆదరించేలా, బలపరిచేలా ఉండనివ్వు. ఆదిలో ఉన్న వాక్యమే నా జీవితానికి ఆధారం కానివ్వు. యేసు నామంలో, ఆమేన్.",
    ],
    prayerEn: [
      "Eternal God, You who existed before the beginning, I stand in awe of Your majesty. I see how small my life and my troubles are before Your eternity. And yet You loved me and came to me — my gratitude is not enough for such love.",
      "Jesus, the Word, I believe that You are God. Let my faith show not only in my words but in my life. Let the Word I read transform my heart — burn away my anger, my pride, and my fear in the light of Your Word.",
      "Father, give Your Word a place in my home. At our dining table, before we sleep, the moment we wake — let Your Word be part of our conversation. Let my life be the example that teaches my children to love Your Word.",
      "Lord, let every word from my mouth today be worthy of Your Word. Let my words wound no one, but comfort and strengthen someone. Let the Word that was in the beginning be the foundation of my life. In Jesus' name, Amen.",
    ],
  },
  {
    ref: "Genesis 1:1",
    refTe: "ఆదికాండం 1:1",
    verseTe: "ఆదిలో దేవుడు భూమిని ఆకాశాన్ని సృజించారు.",
    verseEn: "In the beginning God created the heaven and the earth.",
    prayerTe: [
      "సృష్టికర్తవైన దేవా, ఆకాశాన్ని చూసినప్పుడు, నక్షత్రాలను చూసినప్పుడు నీ హస్తకృత్యాలు నాకు గుర్తుకొస్తాయి. ఇంత గొప్ప విశ్వాన్ని సృజించినవాడివి నా జీవితాన్ని కూడా నీ చేతుల్లో పట్టుకున్నావని నమ్ముతున్నాను. నా జీవితం యాదృచ్ఛికం కాదు — నీ ప్రణాళికలో భాగం.",
      "తండ్రీ, నా జీవితంలో శూన్యంగా, ఆకారం లేకుండా ఉన్న ప్రతి భాగాన్ని నీవు తాకు. నా విరిగిన సంబంధాలు, నా నిరాశలు, నా భయాలు — వీటన్నిటి మీద 'వెలుగు కలుగును గాక' అని నీవు పలికినట్లు పలుకు. నా చీకటిలో నీ వెలుగు ప్రకాశించనివ్వు.",
      "ప్రభువా, నీవు సృజించిన ప్రతిదీ మంచిదని చూశావు. నన్ను కూడా నీవు మంచిగా సృజించావు — ఈ సత్యాన్ని నేను మరచిపోకుండా కాపాడు. నా లోపాలను చూసి నన్ను నేను తక్కువ చేసుకోకుండా, నీ పోలికలో చేయబడినవాడిగా నన్ను చూసుకోనివ్వు.",
      "యేసయ్యా, నూతన సృష్టిగా నన్ను నడిపించు. ఈ రోజు నేను చేసే ప్రతి పనిలో నీ సృజనాత్మకత కనిపించనివ్వు — నా పనిలో శ్రేష్ఠత, నా మాటల్లో జీవం, నా ప్రేమలో నిజాయితీ. ఆదిలో సృజించిన దేవుడే నా రేపటిని కూడా సృజిస్తాడని నమ్మి, ఆమేన్ అంటున్నాను.",
    ],
    prayerEn: [
      "Creator God, when I look at the sky and the stars, I am reminded of the work of Your hands. I believe that the One who made this vast universe also holds my life in His hands. My life is no accident — it is part of Your plan.",
      "Father, touch every part of my life that feels empty and formless. My broken relationships, my disappointments, my fears — speak over them as You spoke, 'Let there be light.' Let Your light shine into my darkness.",
      "Lord, You saw everything You made, and it was good. You made me good too — keep me from forgetting this truth. Let me not belittle myself over my flaws, but see myself as one made in Your image.",
      "Jesus, lead me as a new creation. Let Your creativity show in everything I do today — excellence in my work, life in my words, sincerity in my love. Believing that the God who created in the beginning is also creating my tomorrow, I say Amen.",
    ],
  },
];

export function getDevotionalForDate(date: Date): DevotionalDay {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return DEVOTIONAL_DAYS[dayOfYear % DEVOTIONAL_DAYS.length];
}
