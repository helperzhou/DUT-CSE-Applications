<script lang="ts">
	import '../../app.css';
	import { SiteHeader } from '$lib/components/ui/index';
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/stores';

	// Define routes where the header should be hidden
	const hiddenRoutes = ['/', '/application-form', '/track-application/signin', '/track-application/signup', '/track-application/tracker', "/track-application/tracker/programs"];
</script>

<ModeWatcher />

{#if !hiddenRoutes.includes($page.url.pathname)}
	<SiteHeader />
{/if}

<div class="bg-background relative flex min-h-screen flex-col" id="page" data-vaul-drawer-wrapper>
	<slot />
</div>
