<script lang="ts">
	import Logo from './Logo.svelte';

	let { currentPath = '/' }: { currentPath?: string } = $props();
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
	<div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
		<a href="/" class="no-underline">
			<Logo size="sm" />
		</a>
		<div class="flex gap-6">
			<a
				href="/"
				class="text-sm {currentPath === '/' ? 'text-black font-medium' : 'text-gray-400'} hover:text-black transition-colors no-underline"
			>
				Home
			</a>
			<a
				href="/closet"
				class="text-sm {currentPath === '/closet' ? 'text-black font-medium' : 'text-gray-400'} hover:text-black transition-colors no-underline"
			>
				My Closet
			</a>
		</div>
	</div>
</nav>
