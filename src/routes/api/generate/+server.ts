import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createImageTask } from '$lib/runway';

// Fashion-forward baseline that every prompt gets
const TREND_BASELINE =
	'Current-season styling with modern proportions and intentional silhouettes. Avoid anything dated, basic, or generic — every piece should feel curated and trend-aware.';

// Each look gets a different styling direction for inspiration
const LOOK_VARIATIONS = [
	{
		label: 'Elevated',
		flatLayStyle:
			'Styled in an elevated, editorial way — luxe fabrics, considered proportions, tonal or complementary color story. Think Vogue editorial, not catalog.',
		onBodyStyle:
			'Styled in an elevated, editorial way — luxe fabrics, considered proportions, tonal or complementary palette. Looks like it belongs in a fashion editorial, not a catalog.',
		photoMood: 'soft studio lighting, clean minimal backdrop, editorial elegance'
	},
	{
		label: 'Bold',
		flatLayStyle:
			'Styled with bold, fashion-forward energy — unexpected color clashes, statement accessories, avant-garde pairings. Fearless and directional.',
		onBodyStyle:
			'Styled with bold, fashion-forward energy — unexpected pairings, statement accessories, confident stance. Fearless and directional.',
		photoMood: 'high-contrast dramatic lighting, moody editorial composition'
	},
	{
		label: 'Effortless',
		flatLayStyle:
			'Styled with effortless, undone cool — relaxed layering, rich textures, "thrown-on but perfect" nonchalance. Off-duty model energy.',
		onBodyStyle:
			'Styled with effortless, undone cool — relaxed layering, natural movement, "thrown-on but perfect" nonchalance. Off-duty model energy.',
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

// Trend aesthetic descriptions that inject specific styling DNA
const AESTHETIC_PROMPTS: Record<string, string> = {
	'quiet-luxury':
		'Quiet luxury aesthetic — understated elegance, neutral tones, premium fabrics like cashmere and silk, no visible logos, The Row and Loro Piana energy.',
	'old-money':
		'Old money aesthetic — preppy refinement, heritage fabrics, tailored blazers, loafers, pearls, Ralph Lauren and Brunello Cucinelli sensibility.',
	'clean-girl':
		'Clean girl aesthetic — minimal, fresh, dewy energy, neutral palette, gold jewelry, slicked-back hair vibes, Hailey Bieber-inspired simplicity.',
	'mob-wife':
		'Mob wife aesthetic — bold glamour, fur (faux), leopard print, oversized gold jewelry, red lips energy, Dolce & Gabbana maximalism.',
	'coastal-grandmother':
		'Coastal grandmother aesthetic — breezy linen, soft whites and blues, straw accessories, Nancy Meyers movie wardrobe elegance.',
	'scandi-minimal':
		'Scandi minimal aesthetic — architectural silhouettes, muted earth tones, functional luxury, COS and Totême design language.',
	'downtown-cool':
		'Downtown cool aesthetic — edgy layering, leather accents, chunky boots, vintage-inspired pieces, Lower East Side creative energy.',
	coquette:
		'Coquette aesthetic — feminine bows, soft pastels, delicate lace, ballet flats, ribbon details, romantic and playful femininity.'
};

interface AccessoryInput {
	id: string;
	label: string;
	imageDataUri: string;
}

function buildAccessoryClause(accessories: AccessoryInput[]): string {
	if (accessories.length === 0) return '';

	const tags = accessories.map((a) => `@${a.id} (${a.label.toLowerCase()})`);
	const list = tags.join(', ');
	return ` Incorporate the following owned accessories into the look: ${list}. Only generate the remaining items needed to complete the outfit — do not replace the provided accessories.`;
}

function buildFlatLayPrompt(
	variation: (typeof LOOK_VARIATIONS)[number],
	vibe: string,
	accessories: AccessoryInput[],
	occasion?: string,
	aesthetic?: string
): string {
	const context = OCCASION_CONTEXT[vibe] || '';
	const suffix = occasion ? OCCASION_SUFFIX[occasion] || '' : '';
	const accClause = buildAccessoryClause(accessories);
	const aestheticClause = aesthetic && AESTHETIC_PROMPTS[aesthetic] ? ` ${AESTHETIC_PROMPTS[aesthetic]}` : '';

	return `A complete head-to-toe outfit flat lay featuring @garment as the hero piece ${context}. ${TREND_BASELINE} ${variation.flatLayStyle}${aestheticClause}${accClause} Include all items for a full look: complementary clothing, shoes, bag, and jewelry or accessories. Every piece visible and styled together. High-end fashion editorial flat lay, ${variation.photoMood}, Vogue-level styling.${suffix}`;
}

function buildOnBodyPrompt(
	variation: (typeof LOOK_VARIATIONS)[number],
	vibe: string,
	accessories: AccessoryInput[],
	occasion?: string,
	aesthetic?: string
): string {
	const context = OCCASION_CONTEXT[vibe] || '';
	const suffix = occasion ? OCCASION_SUFFIX[occasion] || '' : '';
	const accClause = buildAccessoryClause(accessories);
	const aestheticClause = aesthetic && AESTHETIC_PROMPTS[aesthetic] ? ` ${AESTHETIC_PROMPTS[aesthetic]}` : '';

	return `A stylish person @person wearing a complete head-to-toe outfit featuring @garment as the hero piece ${context}. ${TREND_BASELINE} ${variation.onBodyStyle}${aestheticClause}${accClause} Full outfit visible including shoes, bag, and accessories. Full-body fashion editorial photo showing the entire look from head to toe, ${variation.photoMood}, shot on 85mm lens.${suffix}`;
}

export const POST: RequestHandler = async ({ request }) => {
	const { imageDataUri, selfieDataUri, vibe, occasion, aesthetic, accessories } =
		await request.json();

	if (!imageDataUri || !vibe) {
		return json({ error: 'Image and style are required.' }, { status: 400 });
	}

	if (!OCCASION_CONTEXT[vibe]) {
		return json({ error: 'Invalid style.' }, { status: 400 });
	}

	const userAccessories: AccessoryInput[] = Array.isArray(accessories) ? accessories : [];

	// Build accessory reference images for Runway
	const accessoryRefs = userAccessories.map((a) => ({
		tag: a.id,
		uri: a.imageDataUri
	}));

	const taskIds: string[] = [];

	for (let i = 0; i < 3; i++) {
		const variation = LOOK_VARIATIONS[i];
		const prompt = selfieDataUri
			? buildOnBodyPrompt(variation, vibe, userAccessories, occasion, aesthetic)
			: buildFlatLayPrompt(variation, vibe, userAccessories, occasion, aesthetic);

		try {
			const taskId = await createImageTask({
				promptText: prompt,
				referenceImageUri: imageDataUri,
				selfieImageUri: selfieDataUri || undefined,
				accessoryRefs: accessoryRefs.length > 0 ? accessoryRefs : undefined,
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
