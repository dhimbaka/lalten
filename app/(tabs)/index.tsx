import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

type ScriptName =
  | 'devanagari'
  | 'tamil'
  | 'telugu'
  | 'bengali'
  | 'arabic'
  | 'cyrillic'
  | 'hebrew'
  | 'unknown';

type TransliterationMap = Record<string, string>;

type ScriptMap = Record<Exclude<ScriptName, 'unknown'>, TransliterationMap>;

type TextToken = {
  value: string;
  isWord: boolean;
};

const DEVANAGARI_MAP: TransliterationMap = {
  'अ': 'a',
  'आ': 'aa',
  'इ': 'i',
  'ई': 'ii',
  'उ': 'u',
  'ऊ': 'uu',
  'ऋ': 'ri',
  'ए': 'e',
  'ऐ': 'ai',
  'ओ': 'o',
  'औ': 'au',
  'ा': 'aa',
  'ि': 'i',
  'ी': 'ii',
  'ु': 'u',
  'ू': 'uu',
  'ृ': 'ri',
  'े': 'e',
  'ै': 'ai',
  'ो': 'o',
  'ौ': 'au',
  '्': '',
  'क': 'ka',
  'ख': 'kha',
  'ग': 'ga',
  'घ': 'gha',
  'ङ': 'nga',
  'च': 'cha',
  'छ': 'chha',
  'ज': 'ja',
  'झ': 'jha',
  'ञ': 'nya',
  'ट': 'ta',
  'ठ': 'tha',
  'ड': 'da',
  'ढ': 'dha',
  'ण': 'na',
  'त': 'ta',
  'थ': 'tha',
  'द': 'da',
  'ध': 'dha',
  'न': 'na',
  'प': 'pa',
  'फ': 'pha',
  'ब': 'ba',
  'भ': 'bha',
  'म': 'ma',
  'य': 'ya',
  'र': 'ra',
  'ल': 'la',
  'व': 'va',
  'श': 'sha',
  'ष': 'sha',
  'स': 'sa',
  'ह': 'ha',
  'ं': 'n',
  'ः': 'h',
  'ँ': 'n',
};

const TAMIL_MAP: TransliterationMap = {
  'அ': 'a',
  'ஆ': 'aa',
  'இ': 'i',
  'ஈ': 'ii',
  'உ': 'u',
  'ஊ': 'uu',
  'எ': 'e',
  'ஏ': 'ee',
  'ஐ': 'ai',
  'ஒ': 'o',
  'ஓ': 'oo',
  'ஔ': 'au',
  'ா': 'aa',
  'ி': 'i',
  'ீ': 'ii',
  'ு': 'u',
  'ூ': 'uu',
  'ெ': 'e',
  'ே': 'ee',
  'ை': 'ai',
  'ொ': 'o',
  'ோ': 'oo',
  'ௌ': 'au',
  '்': '',
  'க': 'ka',
  'ங': 'nga',
  'ச': 'cha',
  'ஞ': 'nya',
  'ட': 'ta',
  'ண': 'na',
  'த': 'tha',
  'ந': 'na',
  'ப': 'pa',
  'ம': 'ma',
  'ய': 'ya',
  'ர': 'ra',
  'ல': 'la',
  'வ': 'va',
  'ழ': 'zha',
  'ள': 'la',
  'ற': 'ra',
  'ன': 'na',
  'ஃ': 'h',
};

const TELUGU_VIRAMA = '్';

const TELUGU_INDEPENDENT_VOWELS: TransliterationMap = {
  'అ': 'a',
  'ఆ': 'aa',
  'ఇ': 'i',
  'ఈ': 'ii',
  'ఉ': 'u',
  'ఊ': 'uu',
  'ఋ': 'ri',
  'ఎ': 'e',
  'ఏ': 'ee',
  'ఐ': 'ai',
  'ఒ': 'o',
  'ఓ': 'oo',
  'ఔ': 'au',
};

const TELUGU_VOWEL_SIGNS: TransliterationMap = {
  'ా': 'aa',
  'ి': 'i',
  'ీ': 'ii',
  'ు': 'u',
  'ూ': 'uu',
  'ృ': 'ri',
  'ె': 'e',
  'ే': 'ee',
  'ై': 'ai',
  'ొ': 'o',
  'ో': 'oo',
  'ౌ': 'au',
};

