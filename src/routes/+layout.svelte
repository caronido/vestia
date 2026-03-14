<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<title>VestIA — Tu estilista con inteligencia artificial</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
</svelte:head>

<Navigation currentPath={page.url.pathname} />

<main class="pt-14 min-h-screen bg-white font-sans">
	{@render children()}
</main>
