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

		// Resize client-side to stay under 5MB base64 limit
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
		<img src={preview} alt="Selected piece" class="w-full rounded-2xl shadow-lg object-cover aspect-square" />
		<button
			onclick={reset}
			class="absolute top-3 right-3 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-black/80 transition-colors cursor-pointer"
		>
			✕
		</button>
	</div>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="w-full max-w-sm mx-auto border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer
			{isDragging ? 'border-warm bg-warm/5' : 'border-gray-300 hover:border-gray-400'}"
		ondragover={(e) => { e.preventDefault(); isDragging = true; }}
		ondragleave={() => isDragging = false}
		ondrop={handleDrop}
		onclick={() => document.getElementById('file-input')?.click()}
		onkeydown={(e) => { if (e.key === 'Enter') document.getElementById('file-input')?.click(); }}
		role="button"
		tabindex="0"
	>
		<div class="text-4xl mb-3 text-gray-300">📸</div>
		<p class="text-sm text-gray-500 mb-1">Drop your piece here</p>
		<p class="text-xs text-gray-400">or tap to browse</p>
		<input
			id="file-input"
			type="file"
			accept="image/jpeg,image/png,image/webp"
			class="hidden"
			onchange={handleInput}
		/>
	</div>
{/if}