const TELUGU_CONSONANTS: TransliterationMap = {
  'క': 'k',
  'ఖ': 'kh',
  'గ': 'g',
  'ఘ': 'gh',
  'ఙ': 'ng',
  'చ': 'ch',
  'ఛ': 'chh',
  'జ': 'j',
  'ఝ': 'jh',
  'ఞ': 'ny',
  'ట': 't',
  'ఠ': 'th',
  'డ': 'd',
  'ఢ': 'dh',
  'ణ': 'n',
  'త': 't',
  'థ': 'th',
  'ద': 'd',
  'ధ': 'dh',
  'న': 'n',
  'ప': 'p',
  'ఫ': 'ph',
  'బ': 'b',
  'భ': 'bh',
  'మ': 'm',
  'య': 'y',
  'ర': 'r',
  'ల': 'l',
  'వ': 'v',
  'శ': 'sh',
  'ష': 'sh',
  'స': 's',
  'హ': 'h',
  'ళ': 'l',
};

const TELUGU_MISC: TransliterationMap = {
  'ం': 'm',
  'ః': 'h',
  'ఁ': 'n',
};

const TELUGU_MAP: TransliterationMap = {
  ...TELUGU_INDEPENDENT_VOWELS,
  ...TELUGU_VOWEL_SIGNS,
  ...TELUGU_CONSONANTS,
  ...TELUGU_MISC,
  [TELUGU_VIRAMA]: '',
};

const BENGALI_MAP: TransliterationMap = {
  'অ': 'a',
  'আ': 'aa',
  'ই': 'i',
  'ঈ': 'ii',
  'উ': 'u',
  'ঊ': 'uu',
  'ঋ': 'ri',
  'এ': 'e',
  'ঐ': 'ai',
  'ও': 'o',
  'ঔ': 'au',
  'া': 'aa',
  'ি': 'i',
  'ী': 'ii',
  'ু': 'u',
  'ূ': 'uu',
  'ৃ': 'ri',
  'ে': 'e',
  'ৈ': 'ai',
  'ো': 'o',
  'ৌ': 'au',
  '্': '',
  'ক': 'ka',
  'খ': 'kha',
  'গ': 'ga',
  'ঘ': 'gha',
  'ঙ': 'nga',
  'চ': 'cha',
  'ছ': 'chha',
  'জ': 'ja',
  'ঝ': 'jha',
  'ঞ': 'nya',
  'ট': 'ta',
  'ঠ': 'tha',
  'ড': 'da',
  'ঢ': 'dha',
  'ণ': 'na',
  'ত': 'ta',
  'থ': 'tha',
  'দ': 'da',
  'ধ': 'dha',
  'ন': 'na',
  'প': 'pa',
  'ফ': 'pha',
  'ব': 'ba',
  'ভ': 'bha',
  'ম': 'ma',
  'য': 'ya',
  'র': 'ra',
  'ল': 'la',
  'শ': 'sha',
  'ষ': 'sha',
  'স': 'sa',
  'হ': 'ha',
  'ং': 'ng',
  'ঃ': 'h',
  'ঁ': 'n',
};

const ARABIC_MAP: TransliterationMap = {
  'ا': 'a',
  'أ': 'a',
  'إ': 'i',
  'آ': 'aa',
  'ب': 'b',
  'ت': 't',
  'ث': 'th',
  'ج': 'j',
  'ح': 'h',
  'خ': 'kh',
  'د': 'd',
  'ذ': 'dh',
  'ر': 'r',
  'ز': 'z',
  'س': 's',
  'ش': 'sh',
  'ص': 's',
  'ض': 'd',
  'ط': 't',
  'ظ': 'z',
  'ع': 'a',
  'غ': 'gh',
  'ف': 'f',
  'ق': 'q',
  'ك': 'k',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'ه': 'h',
  'و': 'w',
  'ي': 'y',
  'ء': 'a',
  'ى': 'a',
  'ة': 'h',
  'َ': 'a',
  'ِ': 'i',
  'ُ': 'u',
  'ْ': '',
  'ّ': '',
};

