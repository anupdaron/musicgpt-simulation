const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store for active generations
const activeGenerations = new Map();

// Helper to generate random values
const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Simulate generation process
function simulateGeneration(io, socketId, generationId, prompt) {
  const willFail = Math.random() < 0.15; // 15% failure rate
  const failAtStep = willFail ? randomBetween(1, 3) : -1; // Fail at step 1, 2, or 3

  const progressSteps = [0, 25, 50, 75, 90, 100];
  let stepIndex = 0;

  const progressMessages = [
    'Starting AI audio engine',
    'Analyzing prompt...',
    'Generating melody structure',
    'Synthesizing instruments',
    'Mixing and mastering',
    'Finalizing output',
  ];

  // Emit initial progress (0%) immediately
  io.to(socketId).emit('GENERATION_PROGRESS', {
    generationId,
    progress: progressSteps[0],
    message: progressMessages[0],
  });

  const interval = setInterval(() => {
    stepIndex++;

    if (stepIndex >= progressSteps.length) {
      clearInterval(interval);
      activeGenerations.delete(generationId);

      // Generate completed data
      const versions = [
        {
          id: `${generationId}_v1`,
          version: 1,
          duration: randomBetween(180, 300),
          waveformData: Array.from(
            { length: 50 },
            () => Math.random() * 0.8 + 0.2
          ),
        },
        {
          id: `${generationId}_v2`,
          version: 2,
          duration: randomBetween(180, 300),
          waveformData: Array.from(
            { length: 50 },
            () => Math.random() * 0.8 + 0.2
          ),
        },
      ];

      const covers = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      ];

      // Generate title from prompt
      const words = prompt.split(' ').filter((w) => w.length > 3);
      const title =
        words.length >= 2
          ? words
              .slice(0, 3)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(' ')
          : prompt.slice(0, 30);

      io.to(socketId).emit('GENERATION_COMPLETE', {
        generationId,
        versions,
        coverImage: covers[Math.floor(Math.random() * covers.length)],
        title,
      });

      // Also emit credits update
      io.to(socketId).emit('CREDITS_UPDATED', {
        credits: Math.max(0, 120 - 20), // Deduct 20 credits
      });
      return;
    }

    // Check for failure
    if (willFail && stepIndex === failAtStep) {
      clearInterval(interval);
      activeGenerations.delete(generationId);

      io.to(socketId).emit('GENERATION_FAILED', {
        generationId,
        error: 'Server busy. 4.9K users in the queue.',
      });
      return;
    }

    const progress = progressSteps[stepIndex];

    // Send progress update
    io.to(socketId).emit('GENERATION_PROGRESS', {
      generationId,
      progress,
      message:
        progressMessages[Math.min(stepIndex, progressMessages.length - 1)],
    });
  }, 1500); // Update every 1.5 seconds

  // Store interval for potential cleanup
  activeGenerations.set(generationId, { interval, socketId });
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle generation start
    socket.on('START_GENERATION', (data) => {
      const { generationId, prompt } = data;
      console.log(`Starting generation: ${generationId}`);

      // Emit started event
      socket.emit('GENERATION_STARTED', { generationId });

      // Start simulation
      simulateGeneration(io, socket.id, generationId, prompt);
    });

    // Handle retry
    socket.on('RETRY_GENERATION', (data) => {
      const { generationId, prompt } = data;
      console.log(`Retrying generation: ${generationId}`);

      // Clear any existing simulation
      const existing = activeGenerations.get(generationId);
      if (existing) {
        clearInterval(existing.interval);
        activeGenerations.delete(generationId);
      }

      // Start new simulation
      simulateGeneration(io, socket.id, generationId, prompt || 'Retry prompt');
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Clean up any active generations for this socket
      for (const [genId, data] of activeGenerations.entries()) {
        if (data.socketId === socket.id) {
          clearInterval(data.interval);
          activeGenerations.delete(genId);
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running on /api/socket/io`);
  });
});
