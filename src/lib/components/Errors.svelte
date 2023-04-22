<script lang="ts">
    import type { ErrorMessage } from "$lib/types";
    import { slide } from "svelte/transition";
    
    export let errors: ErrorMessage[] = [];
</script>

<div class="flex flex-col space-y-1">
    {#each errors as error}
        <p transition:slide class="text-error">- <span class="font-semibold">{error.category}</span>{error.category == "" ? "" : " : "}{error.message}</p>
    {/each}
</div>