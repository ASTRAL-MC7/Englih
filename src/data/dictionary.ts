import { WordItem, CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "words",
    name: "Words",
    emoji: "✨",
    descriptionUz: "Zamonaviy, nafis va akademik darajadagi so‘zlar",
    descriptionEng: "Elegant, sophisticated, & powerful words to boost your score"
  },
  {
    id: "slangs",
    name: "Slangs",
    emoji: "😎",
    descriptionUz: "Ko‘cha tili, zamonaviy yoshlar slengi va norasmiy iboralar",
    descriptionEng: "Modern street talk, youth slang, and casual daily expressions"
  },
  {
    id: "idioms",
    name: "Idioms",
    emoji: "🌟",
    descriptionUz: "Kundalik hayot va og'zaki nutq uchun juda jonli iboralar",
    descriptionEng: "Vivid idiomatic expressions for a high-scoring speaking flow"
  },
  {
    id: "phrasal_verbs",
    name: "Phrasal Verbs",
    emoji: "🚀",
    descriptionUz: "Nutqni tabiiy va professional ko‘rsatadigan frazali fe'llar",
    descriptionEng: "Natural-sounding phrasal verbs to sound like a native"
  },
  {
    id: "fillers_transitions",
    name: "Fillers & Transitions",
    emoji: "🧩",
    descriptionUz: "Gap orasidagi bo‘shliqlarni to‘ldiruvchi chiroyli so‘zlar",
    descriptionEng: "Smart conversational fillers and smooth transitional phrases"
  },
  {
    id: "shortcuts_reductions",
    name: "Shortcuts & Reductions",
    emoji: "⚡",
    descriptionUz: "Native speaker'lardek juda tez, ravon gapirish uchun qisqartmalar",
    descriptionEng: "Native pronunciation cuts and spoken contractions used daily"
  },
  {
    id: "texting_acronyms",
    name: "Texting Acronyms",
    emoji: "📱",
    descriptionUz: "Chatlar, sms'lar va ijtimoiy tarmoqlar uchun qisqa so‘zlar (TBH, NGL, etc.)",
    descriptionEng: "Social media and text messaging acronyms for fast typing"
  },
  {
    id: "instead_of",
    name: "Instead of...",
    emoji: "💎",
    descriptionUz: "Oddiy va zerikarli so‘zlar o‘rniga ishlatiladigan 'cool' muqobillar",
    descriptionEng: "Sophisticated alternatives to plain, low-scoring words"
  },
  {
    id: "pop_culture_memes",
    name: "Pop-Culture & Memes",
    emoji: "🎬",
    descriptionUz: "Filmlar, seriallar, trendlar va memlardan olingan zamonaviy iboralar",
    descriptionEng: "Trendy phrases from movies, shows, memes, and current pop trends"
  }
];

