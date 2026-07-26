from functools import lru_cache

from fastembed import TextEmbedding

MODEL_NAME = "BAAI/bge-small-en-v1.5"  # 384-dim, ONNX runtime -- no PyTorch needed


@lru_cache
def _model() -> TextEmbedding:
    # Vercel's Python runtime has a read-only filesystem except /tmp, where
    # fastembed needs to download and cache its ONNX model on cold start.
    return TextEmbedding(model_name=MODEL_NAME, cache_dir="/tmp/fastembed_cache")


def embed(text: str) -> list[float]:
    vector = next(_model().embed([text]))
    return vector.tolist()