const CYRILLIC_MAP: TransliterationMap = {
  'А': 'A',
  'Б': 'B',
  'В': 'V',
  'Г': 'G',
  'Д': 'D',
  'Е': 'E',
  'Ё': 'Yo',
  'Ж': 'Zh',
  'З': 'Z',
  'И': 'I',
  'Й': 'Y',
  'К': 'K',
  'Л': 'L',
  'М': 'M',
  'Н': 'N',
  'О': 'O',
  'П': 'P',
  'Р': 'R',
  'С': 'S',
  'Т': 'T',
  'У': 'U',
  'Ф': 'F',
  'Х': 'Kh',
  'Ц': 'Ts',
  'Ч': 'Ch',
  'Ш': 'Sh',
  'Щ': 'Shch',
  'Ъ': '',
  'Ы': 'Y',
  'Ь': '',
  'Э': 'E',
  'Ю': 'Yu',
  'Я': 'Ya',
  'а': 'a',
  'б': 'b',
  'в': 'v',
  'г': 'g',
  'д': 'd',
  'е': 'e',
  'ё': 'yo',
  'ж': 'zh',
  'з': 'z',
  'и': 'i',
  'й': 'y',
  'к': 'k',
  'л': 'l',
  'м': 'm',
  'н': 'n',
  'о': 'o',
  'п': 'p',
  'р': 'r',
  'с': 's',
  'т': 't',
  'у': 'u',
  'ф': 'f',
  'х': 'kh',
  'ц': 'ts',
  'ч': 'ch',
  'ш': 'sh',
  'щ': 'shch',
  'ъ': '',
  'ы': 'y',
  'ь': '',
  'э': 'e',
  'ю': 'yu',
  'я': 'ya',
};

const HEBREW_MAP: TransliterationMap = {
  'א': 'a',
  'ב': 'b',
  'ג': 'g',
  'ד': 'd',
  'ה': 'h',
  'ו': 'v',
  'ז': 'z',
  'ח': 'kh',
  'ט': 't',
  'י': 'y',
  'כ': 'k',
  'ך': 'k',
  'ל': 'l',
  'מ': 'm',
  'ם': 'm',
  'נ': 'n',
  'ן': 'n',
  'ס': 's',
  'ע': 'a',
  'פ': 'p',
  'ף': 'p',
  'צ': 'ts',
  'ץ': 'ts',
  'ק': 'k',
  'ר': 'r',
  'ש': 'sh',
  'ת': 't',
};

const SCRIPT_MAPS: ScriptMap = {
  devanagari: DEVANAGARI_MAP,
  tamil: TAMIL_MAP,
  telugu: TELUGU_MAP,
  bengali: BENGALI_MAP,
  arabic: ARABIC_MAP,
  cyrillic: CYRILLIC_MAP,
  hebrew: HEBREW_MAP,
};

const SCRIPT_RANGES: Record<Exclude<ScriptName, 'unknown'>, RegExp> = {
  devanagari: /[\u0900-\u097F]/,
  tamil: /[\u0B80-\u0BFF]/,
  telugu: /[\u0C00-\u0C7F]/,
  bengali: /[\u0980-\u09FF]/,
  arabic: /[\u0600-\u06FF]/,
  cyrillic: /[\u0400-\u04FF]/,
  hebrew: /[\u0590-\u05FF]/,
};

const detectScript = (char: string): ScriptName => {
  const entry = Object.entries(SCRIPT_RANGES).find(([, range]) => range.test(char));
  if (!entry) {
    return 'unknown';
  }
  return entry[0] as Exclude<ScriptName, 'unknown'>;
};

const scriptToLangCode = (script: ScriptName): string => {
  switch (script) {
    case 'devanagari':
      return 'hi';
    case 'tamil':
      return 'ta';
    case 'telugu':
      return 'te';
    case 'bengali':
      return 'bn';
    case 'arabic':
      return 'ar';
    case 'cyrillic':
      return 'ru';
    case 'hebrew':
      return 'iw';
    default:
      return 'auto';
  }
};

const detectWordScript = (word: string): ScriptName => {
  for (const char of word) {
    const script = detectScript(char);
    if (script !== 'unknown') {
      return script;
    }
  }
  return 'unknown';
};

