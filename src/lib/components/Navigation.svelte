<script lang="ts">
	import Logo from './Logo.svelte';

	let { currentPath = '/' }: { currentPath?: string } = $props();
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/10">
	<div class="flex items-center justify-center py-4">
		<a href="/" class="no-underline text-black">
			<Logo size="sm" />
		</a>
	</div>
	<div class="border-t border-black/10 flex items-center justify-center gap-8 py-2.5">
		<a
			href="/"
			class="text-[11px] tracking-[0.2em] uppercase no-underline transition-colors
				{currentPath === '/' ? 'text-black font-medium' : 'text-black/50 hover:text-black'}"
		>
			Home
		</a>
		<a
			href="/closet"
			class="text-[11px] tracking-[0.2em] uppercase no-underline transition-colors
				{currentPath === '/closet' ? 'text-black font-medium' : 'text-black/50 hover:text-black'}"
		>
			My Closet
		</a>
	</div>
</nav>
