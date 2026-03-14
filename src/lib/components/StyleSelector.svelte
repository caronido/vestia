<script lang="ts">
	const vibes = [
		{ id: 'casual', label: 'Casual' },
		{ id: 'date-night', label: 'Date Night' },
		{ id: 'work', label: 'Work' },
		{ id: 'street-style', label: 'Street Style' },
		{ id: 'maternity', label: 'Maternity' }
	] as const;

	const occasions = [
		{ id: 'sf-day-out', label: 'SF Day Out' },
		{ id: 'dinner', label: 'Dinner' },
		{ id: 'meeting', label: 'Meeting' },
		{ id: 'weekend-brunch', label: 'Weekend Brunch' }
	] as const;

	const aesthetics = [
		{ id: 'quiet-luxury', label: 'Quiet Luxury' },
		{ id: 'old-money', label: 'Old Money' },
		{ id: 'clean-girl', label: 'Clean Girl' },
		{ id: 'mob-wife', label: 'Mob Wife' },
		{ id: 'coastal-grandmother', label: 'Coastal Grandmother' },
		{ id: 'scandi-minimal', label: 'Scandi Minimal' },
		{ id: 'downtown-cool', label: 'Downtown Cool' },
		{ id: 'coquette', label: 'Coquette' }
	] as const;

	let {
		selectedVibe = $bindable(''),
		selectedOccasion = $bindable(''),
		selectedAesthetic = $bindable('')
	}: {
		selectedVibe: string;
		selectedOccasion: string;
		selectedAesthetic: string;
	} = $props();
</script>

<div class="w-full max-w-lg mx-auto space-y-10">
	<div>
		<p class="text-[11px] tracking-[0.2em] uppercase text-black/50 mb-4 text-center">Pick Your Vibe</p>
		<div class="flex flex-wrap justify-center gap-2.5">
			{#each vibes as vibe}
				<button
					class="px-5 py-2 text-[11px] tracking-[0.15em] uppercase border transition-all cursor-pointer
						{selectedVibe === vibe.id
							? 'bg-black text-white border-black'
							: 'bg-transparent text-black/70 border-black/20 hover:border-black'}"
					onclick={() => (selectedVibe = vibe.id)}
				>
					{vibe.label}
				</button>
			{/each}
		</div>
	</div>

	<div>
		<p class="text-[11px] tracking-[0.2em] uppercase text-black/50 mb-4 text-center">
			Trending Aesthetic <span class="text-black/25">(optional)</span>
		</p>
		<div class="flex flex-wrap justify-center gap-2.5">
			{#each aesthetics as aesthetic}
				<button
					class="px-5 py-2 text-[11px] tracking-[0.15em] uppercase border transition-all cursor-pointer
						{selectedAesthetic === aesthetic.id
							? 'bg-black text-white border-black'
							: 'bg-transparent text-black/70 border-black/20 hover:border-black'}"
					onclick={() => (selectedAesthetic = selectedAesthetic === aesthetic.id ? '' : aesthetic.id)}
				>
					{aesthetic.label}
				</button>
			{/each}
		</div>
	</div>

	<div>
		<p class="text-[11px] tracking-[0.2em] uppercase text-black/50 mb-4 text-center">
			Occasion <span class="text-black/25">(optional)</span>
		</p>
		<div class="flex flex-wrap justify-center gap-2.5">
			{#each occasions as occasion}
				<button
					class="px-5 py-2 text-[11px] tracking-[0.15em] uppercase border transition-all cursor-pointer
						{selectedOccasion === occasion.id
							? 'bg-black text-white border-black'
							: 'bg-transparent text-black/70 border-black/20 hover:border-black'}"
					onclick={() => (selectedOccasion = selectedOccasion === occasion.id ? '' : occasion.id)}
				>
					{occasion.label}
				</button>
			{/each}
		</div>
	</div>
</div>
