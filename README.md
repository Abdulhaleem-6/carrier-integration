Shipping Carrier Integration Service
A production-ready TypeScript module for fetching real-time shipping rates.
This project demonstrates a clean, scalable architecture designed to handle multiple carriers (UPS, FedEx, DHL) while keeping the core business logic isolated from external API quirks.

⸻

🧠 Architectural Decisions

1️⃣ The Strategy Pattern (ICarrier Interface)
Implements the Strategy Pattern to ensure extensibility.
ShippingService interacts only with the ICarrier contract — it doesn’t know about UPS or any other carrier.
Adding a new carrier simply means creating a new class that follows this interface, with zero changes to core logic.

2️⃣ The “Buffer Zone” (Mapper Layer)
Carrier APIs often have inconsistent structures and field names.
A Mapper layer isolates all API-specific transformations.
This keeps our Domain clean and prevents leaks of UPS-specific details such as MonetaryValue or PostcodePrimaryLow.

✅ Benefits
• Changing or versioning APIs never breaks the business logic.
• Domain remains stable and testable.
• Easier to extend to future carriers.

3️⃣ Stateful OAuth 2.0 Management
UpsAuthManager implements the OAuth 2.0 client-credentials flow with production-grade safeguards:

Feature Description
Caching Tokens are cached and reused until expiry.
Proactive Expiry 60-second buffer avoids mid-request expiration. (Might extend)
Transparent Retries On 401 responses, the token is invalidated, refreshed, and retried once.

4️⃣ Fail-Fast Configuration
Using Zod, environment variables are validated at startup.
If a secret (like UPS_CLIENT_ID) is missing, the app fails fast with a clear error message.

⸻

⚙️ Tech Stack
• Language: TypeScript (ES Modules)
• Validation: Zod
• HTTP Client: Axios
• Testing: Jest + Nock
• Package Manager: pnpm (v8+)
• Node.js: v18+

⸻

🚀 Getting Started

1. Installation

`pnpm install`

2. Environment Setup
   Copy and populate the .env file:

cp .env.example .env

3. Build and Typecheck

`pnpm build`

4. Run Integration Tests
   Mocks UPS API endpoints with Nock to verify:
   • OAuth lifecycle (acquisition, reuse, refresh)
   • Payload mapping
   • Error handling and structured responses

`pnpm test`

5. Start the Service

`pnpm start`

⸻

🗂️ Project Structure

src/
├── domain/ # Business logic, Interfaces, Zod schemas
├── infrastructure/ # External communication (HTTP clients, carrier adapters)
│ └── carriers/ # Carrier-specific integrations (e.g., UPS)
├── services/ # Orchestration logic (ShippingService)
├── errors/ # Structured error classes
└── config/ # Env validation and runtime configuration

⸻

🧩 Design Principles

Principle Description
Clean Separation Domain logic is carrier-agnostic; each carrier lives in isolation.
Extensibility New carriers plug in without altering existing code.
Resilience Fail-fast config, retry logic, and structured errors for predictable recovery.
Testability End-to-end tests stub all external APIs; pure mappers unit-tested.

⸻

📈 Future Improvements
• Shared Token Store:
Move token caching to Redis or another shared store for multi-instance deployments.
• Circuit Breaker:
Use a resilience library like opossum to protect against repeated carrier failures.
• Request Correlation:
Include correlationId in logs to trace a shipping request across multiple carriers.
• Metrics & Observability:
Expose Prometheus counters for request latency, token refreshes, and carrier failures.

⸻

✅ Deliverables
• Source Code (TypeScript + tests)
• .env.example for required secrets
• Integration tests validating rate-shopping, OAuth lifecycle, and error handling
• README (this file)

⸻

Notes
• No live UPS credentials required — all API calls are stubbed.
• Mappers follow the official UPS Rating API documentation.
• Code structure and naming conventions align with maintainable production modules.

⸻
