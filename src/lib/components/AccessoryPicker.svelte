<script lang="ts">
	const ACCESSORY_OPTIONS = [
		{ id: 'shoes', label: 'Shoes' },
		{ id: 'bag', label: 'Bag' },
		{ id: 'jewelry', label: 'Jewelry' },
		{ id: 'sunglasses', label: 'Sunglasses' },
		{ id: 'hat', label: 'Hat' },
		{ id: 'belt', label: 'Belt' },
		{ id: 'scarf', label: 'Scarf' },
		{ id: 'watch', label: 'Watch' }
	];

	export interface AccessoryItem {
		id: string;
		label: string;
		imageDataUri: string;
	}

	let { accessories = $bindable([]) }: { accessories: AccessoryItem[] } = $props();

	function isSelected(id: string): boolean {
		return accessories.some((a) => a.id === id);
	}

	function toggle(opt: { id: string; label: string }) {
		if (isSelected(opt.id)) {
			accessories = accessories.filter((a) => a.id !== opt.id);
		} else {
			// Trigger file picker for this accessory
			activePickerId = opt.id;
			activePickerLabel = opt.label;
			const input = document.getElementById('acc-file-input') as HTMLInputElement;
			if (input) {
				input.value = '';
				input.click();
			}
		}
	}

	let activePickerId = $state('');
	let activePickerLabel = $state('');

	function processFile(file: File) {
		if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return;

		const img = new Image();
		const reader = new FileReader();

		reader.onload = () => {
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const maxDim = 1024;
				let w = img.width;
				let h = img.height;

				if (w > maxDim || h > maxDim) {
					const scale = maxDim / Math.max(w, h);
					w = Math.round(w * scale);
					h = Math.round(h * scale);
				}

				canvas.width = w;
				canvas.height = h;
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(img, 0, 0, w, h);

				const dataUri = canvas.toDataURL('image/jpeg', 0.8);
				accessories = [
					...accessories,
					{ id: activePickerId, label: activePickerLabel, imageDataUri: dataUri }
				];
				activePickerId = '';
				activePickerLabel = '';
			};
			img.src = reader.result as string;
		};

		reader.readAsDataURL(file);
	}

	function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) processFile(file);
		else {
			activePickerId = '';
			activePickerLabel = '';
		}
	}

	function removeAccessory(id: string) {
		accessories = accessories.filter((a) => a.id !== id);
	}
</script>

<div class="space-y-5">
	<div class="text-center space-y-2">
		<p class="text-[11px] tracking-[0.2em] uppercase text-black/50">
			Add your own accessories <span class="text-black/30">(optional)</span>
		</p>
		<p class="text-[10px] tracking-[0.1em] text-black/30">
			Upload pieces you own — we'll complete the look around them
		</p>
	</div>

	<div class="flex flex-wrap justify-center gap-2">
		{#each ACCESSORY_OPTIONS as opt (opt.id)}
			<button
				onclick={() => toggle(opt)}
				class="px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-all cursor-pointer
					{isSelected(opt.id)
						? 'bg-black text-white border-black'
						: 'bg-transparent text-black/60 border-black/15 hover:border-black/40'}"
			>
				{opt.label}
			</button>
		{/each}
	</div>

	{#if accessories.length > 0}
		<div class="flex flex-wrap justify-center gap-3">
			{#each accessories as acc (acc.id)}
				<div class="relative group">
					<div class="w-20 h-20 overflow-hidden border border-black/10">
						<img src={acc.imageDataUri} alt={acc.label} class="w-full h-full object-cover" />
					</div>
					<button
						onclick={() => removeAccessory(acc.id)}
						class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white text-[9px]
							flex items-center justify-center cursor-pointer border-0
							opacity-0 group-hover:opacity-100 transition-opacity"
					>
						&#10005;
					</button>
					<p class="text-[9px] tracking-[0.15em] uppercase text-black/40 text-center mt-1.5">{acc.label}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>

<input
	id="acc-file-input"
	type="file"
	accept="image/jpeg,image/png,image/webp"
	class="hidden"
	onchange={handleFileInput}
/>
