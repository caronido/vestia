<script lang="ts">
	const vibes = [
		{ id: 'casual', label: 'Casual', emoji: '☀️' },
		{ id: 'date-night', label: 'Date Night', emoji: '🌙' },
		{ id: 'work', label: 'Work', emoji: '💼' },
		{ id: 'street-style', label: 'Street Style', emoji: '🔥' },
		{ id: 'maternity', label: 'Maternity-Friendly', emoji: '🤰' }
	] as const;

	const occasions = [
		{ id: 'sf-day-out', label: 'SF Day Out' },
		{ id: 'dinner', label: 'Dinner' },
		{ id: 'meeting', label: 'Meeting' },
		{ id: 'weekend-brunch', label: 'Weekend Brunch' }
	] as const;

	let {
		selectedVibe = $bindable(''),
		selectedOccasion = $bindable('')
	}: {
		selectedVibe: string;
		selectedOccasion: string;
	} = $props();
</script>

<div class="w-full max-w-md mx-auto space-y-6">
	<div>
		<p class="text-sm font-medium text-gray-700 mb-3 text-center">Pick your vibe</p>
		<div class="flex flex-wrap justify-center gap-2">
			{#each vibes as vibe}
				<button
					class="px-4 py-2 rounded-full text-sm border transition-all cursor-pointer
						{selectedVibe === vibe.id
							? 'bg-black text-white border-black'
							: 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}"
					onclick={() => (selectedVibe = vibe.id)}
				>
					{vibe.emoji} {vibe.label}
				</button>
			{/each}
		</div>
	</div>

	<div>
		<p class="text-sm font-medium text-gray-700 mb-3 text-center">Occasion <span class="text-gray-400">(optional)</span></p>
		<div class="flex flex-wrap justify-center gap-2">
			{#each occasions as occasion}
				<button
					class="px-4 py-2 rounded-full text-sm border transition-all cursor-pointer
						{selectedOccasion === occasion.id
							? 'bg-black text-white border-black'
							: 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}"
					onclick={() => (selectedOccasion = selectedOccasion === occasion.id ? '' : occasion.id)}
				>
					{occasion.label}
				</button>
			{/each}
		</div>
	</div>
</div>
