import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createImageTask } from '$lib/runway';

// Each look gets a different styling direction for inspiration
const LOOK_VARIATIONS = [
	{
		label: 'Elevated',
		flatLayStyle:
			'Styled in an elevated, polished way — luxe fabrics, refined silhouettes, sophisticated color palette.',
		onBodyStyle:
			'Styled in an elevated, polished way — luxe fabrics, refined silhouettes, sophisticated and put-together.',
		photoMood: 'soft studio lighting, clean minimal backdrop, editorial elegance'
	},
	{
		label: 'Bold',
		flatLayStyle:
			'Styled with bold, fashion-forward energy — unexpected color pairings, statement accessories, editorial edge.',
		onBodyStyle:
			'Styled with bold, fashion-forward energy — unexpected pairings, statement accessories, confident and editorial.',
		photoMood: 'high-contrast dramatic lighting, moody editorial composition'
	},
	{
		label: 'Effortless',
		flatLayStyle:
			'Styled with effortless, undone cool — relaxed layering, textural mix, "thrown-on but perfect" energy.',
		onBodyStyle:
			'Styled with effortless, undone cool — relaxed layering, natural movement, "thrown-on but perfect" energy.',
		photoMood: 'warm natural daylight, organic and lived-in feel'
	}
];

const OCCASION_CONTEXT: Record<string, string> = {
	casual: 'for a casual everyday setting',
	'date-night': 'for an evening out or date night',
	work: 'for a professional work environment',
	'street-style': 'with street-style attitude',
	maternity: 'that is maternity-friendly with comfortable, flattering silhouettes'
};

const OCCASION_SUFFIX: Record<string, string> = {
	'sf-day-out': ' Perfect for a day out in San Francisco.',
	dinner: ' Styled for a dinner occasion.',
	meeting: ' Appropriate for a professional meeting.',
	'weekend-brunch': ' Perfect for a relaxed weekend brunch.'
};

function buildFlatLayPrompt(variation: typeof LOOK_VARIATIONS[number], vibe: string, occasion?: string): string {
	const context = OCCASION_CONTEXT[vibe] || '';
	const suffix = occasion ? OCCASION_SUFFIX[occasion] || '' : '';

	return `A complete head-to-toe outfit flat lay featuring @garment as the hero piece ${context}. ${variation.flatLayStyle} Include all items for a full look: complementary clothing, shoes, bag, and jewelry or accessories. Every piece visible and styled together. High-end fashion editorial flat lay, ${variation.photoMood}, Vogue-level styling.${suffix}`;
}

function buildOnBodyPrompt(variation: typeof LOOK_VARIATIONS[number], vibe: string, occasion?: string): string {
	const context = OCCASION_CONTEXT[vibe] || '';
	const suffix = occasion ? OCCASION_SUFFIX[occasion] || '' : '';

	return `A stylish person @person wearing a complete head-to-toe outfit featuring @garment as the hero piece ${context}. ${variation.onBodyStyle} Full outfit visible including shoes, bag, and accessories. Full-body fashion editorial photo showing the entire look from head to toe, ${variation.photoMood}, shot on 85mm lens.${suffix}`;
}

export const POST: RequestHandler = async ({ request }) => {
	const { imageDataUri, selfieDataUri, vibe, occasion } = await request.json();

	if (!imageDataUri || !vibe) {
		return json({ error: 'Image and style are required.' }, { status: 400 });
	}

	if (!OCCASION_CONTEXT[vibe]) {
		return json({ error: 'Invalid style.' }, { status: 400 });
	}

	const taskIds: string[] = [];

	for (let i = 0; i < 3; i++) {
		const variation = LOOK_VARIATIONS[i];
		const prompt = selfieDataUri
			? buildOnBodyPrompt(variation, vibe, occasion)
			: buildFlatLayPrompt(variation, vibe, occasion);

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
				break;
			}
			return json({ error: `Failed to create task: ${msg}` }, { status: 500 });
		}
	}

	const labels = LOOK_VARIATIONS.slice(0, taskIds.length).map((v) => v.label);
	return json({ taskIds, labels });
};