export const INITIAL_WORDS: WordItem[] = [
  // Category 1: Words
  {
    id: "w1",
    word: "Meticulous",
    category: "words",
    definition: "Showing great attention to detail; very careful and precise.",
    translation: "O'ta talabchan, barcha mayda-chuda tafsilotlarigacha e'tibor beradigan, sinchkov.",
    example: "The research team was meticulous in compiling the statistical data for the project.",
    ieltsTip: "Perfect for describing writers, scientists, or design work in Writing Task 2. Score boost for precision!"
  },
  {
    id: "w2",
    word: "Ubiquitous",
    category: "words",
    definition: "Present, appearing, or found everywhere.",
    translation: "Hamma joyda uchraydigan, keng tarqalgan.",
    example: "Mobile phones have became ubiquitous in modern society, almost replacing traditional watches.",
    ieltsTip: "Use this instead of 'common' or 'widespread' in Writing Task 2 & Speaking. Immediate 8.0+ vocabulary signal!"
  },
  {
    id: "w3",
    word: "Superfluous",
    category: "words",
    definition: "Unnecessary, especially through being more than enough.",
    translation: "Keraksiz, ortiqcha, eskirib qolgan darajada ko'p.",
    example: "Deleting superfluous words from your essay will make your argumentation far more punchy and clear.",
    ieltsTip: "Instead of saying 'extra' or 'unwanted' when discussing waste, materials, or details."
  },
  {
    id: "w4",
    word: "Resilient",
    category: "words",
    definition: "Able to withstand or recover quickly from difficult conditions.",
    translation: "Chidamli, egiluvchan, qiyinchilikdan tezda o'ziga keladigan o'ta qat'iyatli.",
    example: "Local businesses proved incredibly resilient during the economic downturn.",
    ieltsTip: "Use this in IELTS Speaking Part 1 or 2 when talking about someone's character, or local communities facing hardships."
  },
  {
    id: "w5",
    word: "Eloquent",
    category: "words",
    definition: "Fluent or persuasive in speaking or writing.",
    translation: "Notiq, so'zga usta, ta'sirchan gapiradigan / yozadigan.",
    example: "She delivered an eloquent speech on climate change that deeply touched everyone in the hall.",
    ieltsTip: "Excellent to describe public figures, politicians, or influential books in Speaking Part 2."
  },

  // Category 2: Slangs
  {
    id: "s1",
    word: "No Cap",
    category: "slangs",
    definition: "No lie; for real; completely honest behavior.",
    translation: "Rostdan ham, hazillashmayapman, yolg‘onsiz.",
    example: "That IELTS preparation material actually helped me pass the reading section on the first trial, no cap.",
    ieltsTip: "This is a typical Gen-Z informal slang. Strictly for native-like daily conversation! Do not use in academic writing."
  },
  {
    id: "s2",
    word: "Renting room space (Rent-free)",
    category: "slangs",
    definition: "To be constantly on someone's mind or causing obsession/anger without reason.",
    translation: "Kimningdir miyasini mutlaqo egallab olganlik (biror narsadan tinimsiz siqilish).",
    example: "Don't let that bad grade live rent-free in your mind; just focus on your next attempt.",
    ieltsTip: "Extremely cool modern idiom-slang. Perfect for informal speaking questions about stress or memories."
  },
  {
    id: "s3",
    word: "Bet",
    category: "slangs",
    definition: "Okay; yes; an agreement to a challenge or a proposal.",
    translation: "Kelishdik! Shunday bo'ladi! Qabul!",
    example: "- 'Do you want to study English together at the library tonight?' - 'Bet, see you at seven.'",
    ieltsTip: "Shows supreme naturalness in native chit-chat. Use in casual speaking context only."
  },
  {
    id: "s4",
    word: "Ripped",
    category: "slangs",
    definition: "Having excellent, strong, and well-defined muscles.",
    translation: "Mushaklari baquvvat, kelishgan va baquvvat qomatga ega.",
    example: "He has been spending three hours in the gym everyday, and now he is absolutely ripped.",
    ieltsTip: "Great for describing athletes, workouts, or transformation stories in Speaking Part 2."
  },
  {
    id: "s5",
    word: "Vibe check",
    category: "slangs",
    definition: "An assessment of a person's current emotional state, energy, or overall atmosphere.",
    translation: "Hozirgi kayfiyat/energiya qanday ekanligini sinab ko'rish.",
    example: "The new English learning club completely passed the vibe check, everyone was so friendly!",
    ieltsTip: "Slang used high-frequency in Gen-Z media. Shows superb casual fluency."
  },

  // Category 3: Idioms
  {
    id: "i1",
    word: "Once in a blue moon",
    category: "idioms",
    definition: "Very rarely; almost never.",
    translation: "O'ta kamdan-kam hollarda, yilda-oyda bir marta.",
    example: "Since I work full-time, I only get to play video games once in a blue moon.",
    ieltsTip: "Substitute for 'rarely' in Speaking Part 1. High scoring frequency!"
  },
  {
    id: "i2",
    word: "Hit the nail on the head",
    category: "idioms",
    definition: "To describe exactly what is causing a situation or problem.",
    translation: "Masalaning yoki vaziyatning eng muhim joyini aniq topish, uqib topish.",
    example: "You hit the nail on the head with your analysis of the transport system.",
    ieltsTip: "Great for responding to IELTS Speaking Part 3 analytical questions to agree with a point."
  },
  {
    id: "i3",
    word: "Burn the midnight oil",
    category: "idioms",
    definition: "To read or work late into the night.",
    translation: "Kechasi bilan uxlamasdan dars o'qish, tunni tunga ulab mehnat qilish.",
    example: "I had to burn the midnight oil for several weeks to get ready for the IELTS exam.",
    ieltsTip: "Super classic idiom for education and study topics. IELTS examiners love this."
  },
  {
    id: "i4",
    word: "Cry over spilled milk",
    category: "idioms",
    definition: "To complain about a loss from the past that cannot be changed.",
    translation: "O'tib ketgan xatoga endi siqilishdan foyda yo'qligini anglatish, pushmon bo'lish.",
    example: "I missed one keyword in Listening, but there is no point crying over spilled milk.",
    ieltsTip: "Exceptional for Speaking Part 1/2 scenarios about regrets or childhood failures."
  },
  {
    id: "i5",
    word: "Costs an arm and a leg",
    category: "idioms",
    definition: "Incredibly expensive.",
    translation: "O'ta qimmat, olovning narxi.",
    example: "Studying abroad in some countries is amazing, but it can cost an arm and a leg.",
    ieltsTip: "Immediate replacement of 'very expensive' in Speaking section. Idiomatic naturalness guaranteed."
  },

  // Category 4: Phrasal Verbs
  {
    id: "p1",
    word: "Catch up on",
    category: "phrasal_verbs",
    definition: "To do something that you have not been able to do recently.",
    translation: "O'tkazib yuborilgan yoki ulgurilmagan ishlarning o'rnini bosish, ortidan quvib yetish.",
    example: "This weekend, I'm hoping to catch up on my sleep and study modules.",
    ieltsTip: "Use this in Speaking Part 1 when talking about work-life balance or weekend activities."
  },
  {
    id: "p2",
    word: "End up",
    category: "phrasal_verbs",
    definition: "To finally be in a particular place or situation.",
    translation: "Natijada biror joyda yoki aytilmagan vaziyatda qolib ketish/batafsil tugash.",
    example: "We took a wrong turn and ended up lost in the middle of the city center.",
    ieltsTip: "High-frequency spoken filler + connector that replaces boring verbs like 'arrive' or 'finish'."
  },
  {
    id: "p3",
    word: "Root for",
    category: "phrasal_verbs",
    definition: "To support or cheer for a person, team, or cause.",
    translation: "Kimnidir yoki biror jamoani astoydil qo'llab-quvvatlash, muvaffaqiyat tilash.",
    example: "My family is rooting for me to get a band 8 result on my exam.",
    ieltsTip: "Great for speaking topics around sports, family, role models, or personal goals."
  },
  {
    id: "p4",
    word: "Stumble upon",
    category: "phrasal_verbs",
    definition: "To find something accidentally by chance.",
    translation: "Kutilmaganda duch kelib qolish, topib olish.",
    example: "While scrolling through the web, I stumbled upon this incredible learning app called Helpful English.",
    ieltsTip: "Fantastic replacement for 'found' or 'encountered' when describing books, websites, or tourist spots."
  },
  {
    id: "p5",
    word: "Opt out of",
    category: "phrasal_verbs",
    definition: "Choose not to participate in something.",
    translation: "Biror narsada ishtirok etmaslikka qaror qilish, undan bosh tortish.",
    example: "Many employees choose to opt out of the voluntary insurance plan.",
    ieltsTip: "Great for formal and informal writing topics on employment, health, and hobbies."
  },

  // Category 5: Fillers & Transitions
  {
    id: "f1",
    word: "At the end of the day",
    category: "fillers_transitions",
    definition: "Ultimately; when everything is taken into consideration.",
    translation: "Kun oxirida, yakuniy xulosa qilganda, hamma narsani hisobga olganda.",
    example: "At the end of the day, it's your hard work and consistency that guarantees a high IELTS band score.",
    ieltsTip: "Fabulous transition to summarize your thoughts. Excellent structural anchor in Speaking Part 3."
  },
  {
    id: "f2",
    word: "To put it in a nutshell",
    category: "fillers_transitions",
    definition: "To state something very briefly and concisely.",
    translation: "Qisqasini aytganda, xulosa qilganda (bir og'iz so'z bilan).",
    example: "To put it in a nutshell, technology has reshaped the landscape of education.",
    ieltsTip: "A magnificent spoken idiom to conclude a detailed response. Shows high vocabulary control."
  },
  {
    id: "f3",
    word: "More often than not",
    category: "fillers_transitions",
    definition: "Usually; in most cases.",
    translation: "Ko'pincha, aksariyat hollarda.",
    example: "More often than not, students fail because of exam anxiety rather than lack of preparation.",
    ieltsTip: "Highly native alternative to 'normally' or 'usually'. Use it in Writing Task 2 for generic descriptions!"
  },
  {
    id: "f4",
    word: "As far as I'm concerned",
    category: "fillers_transitions",
    definition: "In my opinion; from my point of view.",
    translation: "Menimcha, mening fikrimcha, menga qolsa.",
    example: "As far as I'm concerned, government funding should prioritize green energy initiatives over fossil fuels.",
    ieltsTip: "Fantastic marker to state opinions in Speaking and structured essays. Far better than 'In my opinion'!"
  },
  {
    id: "f5",
    word: "Having said that",
    category: "fillers_transitions",
    definition: "Despite what has just been said; however.",
    translation: "Shunday bo'lsa-da, shunga qaramasdan (lekin).",
    example: "The internet offers endless learning tools. Having said that, teachers still play an irreplaceable role.",
    ieltsTip: "A native-level concession transition. Excellent logical cohesive device for Writing Task 2!"
  },

  // Category 6: Shortcuts & Reductions
  {
    id: "sh1",
    word: "Gonna ($1)",
    category: "shortcuts_reductions",
    definition: "Reduced spoken form of 'going to'.",
    translation: "'Going to' (moqchiman) ning og'zaki tezlashgan shakli.",
    example: "I'm gonna master English speaking in less than three months with this guide.",
    ieltsTip: "Do NOT write this in Writing Tasks! But absolutely use this in Speaking to build rapid natural spoken speed."
  },
  {
    id: "sh2",
    word: "Wanna ($2)",
    category: "shortcuts_reductions",
    definition: "Spoken reduction of 'want to'.",
    translation: "'Want to' (xohlamoq) ning qisqartirilgan shakli.",
    example: "Do you wanna practice English listening with me after the lecture?",
    ieltsTip: "Helps you match native speaking speed and rhythm. Strictly conversational."
  },
  {
    id: "sh3",
    word: "Gotcha ($3)",
    category: "shortcuts_reductions",
    definition: "Reduced spoken form of 'I have got you' (I understand).",
    translation: "Tushundim, uqdim, seni tushunib turibman.",
    example: "- 'Please edit the second paragraph' - 'Gotcha! I will take care of it now.'",
    ieltsTip: "Incredible conversational shorthand that makes dialogues flow with genuine native rhythm."
  },
  {
    id: "sh4",
    word: "Shoulda / Coulda / Woulda",
    category: "shortcuts_reductions",
    definition: "Reduction of should have / could have / would have.",
    translation: "'Qilishim kerak edi' / 'Qila olar edim' larning o'ta tez og'zaki aytilishi.",
    example: "I shoulda spent more time reviewing synonyms, but it is okay.",
    ieltsTip: "Displays extraordinary mastery of connected speech (linking sounds) in Speaking Part 1 & Part 2."
  },
  {
    id: "sh5",
    word: "Dunno",
    category: "shortcuts_reductions",
    definition: "Spoken shorthand for 'Don't know'.",
    translation: "Bilmayman so'zining o'ta tez va norasmiy talaffuzi.",
    example: "I dunno what to wear for the seminar tomorrow, honestly.",
    ieltsTip: "Use sparingly in casual English talking to simulate highly comfortable, relaxed native dialogue."
  },

  // Category 7: Texting Acronyms
  {
    id: "t1",
    word: "TBH",
    category: "texting_acronyms",
    definition: "To Be Honest - used in texting to introduce a sincere opinion.",
    translation: "Ochig'ini aytsam, to'g'risi.",
    example: "TBH, I prefer practicing online worksheets over reading long heavy textbooks.",
    ieltsTip: "Use in modern text chats, social media comments, or informal blog writing. Great to know for digital contexts."
  },
  {
    id: "t2",
    word: "NGL",
    category: "texting_acronyms",
    definition: "Not Gonna Lie - used to express truthful assertions.",
    translation: "Yolg'on bo'lmasin, ochig'i.",
    example: "That video explanation was absolutely mind-blowing, NGL.",
    ieltsTip: "Super trendy texting shortcut. Use when texting to show extreme sincerity or coolness."
  },
  {
    id: "t3",
    word: "IMO / IMHO",
    category: "texting_acronyms",
    definition: "In My (Humble) Opinion.",
    translation: "Kamtarona fikrimcha.",
    example: "IMHO, self-studying with interactive web tools is cheaper than typical physical courses.",
    ieltsTip: "Often seen in text posts, forums, and native language exchange apps."
  },
  {
    id: "t4",
    word: "FR",
    category: "texting_acronyms",
    definition: "For Real - indicating complete agreement or actual factual truth.",
    translation: "Rostdan ham, jiddiy aytganda.",
    example: "The internet speed in the campus library is outstanding, FR.",
    ieltsTip: "Saves massive texting time. High digital currency among young native speakers."
  },
  {
    id: "t5",
    word: "AFAIK",
    category: "texting_acronyms",
    definition: "As Far As I Know.",
    translation: "Mening bilishimcha, bilganimcha.",
    example: "AFAIK, the deadline for submitting the IELTS waiver has been extended.",
    ieltsTip: "Excellent informational placeholder for collaborative chat programs."
  },

  // Category 8: Instead of...
  {
    id: "in1",
    word: "Astounding",
    category: "instead_of",
    definition: "Surprisingly impressive; spectacular.",
    translation: "'Very surprising' yoki 'very beautiful' o'rniga ishlatiladigan ajoyib so'z.",
    example: "The archaeological site has an astounding historical significance.",
    ieltsTip: "Writing Task 2 booster! Use instead of generic positive empty words.",
    ratherThan: "Very surprising / Very good"
  },
  {
    id: "in2",
    word: "Detrimental",
    category: "instead_of",
    definition: "Tending to cause harm; damaging.",
    translation: "'Very bad' yoki 'harmful' o'rniga o'ta akademik muqobil.",
    example: "Consuming fast food on a regular basis has a detrimental effect on immune health.",
    ieltsTip: "Always use this to describe negative trends in Writing Task 2. Examiners actively look for this!",
    ratherThan: "Harmful / Very bad"
  },
  {
    id: "in3",
    word: "Magnificent",
    category: "instead_of",
    definition: "Extremely beautiful, elaborate, or impressive.",
    translation: "'Very beautiful' yoki 'great' o'rniga ulug'vor, ajoyib.",
    example: "The museum exhibits a magnificent collection of Renaissance canvases.",
    ieltsTip: "Replaces basic adjectives when describing historical architecture, cities, or artwork.",
    ratherThan: "Very beautiful"
  },
  {
    id: "in4",
    word: "Pivotal",
    category: "instead_of",
    definition: "Of crucial importance in relation to the development or success of something else.",
    translation: "'Very important' o'rniga ishlatiladigan hal qiluvchi, o'ta muhim ahamiyatga ega muqobil.",
    example: "Investing in public education plays a pivotal role in eradicating long-term poverty.",
    ieltsTip: "Immediate candidate for all descriptive papers. Excellent score builder.",
    ratherThan: "Very important"
  },
  {
    id: "in5",
    word: "Ample",
    category: "instead_of",
    definition: "Enough or more than enough; plentiful.",
    translation: "'Enough' yoki 'plenty' so'zlari o'rniga yetarli, mo'l-ko'l.",
    example: "The students were given ample opportunities to practice their foreign language pronunciation.",
    ieltsTip: "High-scoring alternative for data analysis, resources, space, and opportunities.",
    ratherThan: "Enough"
  },

  // Category 9: Pop-Culture & Memes
  {
    id: "pc1",
    word: "Main Character Energy",
    category: "pop_culture_memes",
    definition: "The vibe of someone who holds center stage in their life, looking incredibly confident and cool.",
    translation: "Filmdagi bosh qahramon kabi o'ziga ishongan holda yurish, diqqat markazida bo'lish energiyasi.",
    example: "With that elegant outfit and sharp English delivery, he is radiating major main character energy.",
    ieltsTip: "Fabulous pop-culture phrase. Use in Speaking Part 2 to describe a charismatic friend or celebrity."
  },
  {
    id: "pc2",
    word: "Brain rot",
    category: "pop_culture_memes",
    definition: "Slang used high-frequency to describe low-quality social media content that decreases cognitive function.",
    translation: "Miyani chiritadigan keraksiz ijtimoiy tarmoq videolari (TikTok trendlari va h.k.).",
    example: "Stop consuming brain rot content on social media and start studying helpful vocabulary to clear your head.",
    ieltsTip: "Extremely modern media term. High-scoring speaking slang when analyzing youth habits or the internet."
  },
  {
    id: "pc3",
    word: "Understood the assignment",
    category: "pop_culture_memes",
    definition: "To do a job or adopt a style completely perfectly, exceeding expectations.",
    translation: "Vazifani o'ta mukammal bajarish, kutilgandan ham ziyoda qilib qoyillatish.",
    example: "The architect truly understood the assignment when designing this high-tech community center.",
    ieltsTip: "A modern meme-originated expression. Outstanding for describing achievements, style, or clever plans."
  },
  {
    id: "pc4",
    word: "Spill the beans / Spill the tea",
    category: "pop_culture_memes",
    definition: "To reveal gossip, secrets, or truth.",
    translation: "Sirlarni ochish, g'iybatlarni ochiqlash, bor haqiqatni aytib yuborish.",
    example: "Come on, stop keeping me in suspense! Spill the tea about the test result!",
    ieltsTip: "Brilliant idiom popular in daily internet conversations. Great for Speaking Part 1 about friends and sharing."
  },
  {
    id: "pc5",
    word: "G.O.A.T.",
    category: "pop_culture_memes",
    definition: "Greatest Of All Time - used to praise athletes, musicians, or notable figures.",
    translation: "Barcha zamonlarning eng buyugi (G.O.A.T).",
    example: "When it comes to studying English techniques, some people think this learning web app is the GOAT.",
    ieltsTip: "Widely used online. Highly natural and displays modern idiomatic expression."
  }
];
