<script>
  export let type = 'text';
  export let value = '';
  export let placeholder = '';
  export let label = '';
  export let error = '';
  export let required = false;
  export let disabled = false;
</script>

<div class="space-y-2">
  {#if label}
    <label class="block text-sm font-semibold text-apple-gray-900 dark:text-white">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <input
    {type}
    {placeholder}
    {required}
    {disabled}
    bind:value
    class="input-field"
    class:border-red-500={error}
    on:input
    on:blur
    on:focus
  />
  
  {#if error}
    <p class="text-sm text-red-500">{error}</p>
  {/if}
</div>
