import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GenerateRequest {
  photoBase64: string;            // bride photo, raw base64 (no data: prefix)
  photoMimeType: string;          // 'image/jpeg' | 'image/png' | 'image/webp'
  referenceDressBase64?: string;  // optional reference dress photo
  referenceDressMimeType?: string;
  prompt: string;                 // full text from frontend's buildPrompt
}

interface GenerateResponse {
  imageBase64: string;
  mimeType: string;
  modelId: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY_NOT_CONFIGURED' });
  }
  const modelId = process.env.GEMINI_MODEL || 'gemini-3-pro-image-preview';

  let body: GenerateRequest;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'INVALID_JSON' });
  }

  if (!body.photoBase64 || !body.photoMimeType || !body.prompt) {
    return res.status(400).json({ error: 'MISSING_FIELDS' });
  }

  // Combined size guard ~ 12 MB base64
  const total =
    body.photoBase64.length + (body.referenceDressBase64?.length ?? 0);
  if (total > 12 * 1024 * 1024) {
    return res.status(413).json({ error: 'IMAGE_TOO_LARGE' });
  }

  const parts: Array<Record<string, unknown>> = [{ text: body.prompt }];
  parts.push({
    inline_data: { mime_type: body.photoMimeType, data: body.photoBase64 },
  });
  if (body.referenceDressBase64 && body.referenceDressMimeType) {
    parts.push({
      inline_data: {
        mime_type: body.referenceDressMimeType,
        data: body.referenceDressBase64,
      },
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(upstream.status).json({
        error: 'UPSTREAM_ERROR',
        detail: detail.slice(0, 2000),
      });
    }

    const json = await upstream.json() as { candidates?: unknown[] };
    const candidates = json.candidates ?? [];
    for (const c of candidates) {
      const outParts =
        (c as { content?: { parts?: unknown[] } }).content?.parts ?? [];
      for (const p of outParts) {
        const inline =
          (p as { inline_data?: { mime_type?: string; data?: string } }).inline_data ??
          (p as { inlineData?: { mimeType?: string; data?: string } }).inlineData;
        const mime =
          (inline as { mime_type?: string } | undefined)?.mime_type ??
          (inline as { mimeType?: string } | undefined)?.mimeType;
        if ((inline as { data?: string } | undefined)?.data && typeof mime === 'string' && mime.startsWith('image/')) {
          const response: GenerateResponse = {
            imageBase64: (inline as { data: string }).data,
            mimeType: mime,
            modelId,
          };
          return res.status(200).json(response);
        }
      }
    }

    return res.status(502).json({
      error: 'NO_IMAGE_IN_RESPONSE',
      detail: JSON.stringify(json).slice(0, 2000),
    });
  } catch (e) {
    return res.status(500).json({
      error: 'NETWORK_ERROR',
      detail: e instanceof Error ? e.message : String(e),
    });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
};
