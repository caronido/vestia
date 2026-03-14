<script lang="ts">
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import UploadZone from '$lib/components/UploadZone.svelte';
	import StyleSelector from '$lib/components/StyleSelector.svelte';
	import AccessoryPicker from '$lib/components/AccessoryPicker.svelte';
	import type { AccessoryItem } from '$lib/components/AccessoryPicker.svelte';

	let imageDataUri = $state('');
	let selfieDataUri = $state('');
	let selectedVibe = $state('');
	let selectedOccasion = $state('');
	let accessories = $state<AccessoryItem[]>([]);
	let isGenerating = $state(false);
	let error = $state('');

	const canGenerate = $derived(!!imageDataUri && !!selectedVibe && !isGenerating);

	async function generate() {
		if (!canGenerate) return;
		isGenerating = true;
		error = '';

		try {
			const res = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					imageDataUri,
					selfieDataUri: selfieDataUri || undefined,
					vibe: selectedVibe,
					occasion: selectedOccasion || undefined,
					accessories: accessories.length > 0
						? accessories.map((a) => ({ id: a.id, label: a.label, imageDataUri: a.imageDataUri }))
						: undefined
				})
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || 'Failed to generate looks');
			}

			const { taskIds, labels } = await res.json();

			sessionStorage.setItem(
				'vestia_generation',
				JSON.stringify({ taskIds, labels, vibe: selectedVibe, occasion: selectedOccasion, imageDataUri })
			);

			goto('/results');
		} catch (e) {
			error = (e as Error).message;
			isGenerating = false;
		}
	}
</script>

<div class="flex flex-col items-center px-6 py-20 gap-16 max-w-2xl mx-auto">
	<div class="text-center space-y-5">
		<Logo size="lg" />
		<div class="w-16 h-px bg-black/20 mx-auto"></div>
		<p class="text-[13px] tracking-[0.15em] uppercase text-black/40 font-light">Your AI-Powered Stylist</p>
	</div>

	<div class="w-full">
		<p class="text-center text-[11px] tracking-[0.2em] uppercase text-black/50 mb-5">Upload a piece from your wardrobe</p>
		<UploadZone onImageSelected={(uri) => (imageDataUri = uri)} />
	</div>

	{#if imageDataUri}
		<div class="w-full">
			<p class="text-center text-[11px] tracking-[0.2em] uppercase text-black/50 mb-5">
				Add a selfie to see the look on you <span class="text-black/30">(optional)</span>
			</p>
			<UploadZone onImageSelected={(uri) => (selfieDataUri = uri)} />
		</div>
	{/if}

	{#if imageDataUri}
		<div class="w-full">
			<StyleSelector bind:selectedVibe bind:selectedOccasion />
		</div>
	{/if}

	{#if imageDataUri}
		<div class="w-full">
			<AccessoryPicker bind:accessories />
		</div>
	{/if}

	{#if imageDataUri && selectedVibe}
		<button
			onclick={generate}
			disabled={!canGenerate}
			class="px-10 py-3.5 bg-black text-white text-[11px] tracking-[0.25em] uppercase font-medium
				hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer border-0"
		>
			{#if isGenerating}
				<span class="inline-flex items-center gap-3">
					<span class="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin"></span>
					Styling...
				</span>
			{:else}
				Style My Look
			{/if}
		</button>
	{/if}

	{#if error}
		<p class="text-red-600 text-xs text-center max-w-sm">{error}</p>
	{/if}
</div>
