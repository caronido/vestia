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

<div class="flex flex-col items-center px-4 py-8 gap-6">
	<h1 class="text-xl font-semibold">My Closet</h1>

	{#if outfits.length === 0}
		<div class="text-center py-16 space-y-3">
			<p class="text-4xl">👗</p>
			<p class="text-gray-400 text-sm">No saved looks yet — let's change that.</p>
			<a
				href="/"
				class="inline-block mt-2 px-6 py-2 bg-black text-white rounded-full text-sm font-medium
					hover:bg-gray-800 transition-colors no-underline"
			>
				Create My First Look
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-3 w-full max-w-lg mx-auto">
			{#each outfits as outfit (outfit.id)}
				<div class="relative rounded-2xl overflow-hidden shadow-md bg-gray-50">
					<button onclick={() => (fullViewUrl = outfit.imageUrl)} class="w-full cursor-pointer bg-transparent border-0 p-0">
						<img src={outfit.imageUrl} alt="Saved look" class="w-full aspect-square object-cover" loading="lazy" />
					</button>
					<button
						onclick={() => remove(outfit.id)}
						class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center
							shadow-sm hover:scale-110 transition-transform cursor-pointer border-0 text-lg"
						aria-label="Remove look"
					>
						❤️
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if fullViewUrl}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
		onclick={() => (fullViewUrl = '')}
		onkeydown={(e) => { if (e.key === 'Escape') fullViewUrl = ''; }}
	>
		<div class="relative max-w-2xl w-full">
			<img src={fullViewUrl} alt="Full look" class="w-full rounded-xl" />
			<button
				onclick={() => (fullViewUrl = '')}
				class="absolute top-3 right-3 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center text-lg cursor-pointer border-0"
			>
				✕
			</button>
		</div>
	</div>
{/if}
