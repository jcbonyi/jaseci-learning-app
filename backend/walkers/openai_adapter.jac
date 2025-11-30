"""openai_adapter.jac - Walker that calls OpenAI's Chat Completions API
NOTE: This walker requires runtime HTTP support."""

walker call_openai {
    has model: str;
    has prompt: str;
    has max_tokens: int = 512;

    can call_api with `root entry {
        # Placeholder - actual implementation requires HTTP support
        return {
            "error": "OpenAI adapter requires HTTP runtime support",
            "model": self.model,
            "prompt": self.prompt
        };
    }
}
