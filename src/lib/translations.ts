export type Lang = 'en' | 'cs'

interface H1Parts {
  pre: string
  italic: string
  post?: string
}

interface Translations {
  nav: {
    brand: string
    overview: string
    takeTest: string
    viewResult: string
  }
  footer: {
    brand: string
    copyright: string
  }
  landing: {
    eyebrow: string
    h1: H1Parts
    body: string
    beginBtn: string
    retrieveLink: string
    dimensionsEyebrow: string
    dimensions: Array<{ k: string; name: string; gloss: string }>
    closingQuote: string
    beginTestBtn: string
  }
  form: {
    eyebrow: string
    h1: { pre: string; italic: string }
    body: string
    fields: {
      firstName:  { label: string; placeholder: string }
      department: { label: string; placeholder: string }
      email:      { label: string; placeholder: string }
    }
    beginBtn: string
    skipBtn: string
  }
  test: {
    consider: string
    likert: string[]
    pressHint: string
    backBtn: string
    nextBtn: string
    submitBtn: string
    loading: string
  }
  processing: {
    stages: string[]
    processingEyebrow: string
    completeEyebrow: string
    composingH1: H1Parts
    readyH1: string
    catAriaLabel: string
  }
  result: {
    loading: string
    error: string
    eyebrow: string
    body: string
    hideFacets: string
    showFacets: string
    interpretationEyebrow: string
    aiLabel: string
    aiLoading: string
    aiError: string
    resultIdLabel: string
    copyBtn: string
    copiedBtn: string
    downloadBtn: string
    anonymousName: string
    traitNames: Record<string, string>
    traitDescriptions: Record<string, string>
    facetNames: Record<string, string>
  }
  results: {
    viewResultsEyebrow: string
    h1: string
    body: string
    idPlaceholder: string
    searchingBtn: string
    findBtn: string
    notFoundError: string
    genericError: string
    nameMeta: string
    deptMeta: string
    completedMeta: string
    hideFacets: string
    showFacets: string
    traitLabels: Record<string, string>
  }
}

