<script>
  export let padding = 'default'; // none | sm | default | lg
  
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };
</script>

<div class="card {paddings[padding]}">
  <slot />
</div>
