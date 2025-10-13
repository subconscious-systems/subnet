# API Documentation - Introduction

Source: https://docs.subconscious.dev/api-reference/introduction

## Welcome

Our API is designed with simplicity in mind. We currently support one primary endpoint that's fully OpenAI-compatible, making it incredibly easy to start experimenting with our TIM inference engines immediately. Simply swap out your OpenAI API key and endpoint, and you're ready to go.

## Current Offerings

Right now, we focus on doing one thing exceptionally well: **chat completions**. Our `/chat/completions` endpoint is fully compatible with OpenAI's API format, so you can integrate our TIM engines into your existing workflows without any code changes. We're adding a lot more functionality in the near future, but we wanted to release something as quickly as possible to get your feedback.

## Authentication

All API endpoints are authenticated using Bearer tokens. Simply include your API key in the Authorization header:

```json
"security": [
  {
    "bearerAuth": []
  }
]
```

Get started by generating your API key on the Subconscious platform and making your first request to experience the power of TIM engines.

