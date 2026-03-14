<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<title>VESTIA — Fashion Styled by AI</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,700&display=swap" rel="stylesheet" />
</svelte:head>

<Navigation currentPath={page.url.pathname} />

<main class="pt-24 min-h-screen bg-white font-sans">
	{@render children()}
</main>
