/** OpenAI-shape chat message. */
interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string | ContentPart[];
}
type ContentPart = {
    type: 'text';
    text: string;
} | {
    type: 'image_url';
    image_url: {
        url: string;
    };
};
interface ChatOptions {
    /** g4f model id. Default 'gpt-4o-mini' (auto-router picks a live provider). */
    model?: string;
    /** Abort the request. */
    signal?: AbortSignal;
    /** Sampling temperature. */
    temperature?: number;
    /** Stream the response as an async-iterable of text chunks. */
    stream?: boolean;
}
interface RequestPayload {
    model: string;
    messages: Message[];
    temperature?: number;
    stream?: boolean;
}
/** Build the OpenAI-shape request body. Pure — no I/O. */
declare function buildPayload(messages: Message[], options?: ChatOptions): RequestPayload;
/** Build a vision message from a prompt + image data URL (or http url). Pure. */
declare function buildVisionMessages(prompt: string, imageDataUrl: string): Message[];
/** Extract assistant text from a non-stream g4f/OpenAI completion. Pure. */
declare function extractContent(res: unknown): string;
/** Extract a streamed delta text from a g4f/OpenAI chunk. Pure. '' if none. */
declare function extractDelta(chunk: unknown): string;
/** Extract an image URL from a g4f images.generate response. Pure. */
declare function extractImageUrl(res: unknown): string;
/** Normalize a model list entry to its id. Pure. '' if unusable. */
declare function modelId(m: unknown): string;

/** Thrown only after EVERY provider fails. Callers can catch + degrade. */
declare class OzAiError extends Error {
    readonly cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
/** Minimal structural type over a g4f.dev client (OpenAI-shape). */
interface G4FClient {
    chat: {
        completions: {
            create(params: RequestPayload): Promise<unknown> | AsyncGenerator<unknown, void, unknown> | Promise<AsyncGenerator<unknown, void, unknown>>;
        };
    };
    models?: {
        list(): Promise<unknown[]>;
    };
    images?: {
        generate(params: Record<string, unknown>): Promise<unknown>;
    };
}
/** A named provider entry in the failover chain. */
interface Provider {
    name: string;
    client: G4FClient;
}
/** Override the provider chain (tests / custom order). Pass null to reset. */
declare function setProviders(next: Provider[] | null): void;
/**
 * Chat completion from messages.
 * `stream:true` → returns an async-iterable of text chunks with failover.
 */
declare function chat(messages: Message[], options: ChatOptions & {
    stream: true;
}): Promise<AsyncIterable<string>>;
declare function chat(messages: Message[], options?: ChatOptions): Promise<string>;
/** One-shot completion from a prompt, with optional system prompt. */
declare function complete(prompt: string, options?: ChatOptions & {
    system?: string;
}): Promise<string>;
/** Vision: answer over an image (data URL or http url). */
declare function vision(prompt: string, imageDataUrl: string, options?: ChatOptions): Promise<string>;
/** Generate an image; returns its URL. Failover across providers. */
declare function image(prompt: string, options?: {
    model?: string;
    signal?: AbortSignal;
}): Promise<string>;
/**
 * All model ids across the provider chain (deduped). Empty on total failure.
 * Never throws.
 */
declare function listModels(signal?: AbortSignal): Promise<string[]>;

export { type ChatOptions, type ContentPart, type Message, OzAiError, type Provider, type RequestPayload, buildPayload, buildVisionMessages, chat, complete, extractContent, extractDelta, extractImageUrl, image, listModels, modelId, setProviders, vision };
