<script lang="ts">
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import UploadZone from '$lib/components/UploadZone.svelte';
	import StyleSelector from '$lib/components/StyleSelector.svelte';

	let imageDataUri = $state('');
	let selectedVibe = $state('');
	let selectedOccasion = $state('');
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
					vibe: selectedVibe,
					occasion: selectedOccasion || undefined
				})
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || 'Error al generar outfits');
			}

			const { taskIds } = await res.json();

			sessionStorage.setItem(
				'vestia_generation',
				JSON.stringify({ taskIds, vibe: selectedVibe, occasion: selectedOccasion, imageDataUri })
			);

			goto('/results');
		} catch (e) {
			error = (e as Error).message;
			isGenerating = false;
		}
	}
</script>

<div class="flex flex-col items-center px-4 py-16 gap-10">
	<div class="text-center space-y-3">
		<Logo size="lg" />
		<p class="text-gray-500 text-lg">Tu estilista con inteligencia artificial</p>
	</div>

	<div class="w-full">
		<p class="text-center text-sm text-gray-600 mb-4">Sube una prenda de tu closet</p>
		<UploadZone onImageSelected={(uri) => (imageDataUri = uri)} />
	</div>

	{#if imageDataUri}
		<div class="w-full">
			<StyleSelector bind:selectedVibe bind:selectedOccasion />
		</div>
	{/if}

	{#if imageDataUri && selectedVibe}
		<button
			onclick={generate}
			disabled={!canGenerate}
			class="px-8 py-3 bg-black text-white rounded-full font-medium text-sm
				hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
		>
			{#if isGenerating}
				<span class="inline-flex items-center gap-2">
					<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
					Generando...
				</span>
			{:else}
				Generar Outfits
			{/if}
		</button>
	{/if}

	{#if error}
		<p class="text-red-500 text-sm text-center max-w-sm">{error}</p>
	{/if}
</div>