const transliterateWordCells = (word: string): string[] => {
  const chars = Array.from(word);
  return chars.map((char, index) => {
    const script = detectScript(char);

    if (script !== 'telugu') {
      return script === 'unknown' ? char : SCRIPT_MAPS[script][char] ?? char;
    }

    if (TELUGU_INDEPENDENT_VOWELS[char]) {
      return TELUGU_INDEPENDENT_VOWELS[char];
    }
    if (TELUGU_VOWEL_SIGNS[char]) {
      return TELUGU_VOWEL_SIGNS[char];
    }
    if (char === TELUGU_VIRAMA) {
      return '';
    }
    if (TELUGU_MISC[char]) {
      return TELUGU_MISC[char];
    }

    const consonant = TELUGU_CONSONANTS[char];
    if (consonant) {
      const nextChar = chars[index + 1];
      const nextIsVowelSign =
        nextChar &&
        detectScript(nextChar) === 'telugu' &&
        Boolean(TELUGU_VOWEL_SIGNS[nextChar]);
      const nextIsVirama = nextChar === TELUGU_VIRAMA;
      return nextIsVowelSign || nextIsVirama ? consonant : `${consonant}a`;
    }

    return char;
  });
};

const tokenizeText = (text: string): TextToken[] => {
  if (!text) {
    return [];
  }
  return text.split(/(\s+)/).filter(Boolean).map((token) => ({
    value: token,
    isWord: !/^\s+$/.test(token),
  }));
};

