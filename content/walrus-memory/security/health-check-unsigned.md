---
title: "Unsigned Health Check Rationale"
description: >-
  Design rationale for leaving the Walrus Memory health and version endpoints
  unauthenticated, covering security considerations, load balancer compatibility,
  and rate limiting implications.
keywords:
  - Walrus Memory
  - Walrus Memory
  - health check
  - security
  - unauthenticated endpoint
  - API design
goal:
  description: Explain the deliberate security decision to leave /health and /version unauthenticated, identify what information they expose, and assess whether this is appropriate for your threat model.
  requires:
    - has_frontmatter:
        - title
        - description
        - keywords
      label: Has required frontmatter fields
    - min_words: 100
      label: Needs more content depth
    - has_questions: true
      label: Needs questions for AI search visibility
    - has_answer: true
      label: Needs answer summary for AI citation
questions:
  - "Why are the Walrus Memory health and version endpoints unauthenticated?"
  - "What information do the Walrus Memory health check endpoints expose?"
  - "How is rate limiting handled for the unsigned health endpoint?"
answer: >-
  The health and version endpoints are intentionally unauthenticated because they expose
  no sensitive information, only service status and version metadata. They must remain
  unsigned for compatibility with standard load balancers and orchestrators like
  Kubernetes that cannot sign requests dynamically. You must handle rate limiting for these public
  routes at the ingress or reverse proxy level.
---

## Endpoint
`GET /health` and `GET /version`

## Design decision
The API intentionally leaves the health and version endpoints unauthenticated and unsigned. They do not require a valid Ed25519 signature in headers like the rest of the API.

## Security considerations

1. **No sensitive information:**
   The endpoints return service status, package and API versions, SDK compatibility metadata, feature flags, and documented deprecation notices. They do not expose secrets, environment values, uptime, database state, wallet addresses, or credentials.

2. **Load balancer integration:**
   Standard load balancers, orchestrators (for example, Kubernetes, Railway), and uptime monitoring tools cannot easily sign requests dynamically. Leaving the endpoint public ensures compatibility with external infrastructure components that rely on straightforward HTTP GET probes.

3. **Rate limiting:**
Because it is a public unauthenticated route, it bypasses the standard account-based rate limiter middleware. However, because it performs no database, Redis, LLM, or Walrus operations, the computational path is negligible. If you require layer 7 DDoS protection, handle it at the ingress or frontend reverse proxy level.
