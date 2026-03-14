<script lang="ts">
	let {
		imageUrl,
		isSaved = false,
		onToggleSave,
		onViewFull
	}: {
		imageUrl: string;
		isSaved?: boolean;
		onToggleSave: () => void;
		onViewFull: () => void;
	} = $props();
</script>

<div class="relative group overflow-hidden bg-editorial-light">
	<button onclick={onViewFull} class="w-full cursor-pointer bg-transparent border-0 p-0">
		<img src={imageUrl} alt="Styled outfit" class="w-full aspect-[3/4] object-cover" loading="lazy" />
	</button>
	<button
		onclick={onToggleSave}
		class="absolute top-3 right-3 w-9 h-9 flex items-center justify-center
			bg-white/90 backdrop-blur-sm border border-black/10
			hover:bg-black hover:text-white transition-all cursor-pointer text-sm"
		aria-label={isSaved ? 'Remove from closet' : 'Save to closet'}
	>
		{isSaved ? '&#9829;' : '&#9825;'}
	</button>
</div>
