// SSE streaming parser test for streamChatCompletion.
// Mocks fetch with a ReadableStream of SSE chunks (including a data line split
// across two chunks) and asserts token deltas accumulate correctly + [DONE]
// terminates + a server-reported stream error throws.
// Run: pnpm stream:test
import { streamChatCompletion } from "../src/lib/ai/client.ts";

const settings = {
  enabled: true,
  endpoint: "https://mock/v1/chat/completions",
  apiKey: "test-key",
  model: "mock-model",
  temperature: 0.7,
};

function mockStream(parts, { ok = true, status = 200 } = {}) {
  const encoder = new TextEncoder();
  globalThis.fetch = async () => ({
    ok,
    status,
    body: new ReadableStream({
      start(controller) {
        for (const p of parts) controller.enqueue(encoder.encode(p));
        controller.close();
      },
    }),
    async text() {
      return "";
    },
  });
}

let pass = true;
function check(name, cond) {
  console.log(`  ${cond ? "✓" : "✗"} ${name}`);
  if (!cond) pass = false;
}

// --- Case 1: happy path with a data line split across two chunks ---
{
  mockStream([
    `data: {"choices":[{"delta":{"content":"สวัสดี"}}]}\n\n`,
    `data: {"choices":[{"delta":{"content":"ครับ"}}]}\n\n`,
    // split the third data line mid-key across two chunks
    `data: {"choices":[{"delta":{"co`,
    `ntent":"!"}}]}\n\n`,
    `data: [DONE]\n\n`,
  ]);
  const deltas = [];
  const full = await streamChatCompletion(
    { messages: [], settings },
    { onDelta: (d) => deltas.push(d) }
  );
  console.log("Case 1 — happy path + chunk split:");
  check("full accumulated correctly", full === "สวัสดีครับ!");
  check("3 onDelta calls", deltas.length === 3);
  check("deltas join matches", deltas.join("") === "สวัสดีครับ!");
}

// --- Case 2: server-reported stream error must throw ---
{
  mockStream([
    `data: {"choices":[{"delta":{"content":"partial"}}]}\n\n`,
    `data: {"error":{"message":"upstream boom"}}\n\n`,
  ]);
  let threw = false;
  let errMsg = "";
  try {
    await streamChatCompletion(
      { messages: [], settings },
      { onDelta: () => {} }
    );
  } catch (e) {
    threw = true;
    errMsg = e instanceof Error ? e.message : String(e);
  }
  console.log("Case 2 — stream error throws:");
  check("threw on server error", threw);
  check("error message propagated", /upstream boom/i.test(errMsg));
}

// --- Case 3: HTTP non-ok must throw before streaming ---
{
  mockStream([], { ok: false, status: 401 });
  let threw = false;
  try {
    await streamChatCompletion(
      { messages: [], settings },
      { onDelta: () => {} }
    );
  } catch {
    threw = true;
  }
  console.log("Case 3 — HTTP 401 throws:");
  check("threw on non-ok response", threw);
}

console.log(pass ? "\nPASS" : "\nFAIL");
process.exit(pass ? 0 : 1);
