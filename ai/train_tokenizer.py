from datasets import load_dataset
from tokenizers import Tokenizer, models, trainers, pre_tokenizers, decoders
import os

# ----------------------------
# 1. Load a dataset
# ----------------------------
print("📥 Loading dataset...")
dataset = load_dataset("wikitext", "wikitext-2-raw-v1")

def batch_iterator(batch_size=4_000_000):
    for i in range(0, len(dataset["train"]), batch_size):
        yield dataset["train"][i : i + batch_size]["text"]

# ----------------------------
# 2. Initialize a GPT-style ByteLevel BPE tokenizer
# ----------------------------
print("⚙️ Initializing GPT-style tokenizer...")
tokenizer = Tokenizer(models.BPE())

# Byte-level pre-tokenization (splits text into bytes)
tokenizer.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=True)

# Byte-level decoder (reverses the byte mapping)
tokenizer.decoder = decoders.ByteLevel()

# ----------------------------
# 3. Train tokenizer
# ----------------------------
print("🏋️ Training ByteLevel BPE tokenizer (vocab_size=500)...")
trainer = trainers.BpeTrainer(
    vocab_size=500,
    special_tokens=[
        "<|endoftext|>",  # used by GPT models as end-of-text marker
        "<|pad|>",
    ],
    initial_alphabet=pre_tokenizers.ByteLevel.alphabet()
)

tokenizer.train_from_iterator(batch_iterator(), trainer=trainer)

# ----------------------------
# 4. Save tokenizer
# ----------------------------
os.makedirs("gpt_tokenizer_output", exist_ok=True)
tokenizer_path = "gpt_tokenizer_output/gpt_bytelevel_bpe_500.json"
tokenizer.save(tokenizer_path)

print(f"✅ Tokenizer saved to {tokenizer_path}")

# ----------------------------
# 5. Quick test
# ----------------------------
text = "Hello world! This is a tiny GPT-style tokenizer."
encoded = tokenizer.encode(text)

print("\n🔤 Example:")
print("Input:", text)
print("Token IDs:", encoded.ids)
print("Tokens:", encoded.tokens)
print("Decoded:", tokenizer.decode(encoded.ids))
