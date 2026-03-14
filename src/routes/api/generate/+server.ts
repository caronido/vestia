import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createImageTask } from '$lib/runway';

const PROMPTS: Record<string, string> = {
	casual:
		'A complete casual outfit laid out flat on a clean white surface featuring @ref1 as the centerpiece. Styled with complementary pieces for a relaxed daytime look. Fashion editorial photography, soft natural lighting, minimal background.',
	'date-night':
		'A complete evening outfit styled around @ref1. Elegant complementary pieces for a dinner date. Fashion editorial flat lay, warm moody lighting, sophisticated composition.',
	work:
		'A polished professional outfit built around @ref1. Clean, modern workwear styling. Fashion editorial flat lay, bright even lighting, minimal clean background.',
	'street-style':
		'A bold street style outfit featuring @ref1 as the key piece. Urban, fashion-forward complementary items. Fashion editorial flat lay, high contrast, editorial composition.',
	maternity:
		'A stylish maternity-friendly outfit incorporating @ref1. Comfortable yet fashionable complementary pieces with relaxed silhouettes. Fashion editorial flat lay, soft warm lighting, inviting composition.'
};

const OCCASION_SUFFIX: Record<string, string> = {
	'sf-day-out': ' Perfect for a day out in San Francisco.',
	dinner: ' Styled for a dinner occasion.',
	meeting: ' Appropriate for a professional meeting.',
	'weekend-brunch': ' Perfect for a relaxed weekend brunch.'
};

export const POST: RequestHandler = async ({ request }) => {
	const { imageDataUri, vibe, occasion } = await request.json();

	if (!imageDataUri || !vibe) {
		return json({ error: 'Faltan la imagen o el estilo.' }, { status: 400 });
	}

	const basePrompt = PROMPTS[vibe];
	if (!basePrompt) {
		return json({ error: 'Estilo no válido.' }, { status: 400 });
	}

	const prompt = basePrompt + (occasion ? OCCASION_SUFFIX[occasion] || '' : '');

	// Generate 3 outfits sequentially (Runway concurrency limits)
	const taskIds: string[] = [];

	for (let i = 0; i < 3; i++) {
		try {
			const taskId = await createImageTask({
				promptText: prompt,
				referenceImageUri: imageDataUri,
				ratio: '1080:1080',
				seed: Math.floor(Math.random() * 1_000_000)
			});
			taskIds.push(taskId);
		} catch (e) {
			const msg = (e as Error).message;
			if (msg === 'RATE_LIMITED' && taskIds.length > 0) {
				break; // Return whatever we managed to queue
			}
			return json({ error: `Error al crear la tarea: ${msg}` }, { status: 500 });
		}
	}

	return json({ taskIds });
};
