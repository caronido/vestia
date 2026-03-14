<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import OutfitGrid from '$lib/components/OutfitGrid.svelte';

	interface TaskResult {
		id: string;
		imageUrl: string;
	}

	let outfits = $state<TaskResult[]>([]);
	let pending = $state(0);
	let failed = $state(0);
	let totalTasks = $state(0);
	let fullViewUrl = $state('');
	let savedIds = $state(new Set<string>());

	onMount(() => {
		const raw = sessionStorage.getItem('vestia_generation');
		if (!raw) {
			goto('/');
			return;
		}

		const { taskIds } = JSON.parse(raw);
		totalTasks = taskIds.length;
		pending = totalTasks;

		// Load saved outfits from localStorage
		const saved = JSON.parse(localStorage.getItem('vestia_saved') || '[]') as { id: string }[];
		savedIds = new Set(saved.map((s) => s.id));

		// Poll each task
		for (const taskId of taskIds) {
			pollTask(taskId);
		}
	});

	async function pollTask(taskId: string) {
		const maxAttempts = 60;
		for (let i = 0; i < maxAttempts; i++) {
			await new Promise((r) => setTimeout(r, 3000));

			try {
				const res = await fetch(`/api/status?taskId=${taskId}`);
				if (!res.ok) continue;

				const data = await res.json();

				if (data.status === 'SUCCEEDED' && data.output?.length) {
					outfits = [...outfits, { id: taskId, imageUrl: data.output[0] }];
					pending--;
					return;
				}

				if (data.status === 'FAILED') {
					pending--;
					failed++;
					return;
				}

				// PENDING, THROTTLED, RUNNING → keep polling
			} catch {
				// Network error, retry
			}
		}

		// Timed out
		pending--;
		failed++;
	}

	function toggleSave(id: string, imageUrl: string) {
		const saved = JSON.parse(localStorage.getItem('vestia_saved') || '[]') as {
			id: string;
			imageUrl: string;
			savedAt: string;
		}[];

		if (savedIds.has(id)) {
			const filtered = saved.filter((s) => s.id !== id);
			localStorage.setItem('vestia_saved', JSON.stringify(filtered));
			const next = new Set(savedIds);
			next.delete(id);
			savedIds = next;
		} else {
			saved.push({ id, imageUrl, savedAt: new Date().toISOString() });
			localStorage.setItem('vestia_saved', JSON.stringify(saved));
			savedIds = new Set([...savedIds, id]);
		}
	}

	function regenerate() {
		goto('/');
	}
</script>

<div class="flex flex-col items-center px-4 py-8 gap-6">
	<h1 class="text-xl font-semibold">Tus Outfits</h1>

	{#if pending > 0}
		<div class="flex flex-col items-center gap-3 py-8">
			<div class="w-10 h-10 border-3 border-gray-200 border-t-black rounded-full animate-spin"></div>
			<p class="text-sm text-gray-500">
				Generando {pending} de {totalTasks} outfit{totalTasks > 1 ? 's' : ''}...
			</p>
			<p class="text-xs text-gray-400">Esto puede tomar 15-30 segundos por outfit</p>
		</div>
	{/if}

	{#if outfits.length > 0}
		<OutfitGrid
			{outfits}
			{savedIds}
			onToggleSave={toggleSave}
			onViewFull={(url) => (fullViewUrl = url)}
		/>
	{/if}

	{#if failed > 0 && pending === 0}
		<p class="text-sm text-gray-400">{failed} outfit{failed > 1 ? 's' : ''} no se pudo generar.</p>
	{/if}

	{#if pending === 0}
		<button
			onclick={regenerate}
			class="px-6 py-2 border border-black text-black rounded-full text-sm font-medium
				hover:bg-black hover:text-white transition-colors cursor-pointer"
		>
			Generar de nuevo
		</button>
	{/if}
</div>

<!-- Full view modal -->
{#if fullViewUrl}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
		onclick={() => (fullViewUrl = '')}
		onkeydown={(e) => { if (e.key === 'Escape') fullViewUrl = ''; }}
	>
		<div class="relative max-w-2xl w-full">
			<img src={fullViewUrl} alt="Outfit completo" class="w-full rounded-xl" />
			<button
				onclick={() => (fullViewUrl = '')}
				class="absolute top-3 right-3 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center text-lg cursor-pointer border-0"
			>
				✕
			</button>
		</div>
	</div>
{/if}