const en: Translations = {
  nav: {
    brand: 'OCEAN',
    overview: 'Overview',
    takeTest: 'Take the test',
    viewResult: 'View Result',
  },
  footer: {
    brand: 'OCEAN Instrument',
    copyright: '© 2026 · Built on open science',
  },
  landing: {
    eyebrow: 'A behavioural instrument · 2026',
    h1: { pre: 'Know the', italic: 'architecture', post: 'of a person.' },
    body: 'Five dimensions. 120 items. Ten minutes. No account. A legible, scientifically grounded portrait of who you are.',
    beginBtn: 'Begin',
    retrieveLink: 'Retrieve existing result',
    dimensionsEyebrow: 'The five dimensions',
    dimensions: [
      { k: 'O', name: 'Openness',          gloss: 'Imagination, curiosity, breadth of interest.' },
      { k: 'C', name: 'Conscientiousness', gloss: 'Orderliness, diligence, self-discipline.' },
      { k: 'E', name: 'Extraversion',      gloss: 'Warmth, assertiveness, appetite for stimulus.' },
      { k: 'A', name: 'Agreeableness',     gloss: 'Trust, altruism, cooperative tendency.' },
      { k: 'N', name: 'Neuroticism',       gloss: 'Emotional reactivity, recovery from stress.' },
    ],
    closingQuote: 'Built on the IPIP-NEO-PI — open science, open instrument, entirely free.',
    beginTestBtn: 'Begin the test',
  },
  form: {
    eyebrow: 'Before you begin',
    h1: { pre: 'Identify yourself —', italic: "or don't." },
    body: 'All fields are optional. Leave them blank and your result lives under an anonymous ID.',
    fields: {
      firstName:  { label: 'First name', placeholder: 'Martina' },
      department: { label: 'Department', placeholder: 'Research lab' },
      email:      { label: 'Email',      placeholder: 'martina@lab.de' },
    },
    beginBtn: 'Begin · 120 items',
    skipBtn: 'Skip — stay anonymous',
  },
  test: {
    consider: 'Consider',
    likert: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
    pressHint: 'Press 1 – 5, or click',
    backBtn: 'Back',
    nextBtn: 'Next',
    submitBtn: 'Submit',
    loading: 'Loading…',
  },
  processing: {
    stages: [
      'Collecting responses…',
      'Scoring against IPIP-NEO-PI reference cohort…',
      'Computing five domain percentiles…',
      'Deriving facet sub-scores…',
      'Composing your interpretation…',
      'Generating AI evaluation of your test…',
    ],
    processingEyebrow: 'Processing',
    completeEyebrow: 'Complete',
    composingH1: { pre: 'Composing your', italic: 'profile', post: '.' },
    readyH1: 'Your profile is ready.',
    catAriaLabel: 'Pet the cat to speed things up',
  },
  result: {
    loading: 'Calculating your profile…',
    error: 'Something went wrong processing your results.',
    eyebrow: 'Your result · {date}',
    body: 'Five domain scores against the IPIP-NEO-PI reference cohort. Read each number as a percentile — 50 is exactly average.',
    hideFacets: 'Hide facets',
    showFacets: 'Show facets',
    interpretationEyebrow: 'Interpretation',
    aiLabel: 'Generated by AI',
    aiLoading: 'Generating your interpretation…',
    aiError: 'AI interpretation could not be generated. Your scores are accurate and complete.',
    resultIdLabel: 'Result ID',
    copyBtn: 'Copy ID',
    copiedBtn: '✓ Copied',
    downloadBtn: 'Download PDF',
    anonymousName: 'Your',
    traitNames: {
      O: 'Openness',
      C: 'Conscientiousness',
      E: 'Extraversion',
      A: 'Agreeableness',
      N: 'Neuroticism',
    },
    traitDescriptions: {
      N: 'Neuroticism measures emotional sensitivity and reactivity. Those who score higher tend to experience anxiety, sadness, and stress more intensely — but this same sensitivity often brings deeper empathy, emotional awareness, and an ability to anticipate problems others might miss. Those who score lower tend to remain calm and emotionally steady under pressure — a real strength in crisis situations, though it can sometimes mean being less attuned to their own or others\' emotional signals. Neither high nor low is inherently better — both reflect different ways of processing the world emotionally.',
      E: 'Extraversion measures social energy and engagement with the outside world. Those who score higher are energised by social interaction, tend toward enthusiasm and assertiveness — strengths in leadership and collaboration, though they may sometimes struggle with solitary focus or listening before speaking. Those who score lower draw energy from solitude and reflection, often forming deeper one-on-one connections — they bring thoughtfulness and independence, though highly social environments can feel draining. Both styles contribute meaningfully to teams and relationships.',
      O: 'Openness measures intellectual curiosity and receptiveness to new ideas and experiences. Those who score higher are imaginative, creative, and drawn to novelty — they drive innovation and see possibilities, though they may sometimes struggle with routine or practical follow-through. Those who score lower are grounded, practical, and value proven methods — they bring reliability and focus, though they may sometimes resist change even when it could be beneficial. Both orientations are essential — every team needs dreamers and doers.',
      A: 'Agreeableness measures interpersonal warmth, cooperation, and trust. Those who score higher are compassionate, empathetic, and naturally collaborative — they build harmony and trust, though they may sometimes avoid necessary conflict or struggle to set boundaries. Those who score lower are more direct, skeptical, and competitive — they excel at tough negotiations and honest feedback, though they may sometimes be perceived as challenging. Both approaches have genuine value depending on the situation.',
      C: 'Conscientiousness measures self-discipline, organisation, and goal-directed behaviour. Those who score higher are methodical, reliable, and achievement-oriented — they excel at planning and follow-through, though they may sometimes be rigid or perfectionistic. Those who score lower are spontaneous, flexible, and adaptable — they handle unexpected changes well and think on their feet, though they may sometimes struggle with long-term planning. Both styles have real strengths — structure and flexibility are both needed.',
    },
    facetNames: {
      'Trust': 'Trust',
      'Morality': 'Morality',
      'Altruism': 'Altruism',
      'Cooperation': 'Cooperation',
      'Modesty': 'Modesty',
      'Sympathy': 'Sympathy',
      'Friendliness': 'Friendliness',
      'Gregariousness': 'Gregariousness',
      'Assertiveness': 'Assertiveness',
      'Activity Level': 'Activity Level',
      'Excitement-Seeking': 'Excitement-Seeking',
      'Cheerfulness': 'Cheerfulness',
      'Anxiety': 'Anxiety',
      'Anger': 'Anger',
      'Depression': 'Depression',
      'Self-Consciousness': 'Self-Consciousness',
      'Immoderation': 'Immoderation',
      'Vulnerability': 'Vulnerability',
      'Self-Efficacy': 'Self-Efficacy',
      'Orderliness': 'Orderliness',
      'Dutifulness': 'Dutifulness',
      'Achievement-Striving': 'Achievement-Striving',
      'Self-Discipline': 'Self-Discipline',
      'Cautiousness': 'Cautiousness',
      'Imagination': 'Imagination',
      'Artistic Interests': 'Artistic Interests',
      'Emotionality': 'Emotionality',
      'Adventurousness': 'Adventurousness',
      'Intellect': 'Intellect',
      'Liberalism': 'Liberalism',
    },
  },
  results: {
    viewResultsEyebrow: 'View Results',
    h1: 'Retrieve your results',
    body: 'Enter the unique ID you received after completing the test.',
    idPlaceholder: 'e.g. 3dd4ca19-647a-40dd-8910-4efc73879225',
    searchingBtn: 'Searching...',
    findBtn: 'Find Results',
    notFoundError: 'Result not found. Please check your ID and try again.',
    genericError: 'Something went wrong. Please try again.',
    nameMeta: 'Name',
    deptMeta: 'Department',
    completedMeta: 'Completed',
    hideFacets: '↑ Hide facets',
    showFacets: '↓ Show facets',
    traitLabels: {
      O: 'Openness',
      C: 'Conscientiousness',
      E: 'Extraversion',
      A: 'Agreeableness',
      N: 'Neuroticism',
    },
  },
}

