/**
 * Unit tests for AI client (no real network calls)
 * Mocks fetch to test parsing and error handling
 */

// Mock fetch globally
global.fetch = async (url, options) => {
  const body = JSON.parse(options.body);

  // Test 1: Successful response
  if (body.messages[0].content === 'test success') {
    return {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'Hello! This is a test response.',
              role: 'assistant',
            },
          },
        ],
      }),
    };
  }

  // Test 2: API error response
  if (body.messages[0].content === 'test api error') {
    return {
      ok: false,
      status: 401,
      text: async () => 'Unauthorized: Invalid API key',
    };
  }

  // Test 3: Empty choices
  if (body.messages[0].content === 'test empty choices') {
    return {
      ok: true,
      json: async () => ({
        choices: [],
      }),
    };
  }

  // Test 4: Missing content
  if (body.messages[0].content === 'test missing content') {
    return {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              role: 'assistant',
            },
          },
        ],
      }),
    };
  }

  // Default: success
  return {
    ok: true,
    json: async () => ({
      choices: [
        {
          message: {
            content: 'Default response',
            role: 'assistant',
          },
        },
      ],
    }),
  };
};

// Import after mocking fetch
import { chatCompletion } from '../src/lib/ai/client.js';
import { testAiConnection } from '../src/lib/ai/test-connection.js';
import { DEFAULT_AI_SETTINGS } from '../src/types/ai-settings.js';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('Running AI client tests...\n');

  // Test 1: Successful chat completion
  try {
    const settings = {
      ...DEFAULT_AI_SETTINGS,
      enabled: true,
      endpoint: 'https://api.test.com/v1/chat/completions',
      apiKey: 'test-key',
      model: 'test-model',
      temperature: 0.7,
    };

    const result = await chatCompletion({
      messages: [{ role: 'user', content: 'test success' }],
      settings,
    });

    assert(result === 'Hello! This is a test response.', 'Should parse response correctly');
  } catch (error) {
    assert(false, `Test 1 failed: ${error.message}`);
  }

  // Test 2: API error handling
  try {
    const settings = {
      ...DEFAULT_AI_SETTINGS,
      enabled: true,
      endpoint: 'https://api.test.com/v1/chat/completions',
      apiKey: 'test-key',
      model: 'test-model',
      temperature: 0.7,
    };

    await chatCompletion({
      messages: [{ role: 'user', content: 'test api error' }],
      settings,
    });

    assert(false, 'Should throw error for API error');
  } catch (error) {
    assert(
      error.message.includes('401') || error.message.includes('Unauthorized'),
      'Should handle API error response'
    );
  }

  // Test 3: Empty choices error
  try {
    const settings = {
      ...DEFAULT_AI_SETTINGS,
      enabled: true,
      endpoint: 'https://api.test.com/v1/chat/completions',
      apiKey: 'test-key',
      model: 'test-model',
      temperature: 0.7,
    };

    await chatCompletion({
      messages: [{ role: 'user', content: 'test empty choices' }],
      settings,
    });

    assert(false, 'Should throw error for empty choices');
  } catch (error) {
    assert(error.message.includes('no choices'), 'Should handle empty choices');
  }

  // Test 4: Missing content error
  try {
    const settings = {
      ...DEFAULT_AI_SETTINGS,
      enabled: true,
      endpoint: 'https://api.test.com/v1/chat/completions',
      apiKey: 'test-key',
      model: 'test-model',
      temperature: 0.7,
    };

    await chatCompletion({
      messages: [{ role: 'user', content: 'test missing content' }],
      settings,
    });

    assert(false, 'Should throw error for missing content');
  } catch (error) {
    assert(error.message.includes('missing message content'), 'Should handle missing content');
  }

  // Test 5: Disabled AI
  try {
    const settings = {
      ...DEFAULT_AI_SETTINGS,
      enabled: false,
      endpoint: 'https://api.test.com/v1/chat/completions',
      apiKey: 'test-key',
      model: 'test-model',
      temperature: 0.7,
    };

    await chatCompletion({
      messages: [{ role: 'user', content: 'test' }],
      settings,
    });

    assert(false, 'Should throw error when AI is disabled');
  } catch (error) {
    assert(error.message.includes('disabled'), 'Should check if AI is enabled');
  }

  // Test 6: Missing endpoint
  try {
    const settings = {
      ...DEFAULT_AI_SETTINGS,
      enabled: true,
      endpoint: '',
      apiKey: 'test-key',
      model: 'test-model',
      temperature: 0.7,
    };

    await chatCompletion({
      messages: [{ role: 'user', content: 'test' }],
      settings,
    });

    assert(false, 'Should throw error for missing endpoint');
  } catch (error) {
    assert(error.message.includes('endpoint'), 'Should validate endpoint');
  }

  // Test 7: Missing API key
  try {
    const settings = {
      ...DEFAULT_AI_SETTINGS,
      enabled: true,
      endpoint: 'https://api.test.com/v1/chat/completions',
      apiKey: '',
      model: 'test-model',
      temperature: 0.7,
    };

    await chatCompletion({
      messages: [{ role: 'user', content: 'test' }],
      settings,
    });

    assert(false, 'Should throw error for missing API key');
  } catch (error) {
    assert(error.message.includes('API key'), 'Should validate API key');
  }

  // Test 8: Missing model
  try {
    const settings = {
      ...DEFAULT_AI_SETTINGS,
      enabled: true,
      endpoint: 'https://api.test.com/v1/chat/completions',
      apiKey: 'test-key',
      model: '',
      temperature: 0.7,
    };

    await chatCompletion({
      messages: [{ role: 'user', content: 'test' }],
      settings,
    });

    assert(false, 'Should throw error for missing model');
  } catch (error) {
    assert(error.message.includes('Model'), 'Should validate model name');
  }

  // Test 9: testAiConnection success
  try {
    const settings = {
      ...DEFAULT_AI_SETTINGS,
      enabled: true,
      endpoint: 'https://api.test.com/v1/chat/completions',
      apiKey: 'test-key',
      model: 'test-model',
      temperature: 0.7,
    };

    const result = await testAiConnection(settings);
    assert(result.ok === true && result.message === 'เชื่อมต่อสำเร็จ', 'Should test connection successfully');
  } catch (error) {
    assert(false, `Test 9 failed: ${error.message}`);
  }

  // Test 10: testAiConnection API error
  try {
    const settings = {
      ...DEFAULT_AI_SETTINGS,
      enabled: true,
      endpoint: 'https://api.test.com/v1/chat/completions',
      apiKey: 'invalid-key',
      model: 'test-model',
      temperature: 0.7,
    };

    // Override fetch for this test
    const originalFetch = global.fetch;
    global.fetch = async () => ({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    const result = await testAiConnection(settings);
    assert(result.ok === false && result.message.includes('ล้มเหลว'), 'Should handle connection failure');

    global.fetch = originalFetch;
  } catch (error) {
    assert(false, `Test 10 failed: ${error.message}`);
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Tests passed: ${testsPassed}`);
  console.log(`Tests failed: ${testsFailed}`);
  console.log(`${'='.repeat(50)}`);

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
