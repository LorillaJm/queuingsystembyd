<script>
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { getSocket } from '$lib/socket';
  import { getCars } from '$lib/api';
  import { fade, scale } from 'svelte/transition';

  let socket, branch = 'MAIN', isConnected = false, cars = [], tickets = [], lastUpdate = new Date();
  $: branchParam = $page.url.searchParams.get('branch');
  $: if (branchParam) branch = branchParam.toUpperCase();
  $: ticketsByModel = groupTicketsByModel(tickets, cars);

  // Available car models (only these 8 exact models from TV display)
  const availableBaseModels = [
    'byd atto 3',
    'byd dolphin',
    'byd emax 7',
    'byd shark 6',
    'byd seal 5',
    'byd sealion 5',
    'byd tang',
    'byd seagull'
  ];

  function isModelAvailable(modelName) {
    const normalized = modelName.toLowerCase().trim();
    return availableBaseModels.includes(normalized);
  }

  function groupTicketsByModel(tickets, cars) {
    const grouped = {};
    
    // Only include available car models
    const availableCars = cars.filter(car => isModelAvailable(car.model));
    availableCars.forEach(car => { 
      grouped[car.model] = { model: car.model, serving: null, nextWaiting: null, waitingList: [] }; 
    });
    
    const sortedTickets = [...tickets].sort((a, b) => {
      const numA = parseInt(a.queueNo.replace(/\D/g, ''));
      const numB = parseInt(b.queueNo.replace(/\D/g, ''));
      return numA - numB;
    });
    
    sortedTickets.forEach(ticket => {
      // Only process tickets for available models
      if (grouped[ticket.model]) {
        if (ticket.status === 'SERVING') {
          grouped[ticket.model].serving = ticket;
        } else if (ticket.status === 'WAITING') {
          if (!grouped[ticket.model].nextWaiting) {
            grouped[ticket.model].nextWaiting = ticket;
          } else {
            grouped[ticket.model].waitingList.push(ticket);
          }
        }
      }
    });
    
    return Object.values(grouped);
  }

  async function fetchCars() {
    try {
      const response = await getCars(branch);
      if (response.success) cars = response.data.cars || [];
    } catch (err) { console.error('Failed to fetch cars:', err); }
  }

  async function fetchTickets() {
    try {
      const response = await fetch(`http://localhost:3001/api/registrations?branch=${branch}`);
      const data = await response.json();
      if (data.success) { 
        tickets = data.data.registrations || []; 
        lastUpdate = new Date(); 
      }
    } catch (err) { console.error('Failed to fetch tickets:', err); }
  }

  function handleQueueUpdate(data) { if (!data.branch || data.branch === branch) fetchTickets(); }

  onMount(() => {
    fetchCars(); fetchTickets(); socket = getSocket();
    socket.on('connect', () => { isConnected = true; socket.emit('join-branch', branch); });
    socket.on('disconnect', () => { isConnected = false; });
    socket.on('queue:updated', handleQueueUpdate);
    socket.on('ticket:called', handleQueueUpdate);
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  });

  onDestroy(() => {
    if (socket) {
      socket.off('connect'); socket.off('disconnect');
      socket.off('queue:updated', handleQueueUpdate); socket.off('ticket:called', handleQueueUpdate);
      socket.emit('leave-branch', branch);
    }
  });
</script>

<svelte:head><title>MC Announcer - {branch}</title></svelte:head>

