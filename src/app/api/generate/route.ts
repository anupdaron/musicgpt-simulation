import { NextRequest, NextResponse } from 'next/server';
import { generateId, generateWaveformData, getRandomCover } from '@/lib/utils';

// Store active generations (in-memory for simulation)
const activeGenerations = new Map<
  string,
  {
    prompt: string;
    progress: number;
    status: 'pending' | 'generating' | 'completed' | 'failed';
  }
>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const generationId = generateId();

    // Store generation
    activeGenerations.set(generationId, {
      prompt: prompt.trim(),
      progress: 0,
      status: 'pending',
    });

    // Generate response
    const generation = {
      id: generationId,
      prompt: prompt.trim(),
      title: generateTitleFromPrompt(prompt),
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      versions: [],
      coverImage: getRandomCover(),
    };

    return NextResponse.json({
      success: true,
      generation,
    });
  } catch (error) {
    console.error('Generation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return all active generations
  const generations = Array.from(activeGenerations.entries()).map(
    ([id, data]) => ({
      id,
      ...data,
    })
  );

  return NextResponse.json({ generations });
}

function generateTitleFromPrompt(prompt: string): string {
  const words = prompt.split(' ').filter((w) => w.length > 3);
  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return prompt.slice(0, 30);
}
