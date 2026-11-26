/**
 * Syllable Dojo - 國小低年級 2 音節詞庫 (按自然拼讀開閉音節與母音位置規則精密校正)
 * 
 * 重要自然拼讀規則：
 * 1. 閉音節 (Closed Syllable)：以子音結尾，母音發短音 (Short Vowel)，如 hap, rab, mon。
 * 2. 開音節 (Open Syllable)：以母音結尾，母音發字母本音長音 (Long Vowel)，如 ti [taɪ], pa [peɪ], ro [roʊ]。
 * 3. 字尾 y (Final Y as Vowel)：本題庫的 happy、puppy 等字尾 y 發 /i/，如 pee 的母音。
 * 4. 複合子音與硬音：tiger 的 ger 發硬音 /ɡər/ (gurr)，非 soft g；rainbow 的 bow 發 /boʊ/ (boh)。
 */

const WORD_LEVELS = [
  {
    id: 1,
    name: "白帶修煉",
    title: "複合字道場 (Compound Words)",
    beltColor: "#F5F5F5",
    beltTextColor: "#333333",
    beltBorder: "#CCCCCC",
    badge: "🥋 白帶初階",
    ruleDescription: "兩個完整的字合在一起，從它們相接處切開！",
    ruleTip: "試著找出兩個躲在裡面的小單字！",
    words: [
      {
        word: "pancake",
        syllables: ["pan", "cake"],
        speechSyllables: ["pan", "cake"],
        phonetics: ["[pæn]", "[keɪk]"],
        splitIndex: 3,
        meaning: "鬆餅 🥞",
        hint: "pan (平底鍋) + cake (蛋糕)",
        phonicsNote: "複合字：pan 短母音 [æ] + cake 長母音 [eɪ]"
      },
      {
        word: "sunshine",
        syllables: ["sun", "shine"],
        speechSyllables: ["sun", "shine"],
        phonetics: ["[sʌn]", "[ʃaɪn]"],
        splitIndex: 3,
        meaning: "陽光 ☀️",
        hint: "sun (太陽) + shine (照耀)",
        phonicsNote: "複合字：sun 短母音 [ʌ] + shine 長母音 [aɪ]"
      },
      {
        word: "lunchbox",
        syllables: ["lunch", "box"],
        speechSyllables: ["lunch", "box"],
        phonetics: ["[lʌntʃ]", "[bɑks]"],
        splitIndex: 5,
        meaning: "便當盒 🍱",
        hint: "lunch（午餐）＋ box（盒子）",
        phonicsNote: "把兩個小單字合起來，就是 lunchbox。"
      },
      {
        word: "rainbow",
        syllables: ["rain", "bow"],
        speechSyllables: ["rain", "boh"], // 避免 bow 被唸成鞠躬 /baʊ/，確保是彩虹 /boʊ/
        phonetics: ["[reɪn]", "[boʊ]"],
        splitIndex: 4,
        meaning: "彩虹 🌈",
        hint: "rain (雨) + bow (弓/彩虹)",
        phonicsNote: "bow 在此發長母音 [boʊ]，而非鞠躬的 [baʊ]"
      },
      {
        word: "popcorn",
        syllables: ["pop", "corn"],
        speechSyllables: ["pop", "corn"],
        phonetics: ["[pɑːp]", "[kɔːrn]"],
        splitIndex: 3,
        meaning: "爆米花 🍿",
        hint: "pop (爆裂) + corn (玉米)",
        phonicsNote: "複合字：pop [pɑːp] + corn [kɔːrn]"
      },
      {
        word: "cupcake",
        syllables: ["cup", "cake"],
        speechSyllables: ["cup", "cake"],
        phonetics: ["[kʌp]", "[keɪk]"],
        splitIndex: 3,
        meaning: "杯子蛋糕 🧁",
        hint: "cup (杯子) + cake (蛋糕)",
        phonicsNote: "複合字：cup [kʌp] + cake [keɪk]"
      },
      {
        word: "bathtub",
        syllables: ["bath", "tub"],
        speechSyllables: ["bath", "tub"],
        phonetics: ["[bæθ]", "[tʌb]"],
        splitIndex: 4,
        meaning: "浴缸 🛁",
        hint: "bath (洗澡) + tub (浴盆)",
        phonicsNote: "複合字：bath [bæθ] + tub [tʌb]"
      },
      {
        word: "football",
        syllables: ["foot", "ball"],
        speechSyllables: ["foot", "ball"],
        phonetics: ["[fʊt]", "[bɔːl]"],
        splitIndex: 4,
        meaning: "足球 ⚽",
        hint: "foot (腳) + ball (球)",
        phonicsNote: "複合字：foot [fʊt] + ball [bɔːl]"
      },
      {
        word: "backpack",
        syllables: ["back", "pack"],
        speechSyllables: ["back", "pack"],
        phonetics: ["[bæk]", "[pæk]"],
        splitIndex: 4,
        meaning: "後背包 🎒",
        hint: "back（背部）＋ pack（包）",
        phonicsNote: "back 和 pack 押韻，兩個字裡的 a 都發 [æ]。"
      },
      {
        word: "snowman",
        syllables: ["snow", "man"],
        speechSyllables: ["snow", "man"],
        phonetics: ["[snoʊ]", "[mæn]"],
        splitIndex: 4,
        meaning: "雪人 ⛄",
        hint: "snow (雪) + man (人)",
        phonicsNote: "複合字：snow [snoʊ] + man [mæn]"
      }
    ]
  },
  {
    id: 2,
    name: "黃帶進階",
    title: "兔子雙胞胎 (Rabbit Rule - VCCV)",
    beltColor: "#FDD835",
    beltTextColor: "#5D4037",
    beltBorder: "#FBC02D",
    badge: "🥋 黃帶進階",
    ruleDescription: "中間有兩個相同的雙胞胎子音，從它們正中間切開！",
    ruleTip: "happy 和 puppy 的字尾 y 發 [i]，切在兩個相同的子音中間！",
    words: [
      {
        word: "happy",
        syllables: ["hap", "py"],
        speechSyllables: ["hap", "pee"], // 關鍵校正：py 在此發 [piː] (音同 pee)，絕非 [paɪ]！
        phonetics: ["[hæp]", "[pi]"],
        splitIndex: 3,
        meaning: "快樂 😄",
        hint: "雙胞胎 pp 切中間！注意字尾 y 發 [i] (pee) 音！",
        phonicsNote: "hap 是閉音節，a 發 [æ]。happy 的 y 發 [i]。"
      },
      {
        word: "puppy",
        syllables: ["pup", "py"],
        speechSyllables: ["pup", "pee"], // 關鍵校正：py 在此發 [piː] (音同 pee)
        phonetics: ["[pʌp]", "[pi]"],
        splitIndex: 3,
        meaning: "小狗 🐶",
        hint: "雙胞胎 pp 切中間！字尾 y 發 [i] (pee) 音！",
        phonicsNote: "pup 是閉音節短母音 [ʌ]；字尾 y 發長母音 [i] (pee)"
      },
      {
        word: "rabbit",
        syllables: ["rab", "bit"],
        speechSyllables: ["rab", "bit"],
        phonetics: ["[ræb]", "[bɪt]"],
        splitIndex: 3,
        meaning: "兔子 🐰",
        hint: "雙胞胎 bb，切在兩個 b 中間！",
        phonicsNote: "rab 與 bit 皆為閉音節短母音 [æ] 與 [ɪ]"
      },
      {
        word: "kitten",
        syllables: ["kit", "ten"],
        speechSyllables: ["kit", "tin"], // 弱讀音節 [tn/tɪn]
        phonetics: ["[kɪt]", "[tn]"],
        splitIndex: 3,
        meaning: "小貓 🐱",
        hint: "雙胞胎 tt，切在兩個 t 中間！",
        phonicsNote: "kit 短母音 [ɪ] + ten 弱音節 [tn]"
      },
      {
        word: "muffin",
        syllables: ["muf", "fin"],
        speechSyllables: ["muff", "fin"],
        phonetics: ["[mʌf]", "[fɪn]"],
        splitIndex: 3,
        meaning: "瑪芬蛋糕 🧁",
        hint: "雙胞胎 ff，切在兩個 f 中間！",
        phonicsNote: "muf 短母音 [ʌ] + fin 短母音 [ɪ]"
      },
      {
        word: "summer",
        syllables: ["sum", "mer"],
        speechSyllables: ["sum", "mer"],
        phonetics: ["[sʌm]", "[mər]"],
        splitIndex: 3,
        meaning: "夏天 🌻",
        hint: "雙胞胎 mm，切在兩個 m 中間！",
        phonicsNote: "sum 短母音 [ʌ] + mer 捲舌弱音 [mər]"
      },
      {
        word: "button",
        syllables: ["but", "ton"],
        speechSyllables: ["but", "tuhn"],
        phonetics: ["[bʌt]", "[tn]"],
        splitIndex: 3,
        meaning: "鈕扣 🔘",
        hint: "雙胞胎 tt，切在兩個 t 中間！",
        phonicsNote: "but 短母音 [ʌ] + ton 弱音節 [tn]"
      },
      {
        word: "yellow",
        syllables: ["yel", "low"],
        speechSyllables: ["yell", "low"],
        phonetics: ["[jɛl]", "[loʊ]"],
        splitIndex: 3,
        meaning: "黃色 💛",
        hint: "雙胞胎 ll，切在兩個 l 中間！low 發長音 [loʊ]",
        phonicsNote: "yel 是閉音節短音 [ɛ]；low 是長音 [loʊ]"
      },
      {
        word: "dinner",
        syllables: ["din", "ner"],
        speechSyllables: ["din", "ner"],
        phonetics: ["[dɪn]", "[nər]"],
        splitIndex: 3,
        meaning: "晚餐 🍽️",
        hint: "雙胞胎 nn，切在兩個 n 中間！",
        phonicsNote: "din 短母音 [ɪ] + ner 捲舌弱音 [nər]"
      },
      {
        word: "letter",
        syllables: ["let", "ter"],
        speechSyllables: ["let", "ter"],
        phonetics: ["[lɛt]", "[tər]"],
        splitIndex: 3,
        meaning: "信件 / 字母 ✉️",
        hint: "雙胞胎 tt，切在兩個 t 中間！",
        phonicsNote: "let 短母音 [ɛ] + ter 捲舌弱音 [tər]"
      }
    ]
  },
  {
    id: 3,
    name: "綠帶熟練",
    title: "子音分組 (Consonant Groups)",
    beltColor: "#66BB6A",
    beltTextColor: "#1B5E20",
    beltBorder: "#43A047",
    badge: "🥋 綠帶熟練",
    ruleDescription: "找出兩個母音之間的子音，聽單字，試著分成兩段！",
    ruleTip: "子音有時要留在一起，例如 monster 裡的 st。",
    words: [
      {
        word: "monster",
        syllables: ["mon", "ster"],
        speechSyllables: ["mon", "ster"],
        phonetics: ["[mɑːn]", "[stər]"],
        splitIndex: 3,
        meaning: "怪獸 👾",
        hint: "o 和 e 中間有 n、s、t。把 st 留在一起！",
        phonicsNote: "mon 閉音節短母音 [ɑː] + ster [stər]"
      },
      {
        word: "napkin",
        syllables: ["nap", "kin"],
        speechSyllables: ["nap", "kin"],
        phonetics: ["[næp]", "[kɪn]"],
        splitIndex: 3,
        meaning: "餐巾紙 🧻",
        hint: "a 和 i 中間有 p 和 k，切在 p 與 k 之間！",
        phonicsNote: "nap 短母音 [æ] + kin 短母音 [ɪ]"
      },
      {
        word: "picnic",
        syllables: ["pic", "nic"],
        speechSyllables: ["pick", "nick"],
        phonetics: ["[pɪk]", "[nɪk]"],
        splitIndex: 3,
        meaning: "野餐 🧺",
        hint: "i 和 i 中間有 c 和 n，切在 c 與 n 之間！",
        phonicsNote: "兩個音節皆發短母音 [ɪ]"
      },
      {
        word: "dentist",
        syllables: ["den", "tist"],
        speechSyllables: ["den", "tist"],
        phonetics: ["[dɛn]", "[tɪst]"],
        splitIndex: 3,
        meaning: "牙醫 🦷",
        hint: "e 和 i 中間有 n 和 t，切在 n 與 t 之間！",
        phonicsNote: "den 短母音 [ɛ] + tist 短母音 [ɪ]"
      },
      {
        word: "panda",
        syllables: ["pan", "da"],
        speechSyllables: ["pan", "duh"], // da 在詞尾發弱音 [də] (duh)
        phonetics: ["[pæn]", "[də]"],
        splitIndex: 3,
        meaning: "熊貓 🐼",
        hint: "a 和 a 中間有 n 和 d，切在 n 與 d 之間！",
        phonicsNote: "pan 短母音 [æ] + 字尾 da 發輕母音 [də]"
      },
      {
        word: "basket",
        syllables: ["bas", "ket"],
        speechSyllables: ["bass", "kit"],
        phonetics: ["[bæs]", "[kɪt]"],
        splitIndex: 3,
        meaning: "籃子 🧺",
        hint: "a 和 e 中間有 s 和 k，切在 s 與 k 之間！",
        phonicsNote: "bas 短母音 [æ] + ket [kɪt]"
      },
      {
        word: "helmet",
        syllables: ["hel", "met"],
        speechSyllables: ["hell", "mitt"],
        phonetics: ["[hɛl]", "[mɪt]"],
        splitIndex: 3,
        meaning: "安全帽 ⛑️",
        hint: "e 和 e 中間有 l 和 m，切在 l 與 m 之間！",
        phonicsNote: "hel 短母音 [ɛ] + met [mɪt]"
      },
      {
        word: "cactus",
        syllables: ["cac", "tus"],
        speechSyllables: ["cak", "tuss"],
        phonetics: ["[kæk]", "[təs]"],
        splitIndex: 3,
        meaning: "仙人掌 🌵",
        hint: "a 和 u 中間有 c 和 t，切在 c 與 t 之間！",
        phonicsNote: "cac 的 a 發短母音 [æ]，後面的 tus 讀輕一點。"
      },
      {
        word: "magnet",
        syllables: ["mag", "net"],
        speechSyllables: ["mag", "net"],
        phonetics: ["[mæɡ]", "[nət]"],
        splitIndex: 3,
        meaning: "磁鐵 🧲",
        hint: "a 和 e 中間有 g 和 n，切在 g 與 n 之間！",
        phonicsNote: "mag 短母音 [æ] + net [nət]"
      },
      {
        word: "pumpkin",
        syllables: ["pump", "kin"],
        speechSyllables: ["pump", "kin"],
        phonetics: ["[pʌmp]", "[kɪn]"],
        splitIndex: 4,
        meaning: "南瓜 🎃",
        hint: "u 和 i 中間有 mp 和 k，切在 p 與 k 之間！",
        phonicsNote: "pump 短母音 [ʌ] + kin 短母音 [ɪ]"
      }
    ]
  },
  {
    id: 4,
    name: "藍帶奧義",
    title: "老虎開音節 (Tiger Rule - V/CV)",
    beltColor: "#42A5F5",
    beltTextColor: "#0D47A1",
    beltBorder: "#1E88E5",
    badge: "🥋 藍帶奧義",
    ruleDescription: "一個子音夾在母音中間，多數切在第一個母音之後（發長母音）！",
    ruleTip: "第一音節以母音結尾（開音節），發字母長母音！",
    words: [
      {
        word: "tiger",
        syllables: ["ti", "ger"],
        speechSyllables: ["tie", "gurr"], // 關鍵校正：ti 發長音 [taɪ] (tie)；ger 發硬音 [ɡər] (gurr)，絕非 soft g！
        phonetics: ["[taɪ]", "[ɡər]"],
        splitIndex: 2,
        meaning: "老虎 🐯",
        hint: "開音節 ti：母音在結尾發長音 [aɪ] (tie)！ger 發硬音 [ɡər]！",
        phonicsNote: "開音節 ti 發長音 [taɪ]；ger 中的 g 發硬音 /ɡ/ 而非 /dʒ/"
      },
      {
        word: "paper",
        syllables: ["pa", "per"],
        speechSyllables: ["pay", "per"], // 關鍵校正：pa 在此發長音 [peɪ] (pay)，非短音 pa！
        phonetics: ["[peɪ]", "[pər]"],
        splitIndex: 2,
        meaning: "紙張 📄",
        hint: "開音節 pa：母音在結尾發長音 [eɪ] (pay)！",
        phonicsNote: "開音節 pa 發字母本音長母音 [peɪ]，絕非爸爸音 [pɑː]"
      },
      {
        word: "robot",
        syllables: ["ro", "bot"],
        speechSyllables: ["row", "baht"], // ro 發長音 [roʊ] (row)
        phonetics: ["[roʊ]", "[bɑːt]"],
        splitIndex: 2,
        meaning: "機器人 🤖",
        hint: "開音節 ro：母音在結尾發長音 [oʊ] (row)！",
        phonicsNote: "開音節 ro 發長母音 [roʊ] + bot 發短音 [bɑːt]"
      },
      {
        word: "baby",
        syllables: ["ba", "by"],
        speechSyllables: ["bay", "bee"],
        phonetics: ["[beɪ]", "[bi]"],
        splitIndex: 2,
        meaning: "嬰兒 👶",
        hint: "先找出和字母 A 同音的 ba。",
        phonicsNote: "ba 的 a 發 [eɪ]，字尾的 y 發 [i]。"
      },
      {
        word: "spider",
        syllables: ["spi", "der"],
        speechSyllables: ["spy", "der"], // spi 發長音 [spaɪ] (spy)
        phonetics: ["[spaɪ]", "[dər]"],
        splitIndex: 3,
        meaning: "蜘蛛 🕷️",
        hint: "開音節 spi：母音在結尾發長音 [aɪ] (spy)！",
        phonicsNote: "開音節 spi 發長母音 [spaɪ] + der [dər]"
      },
      {
        word: "hotel",
        syllables: ["ho", "tel"],
        speechSyllables: ["hoe", "tell"], // ho 發長音 [hoʊ] (hoe)
        phonetics: ["[hoʊ]", "[tɛl]"],
        splitIndex: 2,
        meaning: "飯店 🏨",
        hint: "開音節 ho：母音在結尾發長音 [oʊ]！",
        phonicsNote: "開音節 ho 發長母音 [hoʊ] + tel [tɛl]"
      },
      {
        word: "pilot",
        syllables: ["pi", "lot"],
        speechSyllables: ["pie", "lut"], // pi 發長音 [paɪ] (pie)
        phonetics: ["[paɪ]", "[lət]"],
        splitIndex: 2,
        meaning: "飛行員 👨‍✈️",
        hint: "開音節 pi：母音在結尾發長音 [aɪ] (pie)！",
        phonicsNote: "開音節 pi 發長母音 [paɪ] + lot [lət]"
      },
      {
        word: "tulip",
        syllables: ["tu", "lip"],
        speechSyllables: ["too", "lip"], // tu 發長音 [tuː] (too)
        phonetics: ["[tuː]", "[lɪp]"],
        splitIndex: 2,
        meaning: "鬱金香 🌷",
        hint: "開音節 tu：母音在結尾發長音 [uː] (too)！",
        phonicsNote: "開音節 tu 發長母音 [tuː] + lip [lɪp]"
      }
    ]
  },
  {
    id: 5,
    name: "黑帶大師",
    title: "道場宗師挑戰 (Dojo Master Challenge)",
    beltColor: "#212121",
    beltTextColor: "#FFD700",
    beltBorder: "#000000",
    badge: "🥋 黑帶宗師",
    ruleDescription: "綜合大考驗！判斷開閉音節與母音位置，精準發音並斬擊！",
    ruleTip: "觀察是開音節（長母音）、閉音節（短母音）還是字尾 y 發 [i]？冷靜揮刀！",
    words: [
      {
        word: "happy",
        syllables: ["hap", "py"],
        speechSyllables: ["hap", "pee"],
        phonetics: ["[hæp]", "[pi]"],
        splitIndex: 3,
        meaning: "快樂 😄",
        hint: "字尾 y 發長音 [i] (pee)，雙胞胎 pp 切中間！",
        phonicsNote: "hap [hæp] + py [pi]"
      },
      {
        word: "tiger",
        syllables: ["ti", "ger"],
        speechSyllables: ["tie", "gurr"],
        phonetics: ["[taɪ]", "[ɡər]"],
        splitIndex: 2,
        meaning: "老虎 🐯",
        hint: "開音節 ti 發長音 [taɪ]！ger 發硬音 [ɡər]！",
        phonicsNote: "ti [taɪ] + ger [ɡər]"
      },
      {
        word: "paper",
        syllables: ["pa", "per"],
        speechSyllables: ["pay", "per"],
        phonetics: ["[peɪ]", "[pər]"],
        splitIndex: 2,
        meaning: "紙張 📄",
        hint: "開音節 pa 發長母音 [peɪ] (pay)！",
        phonicsNote: "pa [peɪ] + per [pər]"
      },
      {
        word: "puppy",
        syllables: ["pup", "py"],
        speechSyllables: ["pup", "pee"],
        phonetics: ["[pʌp]", "[pi]"],
        splitIndex: 3,
        meaning: "小狗 🐶",
        hint: "字尾 y 發 [i] (pee)，雙胞胎 pp 切中間！",
        phonicsNote: "pup [pʌp] + py [pi]"
      },
      {
        word: "robot",
        syllables: ["ro", "bot"],
        speechSyllables: ["row", "baht"],
        phonetics: ["[roʊ]", "[bɑːt]"],
        splitIndex: 2,
        meaning: "機器人 🤖",
        hint: "開音節 ro 發長母音 [roʊ]！",
        phonicsNote: "ro [roʊ] + bot [bɑːt]"
      },
      {
        word: "kitten",
        syllables: ["kit", "ten"],
        speechSyllables: ["kit", "tin"],
        phonetics: ["[kɪt]", "[tn]"],
        splitIndex: 3,
        meaning: "小貓 🐱",
        hint: "雙胞胎 tt 切中間！",
        phonicsNote: "kit [kɪt] + ten [tn]"
      },
      {
        word: "monster",
        syllables: ["mon", "ster"],
        speechSyllables: ["mon", "ster"],
        phonetics: ["[mɑːn]", "[stər]"],
        splitIndex: 3,
        meaning: "怪獸 👾",
        hint: "雙子音 n-s 切中間！",
        phonicsNote: "mon [mɑːn] + ster [stər]"
      },
      {
        word: "popcorn",
        syllables: ["pop", "corn"],
        speechSyllables: ["pop", "corn"],
        phonetics: ["[pɑːp]", "[kɔːrn]"],
        splitIndex: 3,
        meaning: "爆米花 🍿",
        hint: "複合字：pop + corn",
        phonicsNote: "pop [pɑːp] + corn [kɔːrn]"
      }
    ]
  }
];

// 判斷字母是否為母音 (智能識別：y 在詞首多為子音如 yellow [j]，非詞首為母音如 happy [i])
function isVowel(char, index = 1) {
  const c = char.toLowerCase();
  if ('aeiou'.includes(c)) return true;
  if (c === 'y') {
    return index > 0;
  }
  return false;
}
