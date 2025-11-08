import { NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/elevens-lab';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ message: 'Text is required' }, { status: 400 });
    }

    const audio = await generateSpeech(text);

    // Convert ReadableStream to Buffer
    const reader = audio.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const buffer = Buffer.concat(chunks);

    // return actual audio response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="speech.mp3"',
      },
    });
  } catch (error) {
    console.error('Error in POST /api/speech:', error);
    return NextResponse.json(
      { message: 'Server error', error: String(error) },
      { status: 500 }
    );
  }
}
