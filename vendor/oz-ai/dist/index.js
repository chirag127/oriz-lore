// src/payload.ts
function buildPayload(messages, options = {}) {
  const payload = {
    model: options.model ?? "gpt-4o-mini",
    messages
  };
  if (options.temperature !== void 0)
    payload.temperature = options.temperature;
  if (options.stream) payload.stream = true;
  return payload;
}
function buildVisionMessages(prompt, imageDataUrl) {
  return [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageDataUrl } }
      ]
    }
  ];
}
function extractContent(res) {
  const content = res?.choices?.[0]?.message?.content;
  if (typeof content !== "string")
    throw new Error("malformed response: no choices[0].message.content");
  return content;
}
function extractDelta(chunk) {
  const delta = chunk?.choices?.[0]?.delta?.content;
  return typeof delta === "string" ? delta : "";
}
function extractImageUrl(res) {
  const url = res?.data?.[0]?.url;
  if (typeof url !== "string")
    throw new Error("malformed response: no data[0].url");
  return url;
}
function modelId(m) {
  if (typeof m === "string") return m;
  const id = m?.id;
  if (typeof id === "string") return id;
  const name = m?.name;
  return typeof name === "string" ? name : "";
}

// src/index.ts
var OzAiError = class extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = "OzAiError";
  }
};
var MAX_RETRIES = 2;
var chain = null;
async function providers() {
  if (chain) return chain;
  const spec = "@gpt4free/g4f.dev";
  const g4f = await import(
    /* @vite-ignore */
    spec
  );
  const Client = g4f.Client ?? g4f.default;
  const built = [];
  if (Client) built.push({ name: "default", client: new Client() });
  if (g4f.DeepInfra)
    built.push({ name: "DeepInfra", client: new g4f.DeepInfra() });
  if (g4f.Puter) built.push({ name: "Puter", client: new g4f.Puter() });
  if (built.length === 0)
    throw new OzAiError("@gpt4free/g4f.dev exported no usable client");
  chain = built;
  return built;
}
function setProviders(next) {
  chain = next;
}
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
var isAsyncIterable = (x) => x != null && typeof x[Symbol.asyncIterator] === "function";
async function withFailover(fn, signal) {
  const list = await providers();
  let last;
  for (const p of list) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (signal?.aborted) throw new OzAiError("aborted");
      if (attempt > 0) await sleep(2 ** attempt * 300);
      try {
        return await fn(p);
      } catch (e) {
        if (signal?.aborted) throw new OzAiError("aborted");
        last = e;
      }
    }
  }
  throw new OzAiError("all providers failed", last);
}
async function completion(payload, signal) {
  return withFailover(
    async (p) => extractContent(await p.client.chat.completions.create(payload)),
    signal
  );
}
function chat(messages, options = {}) {
  if (options.stream)
    return streamChat(buildPayload(messages, options), options.signal);
  return completion(buildPayload(messages, options), options.signal);
}
async function complete(prompt, options = {}) {
  const messages = [];
  if (options.system) messages.push({ role: "system", content: options.system });
  messages.push({ role: "user", content: prompt });
  return completion(buildPayload(messages, options), options.signal);
}
async function vision(prompt, imageDataUrl, options = {}) {
  return completion(
    buildPayload(buildVisionMessages(prompt, imageDataUrl), options),
    options.signal
  );
}
async function streamChat(payload, signal) {
  return withFailover(async (p) => {
    const res = await p.client.chat.completions.create({
      ...payload,
      stream: true
    });
    if (!isAsyncIterable(res))
      throw new OzAiError(`provider ${p.name} did not stream`);
    return (async function* () {
      for await (const chunk of res) {
        if (signal?.aborted) throw new OzAiError("aborted");
        const delta = extractDelta(chunk);
        if (delta) yield delta;
      }
    })();
  }, signal);
}
async function image(prompt, options = {}) {
  return withFailover(async (p) => {
    if (!p.client.images)
      throw new OzAiError(`provider ${p.name} has no images`);
    return extractImageUrl(
      await p.client.images.generate({
        model: options.model ?? "flux",
        prompt
      })
    );
  }, options.signal);
}
async function listModels(signal) {
  let list;
  try {
    list = await providers();
  } catch {
    return [];
  }
  const ids = /* @__PURE__ */ new Set();
  for (const p of list) {
    if (signal?.aborted) break;
    try {
      const models = await p.client.models?.list() ?? [];
      for (const m of models) {
        const id = modelId(m);
        if (id) ids.add(id);
      }
    } catch {
    }
  }
  return [...ids];
}
export {
  OzAiError,
  buildPayload,
  buildVisionMessages,
  chat,
  complete,
  extractContent,
  extractDelta,
  extractImageUrl,
  image,
  listModels,
  modelId,
  setProviders,
  vision
};
