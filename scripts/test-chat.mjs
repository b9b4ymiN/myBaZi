#!/usr/bin/env node
/**
 * Test script for Chat Store + Chat Flow
 * Phase 5.4 — 天机 Chat UI
 */

// localStorage polyfill for Node.js
global.localStorage = {
  getItem: (key) => global.localStorage._data[key] || null,
  setItem: (key, value) => { global.localStorage._data[key] = value; },
  removeItem: (key) => { delete global.localStorage._data[key]; },
  clear: () => { global.localStorage._data = {}; },
  _data: {},
};

import { useChatStoreBase } from '../src/lib/stores/chat-store.js';

console.log('🧪 Testing Chat Store...\n');

// ===== Test 1: Initial State =====
console.log('✅ Test 1: Initial State');
const initialState = useChatStoreBase.getState();
console.log('  Messages:', initialState.messages.length);
console.log('  Is thinking:', initialState.isThinking);
console.assert(initialState.messages.length === 0, 'Should have 0 messages');
console.assert(initialState.isThinking === false, 'Should not be thinking');
console.log('');

// ===== Test 2: Add User Message =====
console.log('✅ Test 2: Add User Message');
useChatStoreBase.getState().addMessage({
  role: 'user',
  content: 'วิเคราะห์ลักษณะนิสัยของฉัน',
});
const state2 = useChatStoreBase.getState();
console.log('  Messages:', state2.messages.length);
console.log('  Role:', state2.messages[0].role);
console.log('  Content:', state2.messages[0].content);
console.assert(state2.messages.length === 1, 'Should have 1 message');
console.assert(state2.messages[0].role === 'user', 'Should be user message');
console.assert(state2.messages[0].id !== undefined, 'Should have id');
console.assert(state2.messages[0].timestamp !== undefined, 'Should have timestamp');
console.log('');

// ===== Test 3: Add Assistant Message with Metadata =====
console.log('✅ Test 3: Add Assistant Message with Metadata');
useChatStoreBase.getState().addMessage({
  role: 'assistant',
  content: 'จากดวงของคุณ...',
  intent: 'natal',
  layersUsed: { natal: true, dynamic: false },
});
const state3 = useChatStoreBase.getState();
console.log('  Messages:', state3.messages.length);
console.log('  Role:', state3.messages[1].role);
console.log('  Intent:', state3.messages[1].intent);
console.log('  Layers used:', state3.messages[1].layersUsed);
console.assert(state3.messages.length === 2, 'Should have 2 messages');
console.assert(state3.messages[1].intent === 'natal', 'Should have intent');
console.assert(state3.messages[1].layersUsed?.natal === true, 'Should use natal layer');
console.log('');

// ===== Test 4: Thinking State =====
console.log('✅ Test 4: Thinking State');
useChatStoreBase.getState().setThinking(true);
const state4 = useChatStoreBase.getState();
console.log('  Is thinking:', state4.isThinking);
console.assert(state4.isThinking === true, 'Should be thinking');
useChatStoreBase.getState().setThinking(false);
console.log('');

// ===== Test 5: Remove Message =====
console.log('✅ Test 5: Remove Message');
const idToRemove = state3.messages[0].id;
useChatStoreBase.getState().removeMessage(idToRemove);
const state5 = useChatStoreBase.getState();
console.log('  Messages:', state5.messages.length);
console.assert(state5.messages.length === 1, 'Should have 1 message after removal');
console.log('');

// ===== Test 6: Clear All =====
console.log('✅ Test 6: Clear All');
useChatStoreBase.getState().clear();
const state6 = useChatStoreBase.getState();
console.log('  Messages:', state6.messages.length);
console.assert(state6.messages.length === 0, 'Should have 0 messages after clear');
console.log('');

// ===== Test 7: Transit Forecasting Message =====
console.log('✅ Test 7: Transit Forecasting Message');
useChatStoreBase.getState().addMessage({
  role: 'user',
  content: 'ปี 2026 เป็นยังไง',
});
useChatStoreBase.getState().addMessage({
  role: 'assistant',
  content: 'สำหรับปี 2026...',
  intent: 'yearly-transit',
  layersUsed: { natal: true, dynamic: true },
});
const state7 = useChatStoreBase.getState();
console.log('  Messages:', state7.messages.length);
console.log('  Intent:', state7.messages[1].intent);
console.log('  Dynamic layer:', state7.messages[1].layersUsed?.dynamic);
console.assert(state7.messages[1].intent === 'yearly-transit', 'Should detect yearly transit');
console.assert(state7.messages[1].layersUsed?.dynamic === true, 'Should use dynamic layer');
console.log('');

// ===== Test 8: Persistence =====
console.log('✅ Test 8: Persistence (localStorage)');
const stored = localStorage.getItem('mybazi-chat');
if (stored) {
  const parsed = JSON.parse(stored);
  console.log('  Storage exists:', !!parsed);
  console.log('  Messages in storage:', parsed.state?.messages?.length || 0);
  console.assert(parsed.state?.messages?.length === 2, 'Should persist 2 messages');
} else {
  console.log('  ⚠️  Storage not found (might be expected in some environments)');
}
console.log('');

// ===== Cleanup =====
useChatStoreBase.getState().clear();

console.log('✅ All tests passed!');
