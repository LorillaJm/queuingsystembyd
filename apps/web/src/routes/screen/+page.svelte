<script>
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { getSocket } from '$lib/socket';
  import { getCars, API_URL } from '$lib/api';
  import { fade, scale } from 'svelte/transition';

  let socket, branch = 'MAIN', isConnected = false, cars = [], tickets = [], audioElement;
  $: branchParam = $page.url.searchParams.get('branch');
  $: if (branchParam) branch = branchParam.toUpperCase();
  $: ticketsByModel = groupTicketsByModel(tickets, cars);

  // Available car models for display (only these 8 base models)
  const displayModels = [
    { base: 'atto 3', display: 'BYD Atto 3' },
    { base: 'dolphin', display: 'BYD Dolphin' },
    { base: 'emax 7', display: 'BYD eMax 7' },
    { base: 'shark 6', display: 'BYD Shark 6' },
    { base: 'seal 5', display: 'BYD Seal 5' },
    { base: 'sealion 5', display: 'BYD Sealion 5' },
    { base: 'tang', display: 'BYD Tang' },
    { base: 'seagull', display: 'BYD Seagull' }
  ];

  function getBaseModel(modelName) {
    const normalized = modelName.toLowerCase().replace('byd ', '').trim();
    const found = displayModels.find(dm => normalized.startsWith(dm.base));
    return found ? found.display : null;
  }

  function groupTicketsByModel(tickets, cars) {
    const grouped = {};
    
    // Initialize with the 8 display models
    displayModels.forEach(dm => {
      grouped[dm.display] = { model: dm.display, serving: null };
    });
    
    // Add serving tickets, grouping variants into base models
    tickets.forEach(ticket => {
      const baseModel = getBaseModel(ticket.model);
      if (baseModel && grouped[baseModel] && ticket.status === 'SERVING') {
        // Only show the first serving ticket for each base model
        if (!grouped[baseModel].serving) {
          grouped[baseModel].serving = ticket;
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
      const response = await fetch(`${API_URL}/api/registrations?branch=${branch}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      if (data.success) { 
        tickets = data.data.registrations || [];
        console.log('Screen updated at', new Date().toLocaleTimeString(), '- tickets:', tickets.length);
        console.log('Serving tickets:', tickets.filter(t => t.status === 'SERVING').map(t => `${t.queueNo} - ${t.fullName}`));
      }
    } catch (err) { 
      console.error('Failed to fetch tickets:', err); 
    }
  }

  function playNotificationSound() {
    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(err => console.log('Audio play failed:', err));
    }
  }

  function handleQueueUpdate(data) { 
    console.log('Queue update received:', data);
    if (!data.branch || data.branch === branch) {
      fetchTickets();
      playNotificationSound();
    }
  }

  function handleTicketCalled(data) {
    console.log('Ticket called:', data);
    if (!data.branch || data.branch === branch) {
      fetchTickets();
      playNotificationSound();
    }
  }

  function handleTicketCompleted(data) {
    console.log('Ticket completed:', data);
    if (!data.branch || data.branch === branch) {
      fetchTickets();
    }
  }

  onMount(() => {
    console.log('Screen mounted for branch:', branch);
    fetchCars(); 
    fetchTickets(); 
    socket = getSocket();
    
    socket.on('connect', () => { 
      console.log('Socket connected');
      isConnected = true; 
      socket.emit('join-branch', branch);
      fetchTickets(); // Fetch immediately on connect
    });
    
    socket.on('disconnect', () => { 
      console.log('Socket disconnected');
      isConnected = false; 
    });
    
    // Listen to all queue-related events
    socket.on('queue:updated', handleQueueUpdate);
    socket.on('ticket:called', handleTicketCalled);
    socket.on('ticket:completed', handleTicketCompleted);
    socket.on('ticket:serving', handleTicketCalled);
    socket.on('ticket:noshow', handleTicketCompleted);
    
    // Refresh every 2 seconds as backup
    const interval = setInterval(fetchTickets, 2000);
    return () => clearInterval(interval);
  });

  onDestroy(() => {
    if (socket) {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('queue:updated', handleQueueUpdate);
      socket.off('ticket:called', handleTicketCalled);
      socket.off('ticket:completed', handleTicketCompleted);
      socket.off('ticket:serving', handleTicketCalled);
      socket.off('ticket:noshow', handleTicketCompleted);
      socket.emit('leave-branch', branch);
    }
  });
</script>

<svelte:head>
  <title>Now Serving - {branch}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700;900&display=swap" rel="stylesheet">
</svelte:head>

<audio bind:this={audioElement} preload="auto">
  <source src="/notification.mp3" type="audio/mpeg">
  <source src="/notification.ogg" type="audio/ogg">
</audio>

<div class="screen-container">
  <!-- Header -->
  <div class="header">
    <div class="branch-badge">{branch}</div>
    <div class="title">Now Serving</div>
    <div class="connection-indicator" class:connected={isConnected}>
      <div class="indicator-dot"></div>
    </div>
  </div>

  <!-- Grid Layout -->
  <div class="grid-container">
    {#each ticketsByModel as modelGroup (modelGroup.model)}
      <div class="model-card">
        <div class="model-name">{modelGroup.model}</div>
        
        {#if modelGroup.serving}
          <div class="serving-info" in:scale={{ duration: 400 }}>
            <div class="queue-number">{modelGroup.serving.queueNo}</div>
            <div class="customer-name-large">{modelGroup.serving.fullName}</div>
            {#if modelGroup.serving.salesConsultant}
              <div class="sc-name">SC: {modelGroup.serving.salesConsultant}</div>
            {/if}
          </div>
        {:else}
          <div class="empty-state">—</div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="timestamp">
      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
      <span style="margin-left: 10px; font-size: 0.7rem; opacity: 0.7;">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'} • Auto-refresh: 2s
      </span>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #ffffff;
  }

  .screen-container {
    width: 100vw;
    height: 100vh;
    background: #ffffff;
    color: #111111;
    display: flex;
    flex-direction: column;
    font-family: 'Source Sans Pro', ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    border-bottom: 1px solid #E5E7EB;
    background: #ffffff;
  }

  .branch-badge {
    padding: 0.375rem 0.875rem;
    background: #F3F4F6;
    border-radius: 9999px;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #6B7280;
  }

  .title {
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #111111;
  }

  .connection-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .indicator-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #EF4444;
    animation: pulse-red 2s infinite;
  }

  .connection-indicator.connected .indicator-dot {
    background: #10B981;
    animation: pulse-green 2s infinite;
  }

  @keyframes pulse-red {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes pulse-green {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  /* Grid Container - Fixed 4x2 for 8 models */
  .grid-container {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 1.25rem;
    padding: 1.5rem 2rem;
    overflow: hidden;
    background: #F9FAFB;
  }

  /* For larger screens */
  @media (min-width: 1920px) {
    .grid-container {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 1.5rem;
      padding: 2rem 2.5rem;
    }
  }

  /* For medium screens */
  @media (max-width: 1366px) {
    .grid-container {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 1rem;
      padding: 1.25rem 1.5rem;
    }
  }

  /* Model Card */
  .model-card {
    background: #ffffff;
    border: 1px solid #E5E7EB;
    border-radius: 1.25rem;
    padding: 1.75rem 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: all 0.2s ease-out;
    min-height: 0;
  }

  .model-card:hover {
    border-color: #D1D5DB;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .model-name {
    font-size: 1.375rem;
    font-weight: 700;
    color: #111111;
    margin-bottom: 1.25rem;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .serving-info {
    width: 100%;
  }

  .queue-number {
    font-size: 4rem;
    font-weight: 900;
    line-height: 1;
    color: #111111;
    margin-bottom: 0.875rem;
    letter-spacing: -0.03em;
  }

  .customer-name-large {
    font-size: 1.375rem;
    font-weight: 700;
    color: #111111;
    margin-bottom: 0.625rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
  }

  .sc-name {
    font-size: 0.8rem;
    color: #6B7280;
    font-weight: 400;
  }

  .empty-state {
    font-size: 4.5rem;
    color: #E5E7EB;
    font-weight: 300;
  }

  /* Footer */
  .footer {
    padding: 0.75rem;
    text-align: center;
    border-top: 1px solid #E5E7EB;
    background: #ffffff;
  }

  .timestamp {
    font-size: 0.8rem;
    color: #9CA3AF;
    font-weight: 400;
  }

  /* Responsive adjustments */
  @media (max-width: 1920px) {
    .title {
      font-size: 1.75rem;
    }
  }

  @media (max-width: 1366px) {
    .title {
      font-size: 2rem;
    }
    
    .model-name {
      font-size: 1.25rem;
    }
    
    .queue-number {
      font-size: 4rem;
    }
    
    .customer-name-large {
      font-size: 1.25rem;
    }
  }

  @media (max-width: 1024px) {
    .title {
      font-size: 1.75rem;
    }
    
    .model-name {
      font-size: 1.125rem;
    }
    
    .queue-number {
      font-size: 3.5rem;
    }
  }

  @media (min-width: 1920px) {
    .model-name {
      font-size: 1.75rem;
    }
  }
</style>
