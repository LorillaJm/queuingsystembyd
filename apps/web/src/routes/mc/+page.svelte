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

  function groupTicketsByModel(tickets, cars) {
    const grouped = {};
    cars.forEach(car => { grouped[car.model] = { model: car.model, serving: null, nextWaiting: null, waitingList: [] }; });
    
    // Sort tickets by queue number to ensure proper order
    const sortedTickets = [...tickets].sort((a, b) => {
      const numA = parseInt(a.queueNo.replace(/\D/g, ''));
      const numB = parseInt(b.queueNo.replace(/\D/g, ''));
      return numA - numB;
    });
    
    sortedTickets.forEach(ticket => {
      if (grouped[ticket.model]) {
        if (ticket.status === 'SERVING') {
          grouped[ticket.model].serving = ticket;
        } else if (ticket.status === 'WAITING') {
          // First waiting customer becomes "next"
          if (!grouped[ticket.model].nextWaiting) {
            grouped[ticket.model].nextWaiting = ticket;
          } else {
            // All other waiting customers go to the waiting list
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

<div class="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
  <!-- Compact Header -->
  <header class="bg-white/80 backdrop-blur-xl border-b border-slate-200 flex-shrink-0">
    <div class="max-w-full mx-auto px-4 py-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-gradient-to-r from-red-600 to-rose-600 text-white px-3 py-1 rounded-lg font-semibold text-xs tracking-wide">
            {branch}
          </div>
          <h1 class="text-lg font-bold text-slate-900">MC Announcer</h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-lg">
            <div class="w-1.5 h-1.5 rounded-full {isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}"></div>
            <span class="text-xs text-slate-600">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
          <div class="text-xs text-slate-500">
            {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Event Banner -->
  <div class="flex-shrink-0 bg-gradient-to-r from-red-700 via-red-600 to-red-700 border-y-4 border-yellow-400 relative overflow-hidden">
    <!-- Decorative pattern overlay -->
    <div class="absolute inset-0 opacity-10" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px);"></div>
    
    <div class="relative px-6 py-3 flex items-center justify-between">
      <!-- Left decoration -->
      <div class="flex items-center gap-2">
        <div class="text-yellow-300 text-2xl">🏮</div>
        <div class="hidden sm:block text-yellow-300 text-xl">🎊</div>
      </div>
      
      <!-- Center content -->
      <div class="text-center flex-1">
        <div class="text-yellow-300 text-xs font-bold tracking-widest mb-0.5">BYD ILOILO PRESENTS</div>
        <div class="text-white font-bold text-lg sm:text-xl tracking-wide drop-shadow-lg">
          PROSPERITY IN MOTION
        </div>
        <div class="text-yellow-200 text-xs mt-0.5 font-medium">
          Fuel Your Fortune • February 28, 2026
        </div>
      </div>
      
      <!-- Right decoration -->
      <div class="flex items-center gap-2">
        <div class="hidden sm:block text-yellow-300 text-xl">🎊</div>
        <div class="text-yellow-300 text-2xl">🏮</div>
      </div>
    </div>
    
    <!-- Bottom decorative border -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>
  </div>

  <!-- Main Content - Fills remaining space -->
  <main class="flex-1 overflow-auto px-4 py-3">
    <div class="bg-white rounded-xl shadow-lg h-full overflow-auto">
      <table class="w-full border-collapse table-fixed">
        <!-- Model Names Header -->
        <thead class="sticky top-0 z-10">
          <tr class="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-300">
            {#each ticketsByModel as modelGroup (modelGroup.model)}
              <th class="px-2 py-2 text-center text-xs font-bold text-slate-900 leading-tight" style="width: {100 / ticketsByModel.length}%">
                <div class="truncate" title={modelGroup.model}>
                  {modelGroup.model}
                </div>
              </th>
            {/each}
          </tr>
        </thead>

        <tbody>
          <!-- Now Serving Row -->
          <tr class="border-b border-slate-200 bg-red-50/30">
            {#each ticketsByModel as modelGroup (modelGroup.model)}
              <td class="px-2 py-3 align-top">
                <div class="mb-1 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-bold uppercase tracking-wide">
                    Serving
                  </span>
                </div>
                {#if modelGroup.serving}
                  <div in:scale={{ duration: 300 }}>
                    <div class="bg-gradient-to-br from-red-500 to-rose-600 rounded-lg p-2 text-white shadow-md hover:shadow-lg transition-all duration-300">
                      <div class="text-lg font-bold tracking-tight">{modelGroup.serving.queueNo}</div>
                      <div class="text-[10px] font-medium opacity-90 truncate" title={modelGroup.serving.fullName}>
                        {modelGroup.serving.fullName}
                      </div>
                    </div>
                  </div>
                {:else}
                  <div class="flex items-center justify-center h-16 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <span class="text-slate-400 text-lg">—</span>
                  </div>
                {/if}
              </td>
            {/each}
          </tr>

          <!-- Next Up Row -->
          <tr class="bg-slate-50/50 border-b border-slate-200">
            {#each ticketsByModel as modelGroup (modelGroup.model)}
              <td class="px-2 py-3 align-top">
                <div class="mb-1 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wide">
                    Next
                  </span>
                </div>
                {#if modelGroup.nextWaiting}
                  <div in:scale={{ duration: 300, delay: 100 }}>
                    <div class="bg-white rounded-lg p-2 border border-red-200 hover:border-red-300 hover:shadow-sm transition-all duration-300">
                      <div class="text-base font-bold text-red-600">{modelGroup.nextWaiting.queueNo}</div>
                      <div class="text-[10px] text-slate-600 truncate" title={modelGroup.nextWaiting.fullName}>
                        {modelGroup.nextWaiting.fullName}
                      </div>
                    </div>
                  </div>
                {:else}
                  <div class="flex items-center justify-center h-16 bg-white rounded-lg border border-dashed border-slate-200">
                    <span class="text-slate-400 text-lg">—</span>
                  </div>
                {/if}
              </td>
            {/each}
          </tr>

          <!-- Waiting List Row -->
          <tr class="bg-white">
            {#each ticketsByModel as modelGroup (modelGroup.model)}
              <td class="px-2 py-3 align-top">
                <div class="mb-1 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                    Waiting ({modelGroup.waitingList?.length || 0})
                  </span>
                </div>
                {#if modelGroup.waitingList && modelGroup.waitingList.length > 0}
                  <div class="space-y-1">
                    {#each modelGroup.waitingList as ticket (ticket.id || ticket.queueNo)}
                      <div in:fade={{ duration: 200 }}>
                        <div class="bg-amber-50 rounded p-1.5 border border-amber-200 hover:bg-amber-100 transition-colors">
                          <div class="flex items-center justify-between gap-1">
                            <span class="text-xs font-bold text-amber-700">{ticket.queueNo}</span>
                            <span class="text-[9px] text-amber-600 truncate flex-1 text-right" title={ticket.fullName}>
                              {ticket.fullName}
                            </span>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <div class="flex items-center justify-center h-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <span class="text-slate-400 text-xs">No waiting</span>
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
