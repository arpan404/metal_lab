# Generate Audio

To generate the audio, hit `/api/audio/generate` using POST method. 
```ts

export default function DashboardPage() {
  const [text, setText] = useState("Hello, I am AI");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "loading" | null;
    message: string;
  }>({ type: null, message: "" });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateAudio = async () => {
    if (!text.trim()) {
      setStatus({ type: "error", message: "Please enter some text" });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "loading", message: "Generating audio..." });
    setAudioUrl(null);

    try {
      const response = await fetch("/api/audio/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setStatus({
        type: "success",
        message: "✓ Audio generated successfully! Click play below.",
      });

      // Auto-play
      setTimeout(() => {
        audioRef.current?.play().catch((e) => {
          console.log("Auto-play blocked:", e);
        });
      }, 100);
    } catch (error) {
      console.error("Error:", error);
      setStatus({
        type: "error",
        message: `✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      generateAudio();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            🎙️ Text-to-Speech
          </h1>
          <p className="text-gray-600 mb-6">
            Enter text below to generate audio:
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type something like: Hello, I am AI..."
            className="w-full min-h-[120px] p-4 border-2 border-gray-300 rounded-lg text-sm resize-vertical focus:outline-none focus:border-blue-500 transition-colors"
          />

          <button
            onClick={generateAudio}
            disabled={isLoading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Generate Audio"}
          </button>

          {status.type && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                status.type === "success"
                  ? "bg-green-50 text-green-800"
                  : status.type === "error"
                    ? "bg-red-50 text-red-800"
                    : "bg-blue-50 text-blue-800"
              }`}
            >
              {status.message}
            </div>
          )}

          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full mt-4"
            />
          )}

          <p className="text-sm text-gray-500 mt-4">
            💡 Tip: Press <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl</kbd> +{" "}
            <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> to generate
          </p>
        </div>
      </div>
    </div>
  );
}
```
**Note**: We will auto play the audio, audio generation take time, so we will need to make sure that audio and text sync. For that don't show the text before audio is generated.