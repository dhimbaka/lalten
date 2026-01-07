import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

type StoredText = {
  id: string;
  title: string;
  script: string;
  text: string;
};

const STORED_TEXTS: StoredText[] = [
  {
    id: 'telugu-1',
    title: 'Telugu greeting',
    script: 'Telugu',
    text: 'నమస్కారం మీకు ఎలా ఉంది',
  },
  {
    id: 'hindi-1',
    title: 'Hindi phrase',
    script: 'Devanagari',
    text: 'यह एक सरल उदाहरण है',
  },
  {
    id: 'tamil-1',
    title: 'Tamil phrase',
    script: 'Tamil',
    text: 'இந்த உரை ஒரு உதாரணம்',
  },
  {
    id: 'bengali-1',
    title: 'Bengali phrase',
    script: 'Bengali',
    text: 'এটি একটি উদাহরণ বাক্য',
  },
  {
    id: 'arabic-1',
    title: 'Arabic phrase',
    script: 'Arabic',
    text: 'هذا مثال بسيط للنص',
  },
  {
    id: 'cyrillic-1',
    title: 'Cyrillic phrase',
    script: 'Cyrillic',
    text: 'Это простой пример текста',
  },
  {
    id: 'hebrew-1',
    title: 'Hebrew phrase',
    script: 'Hebrew',
    text: 'זהו משפט לדוגמה',
  },
];

export default function StoredTextsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Stored Texts</Text>
        <Text style={styles.subtitle}>
          Pick a sample to transliterate with the same workflow as the main tab.
        </Text>
        {STORED_TEXTS.map((item) => (
          <Link key={item.id} href={{ pathname: '/', params: { text: item.text } }} asChild>
            <Pressable style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBadge}>{item.script}</Text>
              </View>
              <Text style={styles.cardText}>{item.text}</Text>
              <Text style={styles.cardAction}>Transliterate</Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F2EE',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#5A534A',
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#D6CFC4',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  cardBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E4D6B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardText: {
    fontSize: 15,
    color: '#2A2A2A',
    marginBottom: 10,
  },
  cardAction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E4D6B',
  },
});