<div class="min-h-screen bg-white">
  <!-- Header -->
  <header class="border-b border-gray-200 bg-white sticky top-0 z-10">
    <div class="max-w-full mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="bg-gray-100 text-gray-900 px-4 py-2 rounded-full font-semibold text-sm">
            {branch}
          </div>
          <h1 class="text-2xl font-bold text-gray-900">MC Announcer</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
            <div class="w-2 h-2 rounded-full {isConnected ? 'bg-green-500' : 'bg-red-500'}"></div>
            <span class="text-sm text-gray-600">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
          <div class="text-sm text-gray-500">
            {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-full mx-auto px-4 py-4">
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table class="w-full table-fixed">
        <!-- Model Names Header -->
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            {#each ticketsByModel as modelGroup (modelGroup.model)}
              <th class="px-2 py-2 text-center text-xs font-semibold text-gray-900">
                <div class="truncate" title={modelGroup.model}>
                  {modelGroup.model}
                </div>
              </th>
            {/each}
          </tr>
        </thead>

        <tbody>
          <!-- Now Serving Row -->
          <tr class="border-b border-gray-200 bg-blue-50">
            {#each ticketsByModel as modelGroup (modelGroup.model)}
              <td class="px-2 py-3 align-top">
                <div class="mb-1.5 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-semibold uppercase">
                    Serving
                  </span>
                </div>
                {#if modelGroup.serving}
                  <div in:scale={{ duration: 300 }}>
                    <div class="bg-white rounded-lg p-2.5 border border-blue-200 hover:border-blue-300 transition-all text-center">
                      <div class="text-2xl font-bold text-gray-900 mb-1">{modelGroup.serving.queueNo}</div>
                      <div class="text-xs font-semibold text-gray-900 leading-tight mb-1" title="{modelGroup.serving.fullName}">
                        {modelGroup.serving.fullName}
                      </div>
                      <div class="text-[10px] text-gray-500 leading-tight">SC: {modelGroup.serving.salesConsultant || 'N/A'}</div>
                    </div>
                  </div>
                {:else}
                  <div class="flex items-center justify-center h-24 bg-gray-50 rounded-lg border border-gray-200">
                    <span class="text-gray-300 text-2xl">—</span>
                  </div>
                {/if}
              </td>
            {/each}
          </tr>

          <!-- Next Up Row -->
          <tr class="bg-gray-50 border-b border-gray-200">
            {#each ticketsByModel as modelGroup (modelGroup.model)}
              <td class="px-2 py-3 align-top">
                <div class="mb-1.5 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-semibold uppercase">
                    Next
                  </span>
                </div>
                {#if modelGroup.nextWaiting}
                  <div in:scale={{ duration: 300, delay: 100 }}>
                    <div class="bg-white rounded-lg p-2.5 border border-gray-200 hover:border-gray-300 transition-all text-center">
                      <div class="text-xl font-bold text-gray-900 mb-1">{modelGroup.nextWaiting.queueNo}</div>
                      <div class="text-xs font-semibold text-gray-700 leading-tight mb-1" title="{modelGroup.nextWaiting.fullName}">
                        {modelGroup.nextWaiting.fullName}
                      </div>
                      <div class="text-[10px] text-gray-500 leading-tight">SC: {modelGroup.nextWaiting.salesConsultant || 'N/A'}</div>
                    </div>
                  </div>
                {:else}
                  <div class="flex items-center justify-center h-24 bg-white rounded-lg border border-gray-200">
                    <span class="text-gray-300 text-2xl">—</span>
                  </div>
                {/if}
              </td>
            {/each}
          </tr>

          <!-- Waiting List Row -->
          <tr class="bg-white">
            {#each ticketsByModel as modelGroup (modelGroup.model)}
              <td class="px-2 py-3 align-top">
                <div class="mb-1.5 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-semibold uppercase">
                    Waiting ({modelGroup.waitingList?.length || 0})
                  </span>
                </div>
                {#if modelGroup.waitingList && modelGroup.waitingList.length > 0}
                  <div class="space-y-1">
                    {#each modelGroup.waitingList.slice(0, 10) as ticket, index (ticket.id || ticket.queueNo)}
                      <div in:fade={{ duration: 200 }}>
                        <div class="bg-gray-50 rounded p-2 border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div class="flex items-start gap-2">
                            <span class="text-[10px] text-gray-500 font-medium flex-shrink-0 mt-0.5">{index + 1}.</span>
                            <div class="flex-1 min-w-0">
                              <div class="text-xs font-bold text-gray-900 mb-0.5">{ticket.queueNo}</div>
                              <div class="text-[10px] font-semibold text-gray-700 leading-tight break-words" title="{ticket.fullName}">
                                {ticket.fullName}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    {/each}
                    {#if modelGroup.waitingList.length > 10}
                      <div class="text-center text-[10px] text-gray-400 py-1">
                        +{modelGroup.waitingList.length - 10} more
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div class="flex items-center justify-center h-12 bg-gray-50 rounded-lg border border-gray-200">
                    <span class="text-gray-400 text-xs">No waiting</span>
                  </div>
                {/if}
              </td>
            {/each}
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</div>
