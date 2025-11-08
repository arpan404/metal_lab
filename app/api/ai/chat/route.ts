

import { xai } from '@ai-sdk/xai'
import { streamText } from 'ai'

export async function POST(req: Request) {
    const { messages } = await req.json()
    const result = streamText({
        model: xai("grok-4-fast-non-reasoning"),
        messages,
    })
    return result.toTextStreamResponse()
}
