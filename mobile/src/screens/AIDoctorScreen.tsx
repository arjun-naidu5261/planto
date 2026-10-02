import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants/theme';
import { api } from '../services/api';

interface Message {
  id: number;
  isBot: boolean;
  text: string;
}

const QUICK_SYMPTOMS = [
  { label: 'Yellowing Leaves', query: 'My plant has yellowing leaves and wilting lower stems' },
  { label: 'Brown Crispy Tips', query: 'Brown crispy dry leaf tips on indoor plant' },
  { label: 'Overwatering?', query: 'Signs of overwatering in potted houseplants' },
  { label: 'Pest Control', query: 'How to get rid of tiny white bugs on indoor plant soil' },
];

const FALLBACK_RESPONSES: Record<string, string> = {
  yellow: '🌿 Yellowing leaves are usually caused by overwatering, poor drainage, or low light. Let the top 2 inches of soil dry out before watering again. Ensure the pot has drainage holes.',
  brown: '🍂 Brown crispy tips indicate low humidity or inconsistent watering. Group plants together for humidity, or use a pebble tray with water. Avoid placing near AC vents.',
  overwater: '💧 Overwatering signs include yellowing, mushy stems, and mold on soil. Reduce watering frequency. Let soil dry completely, then water deeply. Ensure good drainage.',
  pest: '🐛 White bugs on soil are usually fungus gnats or mealybugs. Let soil dry out between watering (gnats hate dry soil), and spray neem oil dilution on leaves and soil weekly.',
};

function getFallbackResponse(query: string) {
  const q = query.toLowerCase();
  if (q.includes('yellow')) return FALLBACK_RESPONSES.yellow;
  if (q.includes('brown')) return FALLBACK_RESPONSES.brown;
  if (q.includes('overwater')) return FALLBACK_RESPONSES.overwater;
  if (q.includes('bug') || q.includes('pest') || q.includes('insect')) return FALLBACK_RESPONSES.pest;
  return '🌱 Based on your description, ensure your plant has adequate light, proper watering schedule, and good drainage. If the issue persists, try a live consultation with our botanist Dr. Priya Nair!';
}

export default function AIDoctorScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, isBot: true, text: "Hello! I'm your AI Plant Doctor 🌿\n\nDescribe your plant's symptoms or tap a quick question below and I'll diagnose it instantly!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), isBot: false, text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 1200));
    setIsTyping(false);

    try {
      const res = await api.diagnosePlant(text);
      const botText = res?.issue
        ? `AI Doctor Diagnosis: ${res.issue}\nConfidence: ${res.confidence} • Urgency: ${res.urgency}\n\nProbable Cause: ${res.cause}\n\nRecommended Treatment:\n${res.remedy?.map((r: string, i: number) => `• Step ${i + 1}: ${r}`).join('\n')}`
        : getFallbackResponse(text);
      setMessages(prev => [...prev, { id: Date.now(), isBot: true, text: botText }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), isBot: true, text: getFallbackResponse(text) }]);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.header}>
        <Text style={styles.headerTitle}>AI Plant Doctor</Text>
        <Text style={styles.headerSub}>Instant plant care advice & diagnosis</Text>
      </LinearGradient>

      {/* Live Botanist Banner */}
      <View style={styles.botanistBanner}>
        <View style={styles.onlineDot} />
        <View style={{ flex: 1 }}>
          <Text style={styles.botanistTitle}>Dr. Priya Nair is online now</Text>
          <Text style={styles.botanistSub}>Book a 5-min live video consultation</Text>
        </View>
        <TouchableOpacity style={styles.botanistBtn}>
          <Text style={styles.botanistBtnText}>Book Call</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.md, gap: 12 }}
      >
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[styles.bubble, msg.isBot ? styles.bubbleBot : styles.bubbleUser]}
          >
            {msg.isBot && (
              <View style={styles.botAvatar}>
                <Ionicons name="leaf" size={14} color="#fff" />
              </View>
            )}
            <View style={[styles.bubbleContent, msg.isBot ? styles.bubbleContentBot : styles.bubbleContentUser]}>
              <Text style={[styles.bubbleText, msg.isBot ? styles.bubbleTextBot : styles.bubbleTextUser]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
        {isTyping && (
          <View style={styles.typingRow}>
            <View style={styles.botAvatar}>
              <Ionicons name="leaf" size={14} color="#fff" />
            </View>
            <View style={styles.typingBubble}>
              <Text style={styles.typingDots}>●  ●  ●</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Symptom Pills */}
      <View style={styles.quickWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRowContainer}
        >
          {QUICK_SYMPTOMS.map((s, i) => (
            <TouchableOpacity key={i} style={styles.quickPill} onPress={() => sendMessage(s.query)}>
              <Text style={styles.quickPillText}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.chatInput}
          value={input}
          onChangeText={setInput}
          placeholder="Describe your plant's symptoms..."
          multiline
          onSubmitEditing={() => sendMessage(input)}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 50, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  botanistBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', marginHorizontal: Spacing.md, marginTop: Spacing.md, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e', shadowColor: '#22c55e', shadowRadius: 4, shadowOpacity: 0.8 },
  botanistTitle: { fontSize: 13, fontWeight: '800', color: Colors.text },
  botanistSub: { fontSize: 11, color: Colors.textMuted },
  botanistBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 7, paddingHorizontal: 12 },
  botanistBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  chatArea: { flex: 1 },
  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleBot: { justifyContent: 'flex-start' },
  bubbleUser: { justifyContent: 'flex-end' },
  botAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  bubbleContent: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  bubbleContentBot: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  bubbleContentUser: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 13, lineHeight: 20 },
  bubbleTextBot: { color: Colors.text },
  bubbleTextUser: { color: '#fff' },
  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  typingBubble: { backgroundColor: '#fff', borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  typingDots: { fontSize: 16, color: Colors.textMuted, letterSpacing: 4 },
  quickWrapper: { height: 48, flexGrow: 0, flexShrink: 0, backgroundColor: Colors.bg, justifyContent: 'center' },
  quickRowContainer: { paddingHorizontal: Spacing.md, alignItems: 'center', flexDirection: 'row' },
  quickPill: { height: 34, paddingHorizontal: 16, borderRadius: 17, backgroundColor: '#fff', borderWidth: 1.5, borderColor: Colors.border, marginRight: Spacing.sm, justifyContent: 'center', alignItems: 'center' },
  quickPillText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  inputRow: { flexDirection: 'row', gap: 10, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'flex-end' },
  chatInput: { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
