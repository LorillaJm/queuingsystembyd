<script>
  export let variant = 'default'; // default | success | warning | error
  
  const variants = {
    default: 'bg-apple-gray-100 text-apple-gray-900 dark:bg-apple-gray-800 dark:text-white',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  };
</script>

<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold {variants[variant]}">
  <slot />
</span>
