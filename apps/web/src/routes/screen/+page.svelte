<script>
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { getSocket } from '$lib/socket';
  import { getCars } from '$lib/api';
  import { fade, scale } from 'svelte/transition';

  let socket, branch = 'MAIN', isConnected = false, cars = [], tickets = [], audioElement;
  $: branchParam = $page.url.searchParams.get('branch');
  $: if (branchParam) branch = branchParam.toUpperCase();
  $: ticketsByModel = groupTicketsByModel(tickets, cars);

  function groupTicketsByModel(tickets, cars) {
    const grouped = {};
    cars.forEach(car => { grouped[car.model] = { model: car.model, serving: null }; });
    
    tickets.forEach(ticket => {
      if (grouped[ticket.model] && ticket.status === 'SERVING') {
        grouped[ticket.model].serving = ticket;
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
      }
    } catch (err) { console.error('Failed to fetch tickets:', err); }
  }

  function playNotificationSound() {
    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(err => console.log('Audio play failed:', err));
    }
  }

  function handleQueueUpdate(data) { 
    if (!data.branch || data.branch === branch) {
      fetchTickets();
      playNotificationSound();
    }
  }

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
      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
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

  /* Grid Container */
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
    .grid-container {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
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
    .grid-container {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: auto;
      gap: 1.5rem;
      padding: 2rem;
    }
    
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

  /* For 8 models, use 2 rows of 4 */
  @media (min-width: 1920px) {
    .grid-container {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
    }
    
    .model-name {
      font-size: 1.75rem;
    }
  }
</style>
