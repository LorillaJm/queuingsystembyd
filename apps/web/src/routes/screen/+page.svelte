<script>
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { getSocket } from '$lib/socket';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  let socket;
  let nowServing = null;
  let nextUp = [];
  let branch = 'MAIN';
  let isConnected = false;
  let previousServing = null;
  let audioElement;

  // Get branch from query param
  $: {
    const branchParam = $page.url.searchParams.get('branch');
    if (branchParam) {
      branch = branchParam.toUpperCase();
    }
  }

  async function fetchQueue() {
    try {
      const response = await fetch(`http://localhost:3001/api/registrations?branch=${branch}`);
      const data = await response.json();
      
      if (data.success) {
        const tickets = data.data.registrations || [];
        
        // Find currently serving (first SERVING ticket)
        const serving = tickets.find(t => t.status === 'SERVING');
        
        // Check if serving number changed
        const servingChanged = nowServing?.queueNo !== serving?.queueNo;
        
        // Update previous before changing current
        if (servingChanged && serving) {
          previousServing = nowServing;
          playNotificationSound();
        }
        
        nowServing = serving || null;
        
        // Get next 3 waiting tickets
        const waiting = tickets
          .filter(t => t.status === 'WAITING')
          .sort((a, b) => {
            const numA = parseInt(a.queueNo.replace(/\D/g, ''));
            const numB = parseInt(b.queueNo.replace(/\D/g, ''));
            return numA - numB;
          })
          .slice(0, 3);
        
        nextUp = waiting;
      }
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    }
  }

  function playNotificationSound() {
    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(err => {
        console.log('Audio play failed:', err);
      });
    }
  }

  function handleQueueUpdate(data) {
    // Only update if it's for our branch
    if (!data.branch || data.branch === branch) {
      fetchQueue();
    }
  }

  function handleTicketCalled(data) {
    // Only update if it's for our branch
    if (!data.branch || data.branch === branch) {
      fetchQueue();
    }
  }

  onMount(() => {
    // Initial fetch
    fetchQueue();
    
    // Setup Socket.io
    socket = getSocket();
    
    socket.on('connect', () => {
      console.log('Connected to server');
      isConnected = true;
      // Join branch-specific room if needed
      socket.emit('join-branch', branch);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      isConnected = false;
    });
    
    socket.on('queue:updated', handleQueueUpdate);
    socket.on('ticket:called', handleTicketCalled);
    
    // Refresh every 10 seconds as backup
    const interval = setInterval(fetchQueue, 10000);
    
    return () => {
      clearInterval(interval);
    };
  });

  onDestroy(() => {
    if (socket) {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('queue:updated', handleQueueUpdate);
      socket.off('ticket:called', handleTicketCalled);
      socket.emit('leave-branch', branch);
    }
  });
</script>

<svelte:head>
  <title>Queue Display - {branch}</title>
</svelte:head>

<!-- Hidden audio element for notification sound -->
<audio bind:this={audioElement} preload="auto">
  <source src="/notification.mp3" type="audio/mpeg">
  <source src="/notification.ogg" type="audio/ogg">
</audio>

<div class="screen-container">
  <!-- Connection indicator -->
  <div class="connection-indicator" class:connected={isConnected}>
    <div class="indicator-dot"></div>
  </div>

  <!-- Branch indicator -->
  <div class="branch-badge">
    {branch}
  </div>

  <!-- Main content -->
  <div class="content">
    <!-- Now Serving Section -->
    <div class="now-serving-section">
      <div class="label">NOW SERVING</div>
      
      <div class="serving-number">
        {#if nowServing}
          {#key nowServing.queueNo}
            <div 
              class="number"
              in:fly="{{ y: -100, duration: 800, easing: quintOut }}"
              out:fade="{{ duration: 400 }}"
            >
              {nowServing.queueNo}
            </div>
          {/key}
        {:else}
          <div class="number empty">—</div>
        {/if}
      </div>
    </div>

    <!-- Next Up Section -->
    <div class="next-section">
      <div class="label">NEXT</div>
      
      <div class="next-numbers">
        {#each Array(3) as _, i}
          <div class="next-item">
            {#if nextUp[i]}
              {#key nextUp[i].queueNo}
                <div 
                  class="next-number"
                  in:fly="{{ x: -50, duration: 600, delay: i * 100, easing: quintOut }}"
                  out:fade="{{ duration: 300 }}"
                >
                  {nextUp[i].queueNo}
                </div>
              {/key}
            {:else}
              <div class="next-number empty">—</div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Footer with timestamp -->
  <div class="footer">
    <div class="timestamp">
      {new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })}
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #0a0a0a;
  }

  .screen-container {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
    color: #ffffff;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Connection indicator */
  .connection-indicator {
    position: absolute;
    top: 2rem;
    right: 2rem;
    z-index: 10;
  }

  .indicator-dot {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
    animation: pulse-red 2s infinite;
  }

  .connection-indicator.connected .indicator-dot {
    background: #10b981;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
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

  /* Branch badge */
  .branch-badge {
    position: absolute;
    top: 2rem;
    left: 2rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  /* Main content */
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4rem;
    gap: 4rem;
  }

  /* Now Serving Section */
  .now-serving-section {
    text-align: center;
    width: 100%;
  }

  .now-serving-section .label {
    font-size: 3rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
    text-transform: uppercase;
  }

  .serving-number {
    position: relative;
    min-height: 20rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .serving-number .number {
    font-size: 16rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    position: absolute;
  }

  .serving-number .number.empty {
    color: rgba(255, 255, 255, 0.2);
    -webkit-text-fill-color: rgba(255, 255, 255, 0.2);
  }

  /* Next Section */
  .next-section {
    width: 100%;
    text-align: center;
  }

  .next-section .label {
    font-size: 2.5rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 2rem;
    text-transform: uppercase;
  }

  .next-numbers {
    display: flex;
    justify-content: center;
    gap: 3rem;
  }

  .next-item {
    position: relative;
    min-width: 12rem;
    min-height: 10rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .next-number {
    font-size: 5rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: #ffffff;
    position: absolute;
  }

  .next-number.empty {
    color: rgba(255, 255, 255, 0.2);
  }

  /* Footer */
  .footer {
    padding: 2rem;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .timestamp {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 300;
  }

  /* Responsive adjustments for different screen sizes */
  @media (max-width: 1920px) {
    .serving-number .number {
      font-size: 14rem;
    }
    
    .next-number {
      font-size: 4.5rem;
    }
  }

  @media (max-width: 1366px) {
    .serving-number .number {
      font-size: 12rem;
    }
    
    .next-section .label {
      font-size: 2rem;
    }
    
    .next-number {
      font-size: 4rem;
    }
    
    .next-item {
      min-width: 10rem;
      min-height: 8rem;
    }
  }

  @media (max-width: 1024px) {
    .serving-number .number {
      font-size: 10rem;
    }
    
    .now-serving-section .label {
      font-size: 2.5rem;
    }
    
    .next-number {
      font-size: 3.5rem;
    }
    
    .next-item {
      min-width: 8rem;
      min-height: 7rem;
    }
  }

  /* Landscape orientation optimization */
  @media (orientation: landscape) and (max-height: 800px) {
    .content {
      gap: 2rem;
      padding: 2rem;
    }
    
    .serving-number {
      min-height: 15rem;
    }
    
    .serving-number .number {
      font-size: 10rem;
    }
    
    .now-serving-section .label {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    
    .next-section .label {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  }
</style>
