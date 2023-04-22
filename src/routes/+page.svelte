<script lang="ts">
    import { CheckBody } from "$lib/utils/valid";
    import type { ErrorMessage } from "$lib/types";
    import Errors from "$lib/components/Errors.svelte";

    export let errors: ErrorMessage[] = [];
    export let body: string = "";

    function CheckBodyInput()
    {
        CheckBody(body)
        .then((res) => {
            errors = res[1];
        });
    }

</script>

<div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col w-3/4 h-1/2">
        <div class="card flex-shrink-0 w-full shadow-2xl bg-base-100 h-full p-2">
            <div class="card-body">
                <textarea bind:value={body} on:input={CheckBodyInput} class="textarea h-full textarea-bordered" placeholder="..."></textarea>
            </div>
            <div class="flex flex-row space-x-1"> 
                <a href="https://static.assistants.epita.fr/netiquette.pdf" target="_blank" class="link">Netiquette</a>
                <p> | </p>
                <a href="https://gitlab.cri.epita.fr/cyril/leodagan" target="_blank" class="link">Leodagan</a>
            </div>
        </div>
        {#if errors.length > 0}
            <Errors {errors} />
        {:else if body.length > 0}
            <p class="text-success">No error</p>
            <p class="italic">As this tool might no be perfect I advise you to pass your input to leodagan</p>
        {/if}
    </div>
</div>