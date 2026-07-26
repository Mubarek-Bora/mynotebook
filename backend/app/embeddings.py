import os
from functools import lru_cache

# Vercel's Python runtime has a read-only filesystem except /tmp. fastembed's
# downloader goes through huggingface_hub, which picks its cache location from
# these env vars -- they must be set *before* importing fastembed/huggingface_hub,
# since the default path is resolved at import time.
os.environ.setdefault("HF_HOME", "/tmp/hf_cache")
os.environ.setdefault("HF_HUB_CACHE", "/tmp/hf_cache/hub")
os.environ.setdefault("XDG_CACHE_HOME", "/tmp/xdg_cache")

from fastembed import TextEmbedding  # noqa: E402

MODEL_NAME = "BAAI/bge-small-en-v1.5"  # 384-dim, ONNX runtime -- no PyTorch needed


@lru_cache
def _model() -> TextEmbedding:
    return TextEmbedding(model_name=MODEL_NAME, cache_dir="/tmp/fastembed_cache")


def embed(text: str) -> list[float]:
    vector = next(_model().embed([text]))
    return vector.tolist()
