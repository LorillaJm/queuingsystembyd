<script>
  export let variant = 'primary'; // primary | secondary | ghost
  export let size = 'md'; // sm | md | lg
  export let disabled = false;
  export let loading = false;
  export let type = 'button';
  
  const variants = {
    primary: 'bg-apple-blue hover:bg-apple-blue-dark text-white',
    secondary: 'bg-apple-gray-100 hover:bg-apple-gray-200 dark:bg-apple-gray-800 dark:hover:bg-apple-gray-700 text-apple-gray-900 dark:text-white',
    ghost: 'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-900 dark:text-white'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
</script>

<button
  {type}
  {disabled}
  class="font-semibold rounded-xl transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed {variants[variant]} {sizes[size]}"
  on:click
>
  {#if loading}
    <span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
  {/if}
  <slot />
</button>
