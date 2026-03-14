<script lang="ts">
	let { size = 'lg' }: { size?: 'sm' | 'lg' } = $props();
</script>

<span class="font-bold tracking-tight {size === 'lg' ? 'text-4xl' : 'text-xl'}">
	Vest<span class="text-warm font-black italic">IA</span>
</span>
