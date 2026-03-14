import { env } from '$env/dynamic/private';

const API_BASE = 'https://api.dev.runwayml.com';
const API_VERSION = '2024-11-06';

interface RunwayTaskResponse {
	id: string;
}

interface RunwayTaskStatus {
	id: string;
	status: 'PENDING' | 'THROTTLED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
	output?: string[];
	failure?: string;
	failureCode?: string;
}

interface ReferenceImage {
	uri: string;
	tag: string;
}

interface AccessoryRef {
	tag: string;
	uri: string;
}

interface GenerateImageParams {
	promptText: string;
	referenceImageUri: string;
	selfieImageUri?: string;
	accessoryRefs?: AccessoryRef[];
	ratio?: string;
	seed?: number;
}

async function runwayFetch(path: string, options: RequestInit = {}) {
	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${env.RUNWAY_API_KEY}`,
			'X-Runway-Version': API_VERSION,
			'Content-Type': 'application/json',
			...options.headers
		}
	});

	if (res.status === 429) {
		throw new Error('RATE_LIMITED');
	}

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(JSON.stringify({ status: res.status, ...body }));
	}

	return res.json();
}

export async function createImageTask(params: GenerateImageParams): Promise<string> {
	const referenceImages: ReferenceImage[] = [
		{
			uri: params.referenceImageUri,
			tag: 'garment'
		}
	];

	if (params.selfieImageUri) {
		referenceImages.push({
			uri: params.selfieImageUri,
			tag: 'person'
		});
	}

	if (params.accessoryRefs) {
		for (const acc of params.accessoryRefs) {
			referenceImages.push({
				uri: acc.uri,
				tag: acc.tag
			});
		}
	}

	const body = {
		model: 'gen4_image',
		promptText: params.promptText,
		ratio: params.ratio || '1024:1024',
		referenceImages,
		...(params.seed !== undefined && { seed: params.seed })
	};

	const data: RunwayTaskResponse = await runwayFetch('/v1/text_to_image', {
		method: 'POST',
		body: JSON.stringify(body)
	});

	return data.id;
}

export async function getTaskStatus(taskId: string): Promise<RunwayTaskStatus> {
	return runwayFetch(`/v1/tasks/${taskId}`);
}
