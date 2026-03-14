<script lang="ts">
	import { onMount } from 'svelte';

	interface SavedOutfit {
		id: string;
		imageUrl: string;
		savedAt: string;
	}

	let outfits = $state<SavedOutfit[]>([]);
	let fullViewUrl = $state('');

	onMount(() => {
		outfits = JSON.parse(localStorage.getItem('vestia_saved') || '[]');
	});

	function remove(id: string) {
		outfits = outfits.filter((o) => o.id !== id);
		localStorage.setItem('vestia_saved', JSON.stringify(outfits));
	}
</script>

<div class="flex flex-col items-center px-6 py-12 gap-10">
	<div class="text-center space-y-3">
		<h1 class="font-display text-3xl font-normal tracking-wide">My Closet</h1>
		<div class="w-12 h-px bg-black/20 mx-auto"></div>
	</div>

	{#if outfits.length === 0}
		<div class="text-center py-20 space-y-6">
			<p class="text-[11px] tracking-[0.2em] uppercase text-black/30">No saved looks yet</p>
			<a
				href="/"
				class="inline-block px-8 py-3 bg-black text-white text-[11px] tracking-[0.2em] uppercase
					hover:bg-black/80 transition-colors no-underline"
			>
				Create My First Look
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-2 md:grid-cols-3 gap-px w-full max-w-3xl mx-auto bg-black/10">
			{#each outfits as outfit (outfit.id)}
				<div class="relative bg-editorial-light overflow-hidden">
					<button onclick={() => (fullViewUrl = outfit.imageUrl)} class="w-full cursor-pointer bg-transparent border-0 p-0">
						<img src={outfit.imageUrl} alt="Saved look" class="w-full aspect-[3/4] object-cover" loading="lazy" />
					</button>
					<button
						onclick={() => remove(outfit.id)}
						class="absolute top-3 right-3 w-9 h-9 flex items-center justify-center
							bg-white/90 backdrop-blur-sm border border-black/10
							hover:bg-black hover:text-white transition-all cursor-pointer text-sm"
						aria-label="Remove look"
					>
						&#9829;
					</button>
				</div>
			{/each}
		</div>
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