const cs: Translations = {
  nav: {
    brand: 'OCEAN',
    overview: 'Přehled',
    takeTest: 'Začít test',
    viewResult: 'Zobrazit výsledek',
  },
  footer: {
    brand: 'OCEAN Instrument',
    copyright: '© 2026 · Postaveno na otevřené vědě',
  },
  landing: {
    eyebrow: 'Behaviorální nástroj · 2026',
    h1: { pre: 'Poznejte', italic: 'architekturu', post: 'osobnosti.' },
    body: 'Pět dimenzí. 120 položek. Deset minut. Bez účtu. Čitelný, vědecky podložený portrét toho, kdo jste.',
    beginBtn: 'Začít',
    retrieveLink: 'Načíst existující výsledek',
    dimensionsEyebrow: 'Pět dimenzí',
    dimensions: [
      { k: 'O', name: 'Otevřenost',    gloss: 'Představivost, zvídavost, šíře zájmů.' },
      { k: 'C', name: 'Svědomitost',   gloss: 'Pořádnost, pečlivost, sebekázeň.' },
      { k: 'E', name: 'Extraverze',    gloss: 'Vřelost, asertivita, sklon ke stimulaci.' },
      { k: 'A', name: 'Přívětivost',   gloss: 'Důvěra, altruismus, sklon ke spolupráci.' },
      { k: 'N', name: 'Neuroticismus', gloss: 'Emocionální reaktivita, zotavení ze stresu.' },
    ],
    closingQuote: 'Postaveno na IPIP-NEO-PI — otevřená věda, otevřený nástroj, zcela zdarma.',
    beginTestBtn: 'Začít test',
  },
  form: {
    eyebrow: 'Než začnete',
    h1: { pre: 'Identifikujte se —', italic: 'nebo ne.' },
    body: 'Všechna pole jsou volitelná. Nechte je prázdná a váš výsledek bude pod anonymním ID.',
    fields: {
      firstName:  { label: 'Jméno',    placeholder: 'Martina' },
      department: { label: 'Oddělení', placeholder: 'Výzkumná laboratoř' },
      email:      { label: 'E-mail',   placeholder: 'martina@lab.de' },
    },
    beginBtn: 'Začít · 120 položek',
    skipBtn: 'Přeskočit — zůstat anonymní',
  },
  test: {
    consider: 'Zvažte',
    likert: ['Silně nesouhlasím', 'Nesouhlasím', 'Neutrální', 'Souhlasím', 'Silně souhlasím'],
    pressHint: 'Stiskněte 1 – 5, nebo klikněte',
    backBtn: 'Zpět',
    nextBtn: 'Další',
    submitBtn: 'Odeslat',
    loading: 'Načítání…',
  },
  processing: {
    stages: [
      'Shromažďování odpovědí…',
      'Porovnání s referenční kohortou IPIP-NEO-PI…',
      'Výpočet percentilů pěti domén…',
      'Odvozování dílčích skóre facet…',
      'Sestavování vašeho výkladu…',
      'Generování hodnocení testu pomocí AI…',
    ],
    processingEyebrow: 'Zpracování',
    completeEyebrow: 'Dokončeno',
    composingH1: { pre: 'Sestavuji váš', italic: 'profil', post: '.' },
    readyH1: 'Váš profil je připraven.',
    catAriaLabel: 'Pohlaďte kočku, abyste věci urychlili',
  },
  result: {
    loading: 'Výpočet vašeho profilu…',
    error: 'Při zpracování výsledků se něco pokazilo.',
    eyebrow: 'Váš výsledek · {date}',
    body: 'Pět doménových skóre oproti referenční kohortě IPIP-NEO-PI. Čtěte každé číslo jako percentil — 50 je přesně průměr.',
    hideFacets: 'Skrýt podškály',
    showFacets: 'Zobrazit podškály',
    interpretationEyebrow: 'Interpretace',
    aiLabel: 'Generováno AI',
    aiLoading: 'Generování výkladu…',
    aiError: 'Výklad AI nelze vygenerovat. Vaše skóre jsou přesná a úplná.',
    resultIdLabel: 'ID výsledku',
    copyBtn: 'Kopírovat ID',
    copiedBtn: '✓ Zkopírováno',
    downloadBtn: 'Stáhnout PDF',
    anonymousName: 'Váš',
    traitNames: {
      O: 'Otevřenost',
      C: 'Svědomitost',
      E: 'Extraverze',
      A: 'Přívětivost',
      N: 'Neuroticismus',
    },
    traitDescriptions: {
      N: 'Neuroticismus měří emoční citlivost a reaktivitu. Lidé s vyšším skóre prožívají úzkost, smutek a stres intenzivněji — ale tato citlivost jim často přináší hlubší empatii, emoční uvědomění a schopnost předvídat problémy, které ostatní přehlédnou. Lidé s nižším skóre zůstávají klidní a emočně stabilní i pod tlakem — což je velká výhoda v krizových situacích, i když to může znamenat menší citlivost k vlastním i cizím emočním signálům. Ani vysoké, ani nízké skóre není samo o sobě lepší — obojí odráží odlišný způsob emočního zpracování světa.',
      E: 'Extraverze měří sociální energii a zapojení do okolního světa. Lidé s vyšším skóre čerpají energii ze sociální interakce, bývají nadšení a asertivní — což je silná stránka v leadershipu a spolupráci, i když někdy mohou mít potíže se soustředěním o samotě nebo nasloucháním dříve, než promluví. Lidé s nižším skóre čerpají energii ze samoty a reflexe, často navazují hlubší vztahy jeden na jednoho — přinášejí rozvážnost a nezávislost, i když vysoce společenská prostředí pro ně mohou být vyčerpávající. Oba styly smysluplně přispívají k týmům i vztahům.',
      O: 'Otevřenost měří intelektuální zvídavost a přístupnost novým myšlenkám a zážitkům. Lidé s vyšším skóre jsou tvořiví, imaginativní a přitahuje je novost — jsou motorem inovací a vidí příležitosti, i když někdy mohou mít potíže s rutinou nebo praktickým dotahováním věcí. Lidé s nižším skóre jsou praktičtí, uzemění a oceňují ověřené postupy — přinášejí spolehlivost a zaměření, i když někdy mohou odmítat změny, i když by mohly být prospěšné. Obě orientace jsou nezbytné — každý tým potřebuje snílky i realizátory.',
      A: 'Přívětivost měří mezilidskou vřelost, spolupráci a důvěru. Lidé s vyšším skóre jsou soucitní, empatičtí a přirozeně spolupracující — budují harmonii a důvěru, i když se někdy mohou vyhýbat nutnému konfliktu nebo mít potíže s nastavením hranic. Lidé s nižším skóre jsou přímější, skeptičtější a soutěživější — vynikají v náročných vyjednáváních a upřímné zpětné vazbě, i když mohou být někdy vnímáni jako nároční. Oba přístupy mají skutečnou hodnotu v závislosti na situaci.',
      C: 'Svědomitost měří sebekázeň, organizovanost a cílevědomé chování. Lidé s vyšším skóre jsou metodičtí, spolehliví a orientovaní na výsledky — vynikají v plánování a dotahování věcí, i když někdy mohou být rigidní nebo perfekcionističtí. Lidé s nižším skóre jsou spontánní, flexibilní a přizpůsobiví — dobře zvládají nečekané změny a rychle reagují, i když mohou mít někdy potíže s dlouhodobým plánováním. Oba styly mají skutečné silné stránky — struktura i flexibilita jsou potřeba.',
    },
    facetNames: {
      'Trust': 'Důvěra',
      'Morality': 'Přímočarost',
      'Altruism': 'Altruismus',
      'Cooperation': 'Spolupráce',
      'Modesty': 'Skromnost',
      'Sympathy': 'Soucit',
      'Friendliness': 'Přátelskost',
      'Gregariousness': 'Společenskost',
      'Assertiveness': 'Asertivita',
      'Activity Level': 'Úroveň aktivity',
      'Excitement-Seeking': 'Vyhledávání vzrušení',
      'Cheerfulness': 'Veselost',
      'Anxiety': 'Úzkostlivost',
      'Anger': 'Vznětlivost',
      'Depression': 'Sklíčenost',
      'Self-Consciousness': 'Ostych',
      'Immoderation': 'Impulzivnost',
      'Vulnerability': 'Zranitelnost',
      'Self-Efficacy': 'Víra v sebe',
      'Orderliness': 'Systematičnost',
      'Dutifulness': 'Spolehlivost',
      'Achievement-Striving': 'Cílevědomost',
      'Self-Discipline': 'Sebekázeň',
      'Cautiousness': 'Rozvážnost',
      'Imagination': 'Představivost',
      'Artistic Interests': 'Umělecké zájmy',
      'Emotionality': 'Vnímavost',
      'Adventurousness': 'Dobrodružnost',
      'Intellect': 'Intelekt',
      'Liberalism': 'Otevřenost názorům',
    },
  },
  results: {
    viewResultsEyebrow: 'Zobrazit výsledky',
    h1: 'Načíst výsledky',
    body: 'Zadejte jedinečné ID, které jste obdrželi po dokončení testu.',
    idPlaceholder: 'např. 3dd4ca19-647a-40dd-8910-4efc73879225',
    searchingBtn: 'Hledám...',
    findBtn: 'Najít výsledky',
    notFoundError: 'Výsledek nenalezen. Zkontrolujte prosím své ID a zkuste to znovu.',
    genericError: 'Něco se pokazilo. Zkuste to znovu.',
    nameMeta: 'Jméno',
    deptMeta: 'Oddělení',
    completedMeta: 'Dokončeno',
    hideFacets: '↑ Skrýt podškály',
    showFacets: '↓ Zobrazit podškály',
    traitLabels: {
      O: 'Otevřenost',
      C: 'Svědomitost',
      E: 'Extraverze',
      A: 'Přívětivost',
      N: 'Neuroticismus',
    },
  },
}

export const translations: Record<Lang, Translations> = { en, cs }

export function t(lang: Lang = 'en') {
  return translations[lang]
}
