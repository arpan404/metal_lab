import { NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/elevens-lab';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ message: 'Text is required' }, { status: 400 });
    }

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Audio generation timeout')), 15000);
    });

    const audioPromise = generateSpeech(text);
    
    const audio = await Promise.race([audioPromise, timeoutPromise]) as ReadableStream;

    // Convert ReadableStream to Buffer with timeout
    const reader = audio.getReader();
    const chunks: Uint8Array[] = [];
    const startTime = Date.now();
    
    while (true) {
      // Check for timeout during stream reading
      if (Date.now() - startTime > 20000) {
        throw new Error('Audio stream reading timeout');
      }
      
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
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/audio/generate:', error);
    
    // Don't crash on connection errors
    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
      console.log('Audio service connection error - returning 503');
      return NextResponse.json(
        { message: 'Audio service temporarily unavailable' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: 'Server error', error: String(error) },
      { status: 500 }
    );
  }
}
