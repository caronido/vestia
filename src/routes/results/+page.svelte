<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface TaskResult {
		id: string;
		imageUrl: string;
		label: string;
	}

	let outfits = $state<TaskResult[]>([]);
	let pending = $state(0);
	let failed = $state(0);
	let totalTasks = $state(0);
	let fullViewUrl = $state('');
	let savedIds = $state(new Set<string>());
	let taskLabels = $state<Record<string, string>>({});

	onMount(() => {
		const raw = sessionStorage.getItem('vestia_generation');
		if (!raw) {
			goto('/');
			return;
		}

		const { taskIds, labels } = JSON.parse(raw);
		totalTasks = taskIds.length;
		pending = totalTasks;

		// Map task IDs to their variation labels
		const labelMap: Record<string, string> = {};
		for (let i = 0; i < taskIds.length; i++) {
			labelMap[taskIds[i]] = labels?.[i] || '';
		}
		taskLabels = labelMap;

		const saved = JSON.parse(localStorage.getItem('vestia_saved') || '[]') as { id: string }[];
		savedIds = new Set(saved.map((s) => s.id));

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
					outfits = [...outfits, {
						id: taskId,
						imageUrl: data.output[0],
						label: taskLabels[taskId] || ''
					}];
					pending--;
					return;
				}

				if (data.status === 'FAILED') {
					pending--;
					failed++;
					return;
				}
			} catch {
				// Network error, retry
			}
		}

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

<div class="flex flex-col items-center px-6 py-12 gap-10">
	<div class="text-center space-y-3">
		<h1 class="font-display text-3xl font-normal tracking-wide">Your Looks</h1>
		<p class="text-[11px] tracking-[0.15em] uppercase text-black/35">Three ways to style your piece</p>
		<div class="w-12 h-px bg-black/20 mx-auto"></div>
	</div>

	{#if pending > 0}
		<div class="flex flex-col items-center gap-4 py-12">
			<div class="w-8 h-8 border border-black/15 border-t-black rounded-full animate-spin"></div>
			<p class="text-[11px] tracking-[0.2em] uppercase text-black/40">
				Curating {pending} of {totalTasks} look{totalTasks > 1 ? 's' : ''}
			</p>
			<p class="text-[10px] tracking-[0.1em] uppercase text-black/25">Great style takes a moment</p>
		</div>
	{/if}

	{#if outfits.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
			{#each outfits as outfit (outfit.id)}
				<div class="flex flex-col">
					<div class="relative bg-editorial-light overflow-hidden">
						<button onclick={() => (fullViewUrl = outfit.imageUrl)} class="w-full cursor-pointer bg-transparent border-0 p-0">
							<img src={outfit.imageUrl} alt="{outfit.label} look" class="w-full aspect-[3/4] object-cover" loading="lazy" />
						</button>
						<button
							onclick={() => toggleSave(outfit.id, outfit.imageUrl)}
							class="absolute top-3 right-3 w-9 h-9 flex items-center justify-center
								bg-white/90 backdrop-blur-sm border border-black/10
								hover:bg-black hover:text-white transition-all cursor-pointer text-sm"
							aria-label={savedIds.has(outfit.id) ? 'Remove from closet' : 'Save to closet'}
						>
							{@html savedIds.has(outfit.id) ? '&#9829;' : '&#9825;'}
						</button>
					</div>
					{#if outfit.label}
						<div class="pt-4 text-center">
							<p class="text-[11px] tracking-[0.25em] uppercase text-black/50 font-medium">{outfit.label}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	{#if failed > 0 && pending === 0}
		<p class="text-[11px] tracking-[0.15em] uppercase text-black/30">
			{failed} look{failed > 1 ? 's' : ''} couldn't be generated
		</p>
	{/if}

	{#if pending === 0}
		<button
			onclick={regenerate}
			class="px-8 py-3 border border-black text-black text-[11px] tracking-[0.2em] uppercase bg-transparent
				hover:bg-black hover:text-white transition-colors cursor-pointer"
		>
			Start Over
		</button>
	{/if}
</div>

{#if fullViewUrl}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
		onclick={() => (fullViewUrl = '')}
		onkeydown={(e) => { if (e.key === 'Escape') fullViewUrl = ''; }}
	>
		<div class="relative max-w-2xl w-full">
			<img src={fullViewUrl} alt="Full look" class="w-full" />
			<button
				onclick={() => (fullViewUrl = '')}
				class="absolute top-4 right-4 bg-white text-black w-10 h-10 flex items-center justify-center
					text-sm cursor-pointer border-0 hover:bg-black hover:text-white transition-colors"
			>
				&#10005;
			</button>
		</div>
	</div>
{/if}
