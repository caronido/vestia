import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createImageTask } from '$lib/runway';

const FLAT_LAY_PROMPTS: Record<string, string> = {
	casual:
		'A complete head-to-toe casual outfit flat lay featuring @garment as the hero piece. Include all items needed for a full look: top, bottom, shoes, handbag or clutch, and jewelry or accessories. Every piece visible and styled together. High-end fashion editorial flat lay, soft diffused lighting, clean white backdrop, Vogue-level styling.',
	'date-night':
		'A complete head-to-toe evening outfit flat lay built around @garment. Include all items for the full look: clothing, heels or statement shoes, evening bag or clutch, and jewelry — earrings, bracelet, or necklace. Every piece visible. Fashion editorial flat lay, dramatic warm lighting, moody editorial composition.',
	work:
		'A complete head-to-toe professional outfit flat lay anchored by @garment. Include all items for the full look: clothing, polished shoes, structured bag or tote, watch, and minimal jewelry. Every piece visible. Fashion editorial flat lay, crisp bright lighting, minimal sophisticated backdrop.',
	'street-style':
		'A complete head-to-toe street style outfit flat lay with @garment as the standout piece. Include all items for the full look: layered clothing, sneakers or boots, crossbody bag or backpack, sunglasses, and accessories. Every piece visible. Fashion editorial flat lay, high-contrast lighting, raw editorial energy.',
	maternity:
		'A complete head-to-toe maternity-friendly outfit flat lay styled around @garment. Include all items for the full look: comfortable clothing, stylish flats or low heels, roomy bag, and delicate jewelry. Every piece visible. Fashion editorial flat lay, soft golden lighting, warm inviting composition.'
};

const ON_BODY_PROMPTS: Record<string, string> = {
	casual:
		'A stylish person @person wearing a complete head-to-toe casual outfit featuring @garment as the hero piece. Full outfit visible including shoes, bag, and accessories like jewelry or sunglasses. Full-body fashion editorial photo showing the entire look from head to toe, natural daylight, clean minimal background, shot on 85mm lens.',
	'date-night':
		'A stylish person @person wearing a complete head-to-toe evening outfit built around @garment. Full outfit visible including heels, evening clutch, and statement jewelry. Full-body fashion editorial photo showing the entire look from head to toe, warm moody lighting, sophisticated setting, cinematic composition.',
	work:
		'A stylish person @person wearing a complete head-to-toe professional outfit anchored by @garment. Full outfit visible including polished shoes, structured bag, and refined accessories. Full-body fashion editorial photo showing the entire look from head to toe, bright even studio lighting, clean professional backdrop.',
	'street-style':
		'A stylish person @person wearing a complete head-to-toe street style outfit with @garment as the standout piece. Full outfit visible including sneakers or boots, bag, sunglasses, and accessories. Full-body fashion editorial street photo showing the entire look from head to toe, urban backdrop, high-contrast natural light.',
	maternity:
		'A stylish person @person wearing a complete head-to-toe maternity-friendly outfit styled around @garment. Full outfit visible including comfortable shoes, bag, and delicate jewelry. Full-body fashion editorial photo showing the entire look from head to toe, soft golden light, warm inviting setting.'
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
				ratio: '1024:1024',
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