export default function HomeScreen() {
  const { text } = useLocalSearchParams<{ text?: string | string[] }>();
  const [inputText, setInputText] = useState<string>('');
  const [processedText, setProcessedText] = useState<string>('');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showTranslate, setShowTranslate] = useState<boolean>(false);
  const lastAppliedTextRef = useRef<string | null>(null);

  const processedTokens = useMemo(() => tokenizeText(processedText), [processedText]);

  const selectedTransliteration = useMemo(() => {
    if (!selectedWord) {
      return [];
    }
    return transliterateWordCells(selectedWord);
  }, [selectedWord]);

  const selectedChars = useMemo(() => {
    if (!selectedWord) {
      return [];
    }
    return Array.from(selectedWord);
  }, [selectedWord]);

  const columnWidths = useMemo(() => {
    if (!selectedWord) {
      return [];
    }
    return selectedChars.map((char, index) => {
      const part = selectedTransliteration[index] ?? '';
      const maxLen = Math.max(Array.from(char).length, part.length);
      return Math.max(44, maxLen * 14 + 16);
    });
  }, [selectedChars, selectedTransliteration, selectedWord]);

  const handleProcess = () => {
    setProcessedText(inputText);
    setSelectedWord(null);
    setShowTranslate(false);
  };

  const handleCloseTransliteration = () => {
    setSelectedWord(null);
    setShowTranslate(false);
  };

  useEffect(() => {
    if (typeof text !== 'string') {
      return;
    }
    if (!text || text === lastAppliedTextRef.current) {
      return;
    }
    lastAppliedTextRef.current = text;
    if (text !== processedText) {
      setInputText(text);
      setProcessedText(text);
      setSelectedWord(null);
      setShowTranslate(false);
    }
  }, [text, processedText]);

  const translateUrl = useMemo(() => {
    if (!selectedWord) {
      return '';
    }
    const encoded = encodeURIComponent(selectedWord);
    const script = detectWordScript(selectedWord);
    const sourceLang = scriptToLangCode(script);
    return `https://translate.google.com/?sl=${sourceLang}&tl=en&text=${encoded}&op=translate`;
  }, [selectedWord]);

  const translateCleanupScript = `
    (function() {
      const header = document.querySelector('header');
      if (header) { header.style.display = 'none'; }
      const appbar = document.querySelector('[role="banner"]');
      if (appbar) { appbar.style.display = 'none'; }
      document.body.style.paddingTop = '0px';
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Script Transliterator</Text>
        {processedText ? (
          <Pressable onPress={() => setProcessedText('')} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Edit text</Text>
          </Pressable>
        ) : (
          <>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              multiline
              placeholder="Paste text here"
              style={styles.input}
            />
            <Pressable onPress={handleProcess} style={styles.button}>
              <Text style={styles.buttonText}>Process text</Text>
            </Pressable>
          </>
        )}
        <ScrollView contentContainerStyle={styles.textContainer}>
          {processedText.trim().length === 0 ? (
            <Text style={styles.placeholder}>Processed text will appear here.</Text>
          ) : (
            <Text style={styles.paragraph}>
              {processedTokens.map((token, index) =>
                token.isWord ? (
                  <Text
                    key={`${token.value}-${index}`}
                    onPress={() => setSelectedWord(token.value)}
                    suppressHighlighting
                    style={[
                      styles.wordText,
                      selectedWord === token.value ? styles.wordSelected : null,
                    ]}
                  >
                    {token.value}
                  </Text>
                ) : (
                  <Text key={`${token.value}-${index}`}>{token.value}</Text>
                ),
              )}
            </Text>
          )}
        </ScrollView>
      </View>
      {selectedWord ? (
        <View style={styles.bottomPanel}>
          <>
            <View style={styles.panelHeaderRow}>
              <Text style={styles.panelLabel}>Selected word</Text>
              <Pressable
                onPress={handleCloseTransliteration}
                accessibilityRole="button"
                accessibilityLabel="Close transliteration"
                style={styles.closeInline}
              >
                <Text style={styles.closeInlineText}>×</Text>
              </Pressable>
            </View>
            <Text style={styles.fullWord}>{selectedWord}</Text>
            <Text style={styles.panelLabel}>Characters</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.transliterationScroll}
            >
              <View>
                <View style={styles.transliterationRow}>
                  {selectedChars.map((char, index) => (
                    <View
                      key={`${char}-${index}`}
                      style={[styles.transliterationBox, { width: columnWidths[index] }]}
                    >
                      <Text style={styles.transliterationText} numberOfLines={1}>
                        {char}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.panelLabel}>Latin transliteration</Text>
                <View style={styles.transliterationRow}>
                  {selectedChars.map((_, index) => {
                    const part = selectedTransliteration[index] ?? '';
                    return (
                      <View
                        key={`${part}-${index}`}
                        style={[styles.transliterationBox, { width: columnWidths[index] }]}
                      >
                        <Text
                          style={styles.transliterationText}
                          numberOfLines={1}
                          ellipsizeMode="clip"
                        >
                          {part}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
            <View style={styles.translateHeader}>
              <Text style={styles.panelLabel}>Google Translate</Text>
              <Pressable
                onPress={() => setShowTranslate((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={showTranslate ? 'Hide translate' : 'Show translate'}
                style={styles.translateToggle}
              >
                <Text style={styles.translateToggleText}>
                  {showTranslate ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>
            {showTranslate ? (
              <View style={styles.webViewFrame}>
                <WebView
                  originWhitelist={['*']}
                  source={{ uri: translateUrl }}
                  startInLoadingState
                  injectedJavaScript={translateCleanupScript}
                />
              </View>
            ) : null}
          </>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F2EE',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 12,
  },
  input: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#C9C3BA',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    color: '#2A2A2A',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#1E4D6B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    borderWidth: 1,
    borderColor: '#C9C3BA',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonText: {
    color: '#1E4D6B',
    fontSize: 15,
    fontWeight: '600',
  },
  textContainer: {
    paddingBottom: 24,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1E1E1E',
  },
  wordText: {
    color: '#1E1E1E',
  },
  wordSelected: {
    color: '#1E4D6B',
    textDecorationLine: 'underline',
  },
  placeholder: {
    color: '#6B6B6B',
    fontSize: 15,
  },
  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D8D2C7',
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 8,
    elevation: 6,
  },
  panelLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
    color: '#8A8073',
    marginTop: 6,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fullWord: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F1A14',
    marginTop: 4,
  },
  closeInline: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C9C3BA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F4EF',
  },
  closeInlineText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B645A',
  },
  transliterationRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  transliterationScroll: {
    paddingBottom: 8,
  },
  translateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  translateToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#C9C3BA',
    backgroundColor: '#FFFFFF',
  },
  translateToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E4D6B',
  },
  webViewFrame: {
    height: 320,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D6CFC4',
    backgroundColor: '#FFFFFF',
  },
  transliterationBox: {
    backgroundColor: '#F0ECE6',
    borderWidth: 1,
    borderColor: '#D6CFC4',
    borderRadius: 0,
    paddingHorizontal: 1,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transliterationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1A14',
  },
  panelHint: {
    fontSize: 14,
    color: '#6B6B6B',
  },
});
