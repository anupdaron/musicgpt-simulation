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

// Store for user credits (simulated per socket)
const userCredits = new Map();
const INITIAL_CREDITS = 120;
const CREDITS_PER_GENERATION = 20;

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
const FAILURE_RATE = 0.1; // 10% failure rate

// Simulate a single generation (each card gets its own progress)
function simulateSingleGeneration(
  io,
  socketId,
  generationId,
  prompt,
  deductCreditsOnComplete = false,
) {
  const willFail = Math.random() < FAILURE_RATE; // 30% failure rate
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

      // Deduct credits on successful completion
      if (deductCreditsOnComplete) {
        const currentCredits = userCredits.get(socketId) ?? INITIAL_CREDITS;
        const newCredits = Math.max(0, currentCredits - CREDITS_PER_GENERATION);
        userCredits.set(socketId, newCredits);

        io.to(socketId).emit('CREDITS_UPDATED', {
          credits: newCredits,
        });
      }

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
  const currentCredits = userCredits.get(socketId) ?? INITIAL_CREDITS;

  // Check credits first - if not enough, emit single insufficient credits event
  if (currentCredits < CREDITS_PER_GENERATION) {
    io.to(socketId).emit('INSUFFICIENT_CREDITS', {
      prompt,
    });
    return;
  }

  const covers = [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop',
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

  // Emit paired generation started (creates cards on frontend)
  io.to(socketId).emit('PAIRED_GENERATION_STARTED', {
    groupId,
    prompt,
    coverImage,
    title,
    generationIds: [`${groupId}_v1`, `${groupId}_v2`],
  });

  // Start both generations with slight stagger (credits deducted on completion)
  setTimeout(() => {
    simulateSingleGeneration(io, socketId, `${groupId}_v1`, prompt, true);
  }, 0);

  setTimeout(() => {
    simulateSingleGeneration(io, socketId, `${groupId}_v2`, prompt, true);
  }, 300);
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

    // Initialize credits for new user
    userCredits.set(socket.id, INITIAL_CREDITS);
    socket.emit('CREDITS_UPDATED', { credits: INITIAL_CREDITS });

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

      // Clean up credits for this socket
      userCredits.delete(socket.id);

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
