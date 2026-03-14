import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTaskStatus } from '$lib/runway';

export const GET: RequestHandler = async ({ url }) => {
	const taskId = url.searchParams.get('taskId');

	if (!taskId) {
		return json({ error: 'Falta el taskId.' }, { status: 400 });
	}

	try {
		const status = await getTaskStatus(taskId);
		return json(status);
	} catch (e) {
		return json({ error: (e as Error).message }, { status: 500 });
	}
};
