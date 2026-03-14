<script lang="ts">
	let {
		onImageSelected
	}: {
		onImageSelected: (dataUri: string) => void;
	} = $props();

	let isDragging = $state(false);
	let preview = $state<string | null>(null);

	function handleFile(file: File) {
		if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
			alert('Please upload a JPEG, PNG, or WebP image.');
			return;
		}

		const img = new Image();
		const reader = new FileReader();

		reader.onload = () => {
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const maxDim = 2048;
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

				const dataUri = canvas.toDataURL('image/jpeg', 0.85);
				preview = dataUri;
				onImageSelected(dataUri);
			};
			img.src = reader.result as string;
		};

		reader.readAsDataURL(file);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files[0];
		if (file) handleFile(file);
	}

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) handleFile(file);
	}

	function reset() {
		preview = null;
	}
</script>

{#if preview}
	<div class="relative w-full max-w-sm mx-auto">
		<img src={preview} alt="Selected piece" class="w-full aspect-square object-cover" />
		<button
			onclick={reset}
			class="absolute top-3 right-3 bg-white text-black w-8 h-8 flex items-center justify-center text-xs
				hover:bg-black hover:text-white transition-colors cursor-pointer border border-black/10"
		>
			&#10005;
		</button>
	</div>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="w-full max-w-sm mx-auto border border-black/15 p-16 text-center transition-colors cursor-pointer
			{isDragging ? 'border-black bg-black/[0.02]' : 'hover:border-black/40'}"
		ondragover={(e) => { e.preventDefault(); isDragging = true; }}
		ondragleave={() => isDragging = false}
		ondrop={handleDrop}
		onclick={() => document.getElementById('file-input')?.click()}
		onkeydown={(e) => { if (e.key === 'Enter') document.getElementById('file-input')?.click(); }}
		role="button"
		tabindex="0"
	>
		<div class="text-2xl mb-4 text-black/20">+</div>
		<p class="text-[11px] tracking-[0.15em] uppercase text-black/40 mb-1">Drop your piece here</p>
		<p class="text-[10px] tracking-[0.1em] uppercase text-black/25">or tap to browse</p>
		<input
			id="file-input"
			type="file"
			accept="image/jpeg,image/png,image/webp"
			class="hidden"
			onchange={handleInput}
		/>
	</div>
{/if}
