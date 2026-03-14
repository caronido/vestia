import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createImageTask } from '$lib/runway';

const FLAT_LAY_PROMPTS: Record<string, string> = {
	casual:
		'An effortlessly chic casual outfit featuring @ref1 as the hero piece. Styled with on-trend complementary items for an elevated everyday look. High-end fashion editorial flat lay, soft diffused lighting, clean white backdrop, Vogue-level styling.',
	'date-night':
		'A head-turning evening outfit built around @ref1. Luxe complementary pieces for a night out — think sleek, sultry, and statement-making. Fashion editorial flat lay, dramatic warm lighting, moody editorial composition.',
	work:
		'A power-dressing outfit anchored by @ref1. Sharp, modern, and polished — boardroom-ready with editorial flair. Fashion editorial flat lay, crisp bright lighting, minimal sophisticated backdrop.',
	'street-style':
		'An edgy street style outfit with @ref1 as the standout piece. Bold, fashion-forward layering with unexpected pairings. Fashion editorial flat lay, high-contrast lighting, raw editorial energy.',
	maternity:
		'A chic maternity-friendly outfit styled around @ref1. Effortlessly fashionable with relaxed silhouettes that flatter. Fashion editorial flat lay, soft golden lighting, warm inviting composition.'
};

const ON_BODY_PROMPTS: Record<string, string> = {
	casual:
		'A stylish person @ref2 wearing an effortlessly chic casual outfit featuring @ref1 as the hero piece. Complementary on-trend pieces for an elevated everyday look. Full-body fashion editorial photo, natural daylight, clean minimal background, shot on 85mm lens.',
	'date-night':
		'A stylish person @ref2 wearing a head-turning evening outfit built around @ref1. Luxe complementary pieces, sleek and sultry. Full-body fashion editorial photo, warm moody lighting, sophisticated setting, cinematic composition.',
	work:
		'A stylish person @ref2 wearing a power-dressing outfit anchored by @ref1. Sharp, modern, and polished workwear. Full-body fashion editorial photo, bright even studio lighting, clean professional backdrop.',
	'street-style':
		'A stylish person @ref2 wearing an edgy street style outfit with @ref1 as the standout piece. Bold layering, fashion-forward pairings. Full-body fashion editorial street photo, urban backdrop, high-contrast natural light.',
	maternity:
		'A stylish person @ref2 wearing a chic maternity-friendly outfit styled around @ref1. Effortlessly fashionable, relaxed flattering silhouettes. Full-body fashion editorial photo, soft golden light, warm inviting setting.'
};

const OCCASION_SUFFIX: Record<string, string> = {
	'sf-day-out': ' Perfect for a day out in San Francisco.',
	dinner: ' Styled for a dinner occasion.',
	meeting: ' Appropriate for a professional meeting.',
	'weekend-brunch': ' Perfect for a relaxed weekend brunch.'
};

export const POST: RequestHandler = async ({ request }) => {
	const { imageDataUri, selfieDataUri, vibe, occasion } = await request.json();

	if (!imageDataUri || !vibe) {
		return json({ error: 'Image and style are required.' }, { status: 400 });
	}

	const prompts = selfieDataUri ? ON_BODY_PROMPTS : FLAT_LAY_PROMPTS;
	const basePrompt = prompts[vibe];
	if (!basePrompt) {
		return json({ error: 'Invalid style.' }, { status: 400 });
	}

	const prompt = basePrompt + (occasion ? OCCASION_SUFFIX[occasion] || '' : '');

	// Generate 3 looks sequentially (Runway concurrency limits)
	const taskIds: string[] = [];

	for (let i = 0; i < 3; i++) {
		try {
			const taskId = await createImageTask({
				promptText: prompt,
				referenceImageUri: imageDataUri,
				selfieImageUri: selfieDataUri || undefined,
				ratio: '1080:1080',
				seed: Math.floor(Math.random() * 1_000_000)
			});
			taskIds.push(taskId);
		} catch (e) {
			const msg = (e as Error).message;
			if (msg === 'RATE_LIMITED' && taskIds.length > 0) {
				break; // Return whatever we managed to queue
			}
			return json({ error: `Failed to create task: ${msg}` }, { status: 500 });
		}
	}

	return json({ taskIds });
};
