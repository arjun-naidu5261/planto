import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Linking, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants/theme';
import { api } from '../services/api';

interface ChatMessage {
  id: number;
  isBot: boolean;
  text: string;
  type?: 'text' | 'order' | 'contact' | 'care';
  quickReplies?: string[];
}

const QUICK_ACTIONS = [
  "📦 Track My Order",
  "🌿 Yellowing Leaves Help",
  "🔄 30-Day Guarantee",
  "⭐ Care Pass (₹99/mo)",
  "💬 WhatsApp Support",
  "📞 Call Care Hotline"
];

export default function HelpBotScreen({ navigation }: any) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      isBot: true,
      text: "Hello! I'm Flora, your PlantMe AI Concierge 🌿\n\nI can help you instantly with:\n• 📦 Live Order Tracking & Rider details\n• 🩺 Plant Health & Care Advice\n• 🔄 30-Day Thrive Guarantee claims\n• ⭐ Care Pass benefits (₹99/mo)\n• 💬 Escalating directly to our team at info@futureforbes.in or +91 88856 00899\n\nHow can I help you today?",
      quickReplies: ["📦 Track My Order", "🌿 Plant Care Tips", "💬 WhatsApp Concierge"]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  const handleQuickAction = (action: string) => {
    if (action.includes("WhatsApp")) {
      Linking.openURL("https://wa.me/918885600899?text=Hello%20PlantMe%20Concierge,%20I%20need%20assistance.");
      return;
    }
    if (action.includes("Call")) {
      Linking.openURL("tel:+918885600899");
      return;
    }
    sendMessage(action);
  };

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = { id: Date.now(), isBot: false, text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const q = query.toLowerCase();
      let botResponse = "";
      let msgType: 'text' | 'order' | 'contact' | 'care' = 'text';

      if (q.includes("track") || q.includes("order") || q.includes("status") || q.includes("where")) {
        msgType = 'order';
        botResponse = "📦 **Live Order Tracking:**\n\n• **Order #ORD-7290:** In EV Transit (18 mins ETA)\n• **Items:** Ficus Bonsai (x1)\n• **Rider:** Ramu K. (+91 98450 12345)\n• **Vehicle:** PlantMe Eco EV-Cargo 12\n• **Delivery OTP:** `6506`\n• **Address:** Flat 402, Green Heights, Bengaluru";
      } else if (q.includes("contact") || q.includes("human") || q.includes("call") || q.includes("whatsapp") || q.includes("email") || q.includes("phone")) {
        msgType = 'contact';
        botResponse = "🌿 **PlantMe Care Team 24/7:**\n\n• **Email:** info@futureforbes.in\n• **Care Hotline:** +91 88856 00899\n• **WhatsApp:** +91 88856 00899\n\nTap below to call or chat directly!";
      } else if (q.includes("yellow") || q.includes("brown") || q.includes("water") || q.includes("droop") || q.includes("care")) {
        msgType = 'care';
        botResponse = "🌱 **Botanical Diagnostic Advice:**\n\n• **Yellow Leaves:** Almost always caused by overwatering. Allow the top 2 inches of soil to dry out.\n• **Watering Frequency:** Once every 5–7 days for indoor plants.\n• **Light:** Bright indirect sunlight near a window is ideal.";
      } else if (q.includes("guarantee") || q.includes("replace") || q.includes("thrive") || q.includes("return")) {
        botResponse = "🛡️ **30-Day 'Thrive or Replace' Guarantee:**\n\nIf your plant shows signs of decline within 30 days of delivery, you can request an instant 1-click nursery replacement or video consult with our senior botanist!";
      } else if (q.includes("care pass") || q.includes("pass") || q.includes("99")) {
        botResponse = "⭐ **PlantMe Care Pass (₹99/month):**\n\n• 10% OFF all orders automatically\n• Free quarterly organic repotting soil mix\n• Priority 15-min replacement guarantee\n• Unlimited botanist consultations";
      } else {
        botResponse = "🌿 I can help you track orders, give plant care advice, process 30-day replacements, or connect you with our team on WhatsApp (+91 88856 00899) or info@futureforbes.in!";
      }

      await new Promise(r => setTimeout(r, 600));
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          isBot: true,
          text: botResponse,
          type: msgType,
          quickReplies: ["📦 Track Order", "💬 WhatsApp Support", "📞 Call Support"]
        }
      ]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          isBot: true,
          text: "🌿 Need instant support? Contact us:\n• Email: info@futureforbes.in\n• Phone / WhatsApp: +91 88856 00899"
        }
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.botProfile}>
            <View style={styles.avatarWrap}>
              <Text style={{ fontSize: 20 }}>🌿</Text>
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.botName}>Flora AI Concierge</Text>
              <Text style={styles.botSub}>Online • Support & Botanical Care</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => Linking.openURL("tel:+918885600899")} style={styles.iconAction}>
              <Ionicons name="call" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("https://wa.me/918885600899")} style={styles.iconAction}>
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Action Chips Bar */}
      <View style={styles.chipsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {QUICK_ACTIONS.map((action, idx) => (
            <TouchableOpacity key={idx} style={styles.chip} onPress={() => handleQuickAction(action)}>
              <Text style={styles.chipText}>{action}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Message History */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.bubbleWrapper, msg.isBot ? styles.botWrapper : styles.userWrapper]}>
            <View style={[styles.bubble, msg.isBot ? styles.botBubble : styles.userBubble]}>
              <Text style={[styles.msgText, msg.isBot ? styles.botText : styles.userText]}>
                {msg.text}
              </Text>

              {/* Contact Card Action Buttons inside bot bubble */}
              {msg.type === 'contact' && (
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#25D366' }]}
                    onPress={() => Linking.openURL("https://wa.me/918885600899?text=Hello%20PlantMe%20Support")}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Chat on WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#1b4332' }]}
                    onPress={() => Linking.openURL("tel:+918885600899")}
                  >
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Call +91 88856 00899</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Order Card Action */}
              {msg.type === 'order' && (
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#1b4332' }]}
                    onPress={() => Linking.openURL("tel:+919845012345")}
                  >
                    <Ionicons name="call-outline" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Call Rider Ramu K.</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Quick replies under bot msg */}
            {msg.isBot && msg.quickReplies && (
              <View style={styles.quickRepliesWrap}>
                {msg.quickReplies.map((qr, qrIdx) => (
                  <TouchableOpacity key={qrIdx} style={styles.qrPill} onPress={() => handleQuickAction(qr)}>
                    <Text style={styles.qrText}>{qr}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {isTyping && (
          <View style={[styles.bubbleWrapper, styles.botWrapper]}>
            <View style={[styles.bubble, styles.botBubble, { paddingVertical: 10, paddingHorizontal: 16 }]}>
              <Text style={{ fontSize: 13, color: '#64748b' }}>Flora is typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Row */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask Flora anything about plants or orders..."
          placeholderTextColor="#94a3b8"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
          disabled={!input.trim()}
          onPress={() => sendMessage()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: Platform.OS === 'ios' ? 48 : 36, paddingBottom: 16, paddingHorizontal: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 4, marginRight: 8 },
  botProfile: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarWrap: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10, position: 'relative'
  },
  onlineDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981',
    position: 'absolute', bottom: 1, right: 1, borderWidth: 1.5, borderColor: '#1b4332'
  },
  botName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  botSub: { fontSize: 11, color: '#d8f3dc' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconAction: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center'
  },
  chipsBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 10 },
  chipsContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0'
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#1b4332' },
  messagesList: { flex: 1 },
  messagesContent: { padding: 16, gap: 14 },
  bubbleWrapper: { maxWidth: '85%' },
  botWrapper: { alignSelf: 'flex-start' },
  userWrapper: { alignSelf: 'flex-end' },
  bubble: { padding: 14, borderRadius: 18 },
  botBubble: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#1b4332', borderBottomRightRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 20 },
  botText: { color: '#0f172a' },
  userText: { color: '#ffffff' },
  cardActions: { marginTop: 12, gap: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 9, borderRadius: 10
  },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  quickRepliesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  qrPill: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14
  },
  qrText: { fontSize: 11.5, fontWeight: '600', color: '#1b4332' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 10
  },
  textInput: {
    flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#0f172a'
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#1b4332',
    alignItems: 'center', justifyContent: 'center'
  }
});
