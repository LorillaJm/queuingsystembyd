<script>
  import { onMount, onDestroy } from 'svelte';
  import { getQueue } from '$lib/api';
  import { getSocket } from '$lib/socket';

  let nowServing = null;
  let next = [];
  let socket;

  async function fetchQueue() {
    try {
      const data = await getQueue('MAIN');
      nowServing = data.data?.currentServing || null;
      next = data.data?.nextUp || [];
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    }
  }

  onMount(() => {
    fetchQueue();
    
    socket = getSocket();
    socket.on('queue:updated', fetchQueue);
    socket.on('connect', () => console.log('Connected to server'));
    socket.on('disconnect', () => console.log('Disconnected from server'));
  });

  onDestroy(() => {
    if (socket) {
      socket.off('queue:updated', fetchQueue);
    }
  });
</script>

<svelte:head>
  <title>Queue Display</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white p-8">
  <div class="max-w-6xl mx-auto">
    <!-- Now Serving -->
    <div class="mb-12">
      <div class="text-2xl font-medium mb-4 text-gray-400">NOW SERVING</div>
      <div class="bg-gray-800 rounded-3xl p-16 text-center">
        {#if nowServing}
          <div class="text-9xl font-bold tracking-tight">{nowServing.ticketNumber}</div>
        {:else}
          <div class="text-6xl text-gray-600">—</div>
        {/if}
      </div>
    </div>

    <!-- Next in Queue -->
    <div>
      <div class="text-2xl font-medium mb-4 text-gray-400">NEXT</div>
      <div class="grid grid-cols-5 gap-4">
        {#each Array(5) as _, i}
          <div class="bg-gray-800 rounded-2xl p-8 text-center">
            {#if next[i]}
              <div class="text-4xl font-semibold">{next[i].ticketNumber}</div>
            {:else}
              <div class="text-2xl text-gray-700">—</div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
