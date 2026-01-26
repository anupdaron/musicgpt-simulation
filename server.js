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

// Progress messages for generation
const progressMessages = [
  'Initializing...',
  'Analyzing prompt...',
  'Generating melody',
  'Creating harmony',
  'Synthesizing',
  'Mixing audio',
  'Finalizing...',
];

const INVALID_PROMPTS = ['', ' ', 'invalid', 'error'];
const FAILURE_RATE = 0.7; // 70% failure rate

// Simulate a single generation (each card gets its own progress)
function simulateSingleGeneration(io, socketId, generationId, prompt) {
  const willFail = Math.random() < FAILURE_RATE; // 70% failure rate
  const failAtStep = willFail ? randomBetween(2, 5) : -1;
  console.log(prompt);
  const invalidPrompt = INVALID_PROMPTS.includes(prompt.toLowerCase());

  if (invalidPrompt) {
    // Immediate failure for invalid prompts
    io.to(socketId).emit('GENERATION_FAILED', {
      generationId,
      error: 'Invalid prompt provided.',
    });
    return;
  }

  // Each generation has slightly different timing for realistic feel
  const baseInterval = 1200 + randomBetween(-200, 400);
  const progressSteps = [0, 15, 30, 50, 70, 85, 100];
  let stepIndex = 0;

  // Emit initial progress
  io.to(socketId).emit('GENERATION_PROGRESS', {
    generationId,
    progress: progressSteps[0],
    message: progressMessages[0],
  });

  const interval = setInterval(() => {
    stepIndex++;

    // Check for failure
    if (willFail && stepIndex === failAtStep) {
      clearInterval(interval);
      activeGenerations.delete(generationId);

      io.to(socketId).emit('GENERATION_FAILED', {
        generationId,
        error: 'Generation failed. Please retry.',
      });
      return;
    }

    if (stepIndex >= progressSteps.length) {
      clearInterval(interval);
      activeGenerations.delete(generationId);

      // Generation completed
      io.to(socketId).emit('GENERATION_COMPLETE', {
        generationId,
        duration: randomBetween(180, 300),
        waveformData: Array.from(
          { length: 50 },
          () => Math.random() * 0.8 + 0.2,
        ),
      });
      return;
    }

    const progress = progressSteps[stepIndex];
    io.to(socketId).emit('GENERATION_PROGRESS', {
      generationId,
      progress,
      message:
        progressMessages[Math.min(stepIndex, progressMessages.length - 1)],
    });
  }, baseInterval);

  // Store interval for cleanup
  activeGenerations.set(generationId, { interval, socketId });
}

// Simulate paired generations (v1 and v2 as separate cards)
function simulatePairedGenerations(io, socketId, groupId, prompt) {
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

  const coverImage = covers[Math.floor(Math.random() * covers.length)];

  // Emit paired generation started
  io.to(socketId).emit('PAIRED_GENERATION_STARTED', {
    groupId,
    coverImage,
    title,
    generationIds: [`${groupId}_v1`, `${groupId}_v2`],
  });

  // Start both generations with slight stagger
  setTimeout(() => {
    simulateSingleGeneration(io, socketId, `${groupId}_v1`, prompt);
  }, 0);

  setTimeout(() => {
    simulateSingleGeneration(io, socketId, `${groupId}_v2`, prompt);
  }, 300);

  // Emit credits update
  io.to(socketId).emit('CREDITS_UPDATED', {
    credits: Math.max(0, 120 - 20), // Deduct 20 credits
  });
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

    // Handle paired generation start (creates v1 and v2 cards)
    socket.on('START_PAIRED_GENERATION', (data) => {
      const { groupId, prompt } = data;
      console.log(`Starting paired generation: ${groupId}`);

      // Start paired simulation
      simulatePairedGenerations(io, socket.id, groupId, prompt);
    });

    // Handle single generation start (backwards compatible)
    socket.on('START_GENERATION', (data) => {
      const { generationId, prompt } = data;
      console.log(`Starting generation: ${generationId}`);

      // Emit started event
      socket.emit('GENERATION_STARTED', { generationId });

      // Start single simulation
      simulateSingleGeneration(io, socket.id, generationId, prompt);
    });

    // Handle retry
    socket.on('RETRY_GENERATION', (data) => {
      const { generationId, prompt } = data;
      console.log(`Retrying generation: ${generationId}`);

      // Clear any existing generation
      const existing = activeGenerations.get(generationId);
      if (existing) {
        clearInterval(existing.interval);
        activeGenerations.delete(generationId);
      }

      // Reset progress
      socket.emit('GENERATION_PROGRESS', {
        generationId,
        progress: 0,
        message: 'Retrying...',
      });

      // Start new simulation
      simulateSingleGeneration(
        io,
        socket.id,
        generationId,
        prompt || 'Retry prompt',
      );
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Clean up any active generations for this socket
      for (const [key, data] of activeGenerations.entries()) {
        if (data.socketId === socket.id) {
          clearInterval(data.interval);
          activeGenerations.delete(key);
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running on /api/socket/io`);
  });
});
