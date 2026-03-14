<script lang="ts">
	let { size = 'lg' }: { size?: 'sm' | 'lg' } = $props();
</script>

<span
	class="font-display tracking-[0.25em] uppercase {size === 'lg' ? 'text-5xl' : 'text-2xl'}"
	style="font-weight: 700;"
>
	VESTIA
</span>
