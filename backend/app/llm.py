from anthropic import Anthropic

from .config import settings

client = Anthropic(api_key=settings.anthropic_api_key)


def summarize_note(title: str, content: str) -> str:
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=300,
        system=(
            "Summarize the user's note in 2-4 plain-text sentences. "
            "Capture the key point and any action items. No markdown, no preamble."
        ),
        messages=[{"role": "user", "content": f"Title: {title}\n\n{content}"}],
    )
    text_block = next(block for block in response.content if block.type == "text")
    return text_block.text
