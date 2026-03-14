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

<div class="relative group rounded-2xl overflow-hidden shadow-md bg-gray-50">
	<button onclick={onViewFull} class="w-full cursor-pointer bg-transparent border-0 p-0">
		<img src={imageUrl} alt="Outfit generado" class="w-full aspect-square object-cover" loading="lazy" />
	</button>
	<button
		onclick={onToggleSave}
		class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center
			shadow-sm hover:scale-110 transition-transform cursor-pointer border-0 text-lg"
		aria-label={isSaved ? 'Quitar de guardados' : 'Guardar outfit'}
	>
		{isSaved ? '❤️' : '🤍'}
	</button>
</div>
