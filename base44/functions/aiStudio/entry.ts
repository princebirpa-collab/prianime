import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const SYSTEM = {
  base: `You are the PRI-ANIME story atelier â€” a senior anime and manhwa writer, world-builder and script editor.
Write with cinematic specificity: concrete images, emotional stakes, sound design notes, camera language.
Never plagiarise existing franchises, characters or studios; every name and world must be original.
Keep continuity across a response. Use clean Markdown with short headings and tight paragraphs.`,
  chat: `Answer as a recommendation concierge and creative partner. When recommending titles, give 3-5 real, existing anime with a one-line reason each, then one original idea the reader could pursue.`,
  story: `Produce an original story treatment. Structure: Logline, World, Cast (3-4 characters with wants and flaws), Three-Act Arc with episode beats, Visual Motif, Closing Image. Aim for 450-700 words.`,
  character: `Produce a character bible: Name, Age & role, Visual design (silhouette, palette, signature prop), Voice & speech rhythm, Want vs Need, Wound, Secret, Relationship web (3 links), Arc sentence.`,
  episode: `Produce an episode outline with a cold open, four numbered acts with timestamps, dialogue samples with speaker labels, and a cliffhanger. Note the emotional temperature of each beat.`,
  dialogue: `Produce a scene script: slugline, action lines in present tense, and dialogue with speaker labels. Add parenthetical direction sparingly. End on a turn of the scene.`,
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const mode = SYSTEM[body.mode] ? body.mode : 'chat';
    const language = String(body.language || 'en').slice(0, 5);
    const prompt = String(body.prompt || '').slice(0, 6000).trim();
    const style = String(body.style || '').slice(0, 120);

    const history = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    const historyText = history
      .filter((message) => message && message.content)
      .map((message) => `${message.role === 'assistant' ? 'ATELIER' : 'DIRECTOR'}: ${String(message.content).slice(0, 3000)}`)
      .join('\n\n');

    if (!prompt && !historyText) {
      return Response.json({ ok: false, error: 'Write a prompt first.' }, { status: 400 });
    }

    const languageName = { en: 'English', hi: 'Hindi (Devanagari)', ja: 'Japanese', es: 'Spanish' }[language] || 'English';

    const fullPrompt = `${SYSTEM.base}

TASK MODE: ${mode}
${SYSTEM[mode]}

RESPOND IN: ${languageName}
${style ? `VISUAL / TONE STYLE: ${style}` : ''}

${historyText ? `CONVERSATION SO FAR:\n${historyText}\n\n` : ''}DIRECTOR'S BRIEF:
${prompt || 'Continue the conversation with a useful next step.'}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt: fullPrompt });

    const text = typeof result === 'string' ? result : result?.response || '';
    if (!text) {
      return Response.json({ ok: false, error: 'The AI returned an empty response. Try again.' }, { status: 502 });
    }
    return Response.json({ ok: true, text, mode, language });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || 'The AI studio is unavailable right now.' },
      { status: 502 }
    );
  }
}
