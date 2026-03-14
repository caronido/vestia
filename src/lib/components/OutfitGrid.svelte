<script lang="ts">
	import OutfitCard from './OutfitCard.svelte';

	let {
		outfits,
		savedIds,
		onToggleSave,
		onViewFull
	}: {
		outfits: { id: string; imageUrl: string }[];
		savedIds: Set<string>;
		onToggleSave: (id: string, imageUrl: string) => void;
		onViewFull: (imageUrl: string) => void;
	} = $props();
</script>

<div class="grid grid-cols-2 gap-3 w-full max-w-lg mx-auto">
	{#each outfits as outfit (outfit.id)}
		<OutfitCard
			imageUrl={outfit.imageUrl}
			isSaved={savedIds.has(outfit.id)}
			onToggleSave={() => onToggleSave(outfit.id, outfit.imageUrl)}
			onViewFull={() => onViewFull(outfit.imageUrl)}
		/>
	{/each}
</div>
