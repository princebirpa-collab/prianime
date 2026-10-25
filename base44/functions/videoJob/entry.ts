import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const STYLE_PROMPT = {
  cinematic: 'cinematic anime film still, volumetric light, shallow depth of field, film grain',
  manhwa: 'korean manhwa illustration style, bold linework, dramatic cel shading',
  painterly: 'painterly fantasy concept art, visible brushwork, mythic atmosphere',
  cel: '90s cel animation aesthetic, soft paper texture, hand-painted backgrounds',
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const prompt = String(body.prompt || '').slice(0, 1500).trim();
    if (prompt.length < 12) {
      return Response.json({ ok: false, error: 'Describe the shot in at least a sentence.' }, { status: 400 });
    }

    const aspect = body.aspect_ratio === '9:16' ? '9:16' : '16:9';
    const styleKey = STYLE_PROMPT[body.style] ? body.style : 'cinematic';
    const ownerRef = String(body.owner_ref || 'anonymous').slice(0, 80);

    const job = await base44.asServiceRole.entities.VideoJob.create({
      owner_ref: ownerRef,
      prompt,
      language: String(body.language || 'en').slice(0, 5),
      style: styleKey,
      aspect_ratio: aspect,
      voice: String(body.voice || 'none').slice(0, 20),
      provider: 'base44:generate_video',
      status: 'processing',
      duration: 6,
    });

    const fullPrompt = `${STYLE_PROMPT[styleKey]}. ${prompt}. Original characters and world only, no existing franchise. No on-screen text, no watermark, no user interface. Vertical short-form composition.`;

    try {
      const result = await base44.asServiceRole.integrations.Core.GenerateVideo({
        prompt: fullPrompt,
        duration: 6,
        aspect_ratio: aspect,
        generate_audio: false,
      });

      const url = typeof result === 'string' ? result : result?.url || '';
      if (!url) throw new Error('The generator returned no video URL.');

      const updated = await base44.asServiceRole.entities.VideoJob.update(job.id, {
        status: 'completed',
        video_url: url,
        error: '',
      });
      return Response.json({ ok: true, job: updated });
    } catch (generationError) {
      const message = String(generationError.message || 'Video generation failed.').slice(0, 400);
      const failed = await base44.asServiceRole.entities.VideoJob.update(job.id, {
        status: 'failed',
        error: message,
      });
      return Response.json({ ok: false, error: message, job: failed, code: 'generator_unavailable' });
    }
  } catch (error) {
    return Response.json({ ok: false, error: error.message || 'Could not start the render job.' }, { status: 500 });
  }
}

================================================================================
