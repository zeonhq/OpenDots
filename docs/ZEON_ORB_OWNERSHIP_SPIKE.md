# Zeon Orb / Orbit ownership spike (OpenDots)

**Audience:** Otis Zeon / Hari  
**Fork:** https://github.com/zeonhq/OpenDots  
**Lab path:** `/Users/aeon/workspace/zeonhq/_thirdparty/OpenDots`  
**Date:** 2026-10-01 (PT)  
**Status:** spike plan + Naya answers accepted (2026-10-01 PT) — no bake, no Goose replace, no secrets

Pointer from nayaOS: `nayaOS/product/OPENDOTS_ORB_OWNERSHIP_SPIKE.md`

---

## 1. Intent

Own **Orb / Orbit** product surface by reshaping OpenDots UI and architecture the same way Goose was adopted for the agent runtime: keep the useful shells (Dot≈Orb, Space≈Orbit, Threads≈chat, Computer≈Max, review cards≈approval), strip CopilotKit Intelligence and any outside SaaS for conversation data, run **lab-only on localhost Docker**, and eventually ship as a **bespoke app inside nayaOS** (and maybe Zeon OS / Aeon later). Goose remains the Orb runtime in **nayaORB** until something better is verified. Sensitive conversation data must stay in Zeon systems.

---

## 2. Keep / replace / drop

| Area | Decision | Notes |
|------|----------|--------|
| UI shells (App, SpaceNav, SpaceWorkspace, SpaceLibrary, Chat, ThreadList, ComputerPanel, Page*, editor) | **Keep** (reshape) | Map Dot→Orb, Space→Orbit, Computer→Max; Zeon chrome later |
| Review / approval cards (`PageReviewCard`, page-review decision flow) | **Keep** → wire to Zeon approval semantics | Primary approval UX pattern |
| Threads / conversation store via CopilotKit Intelligence | **Replace** | Local (then Zeon-hosted) thread store; no CopilotKit cloud |
| `@copilotkit/react-core` / `CopilotKitProvider` / `useThreads` / `useCopilotKit` | **Replace** | Thin Zeon chat client over local/Zeon APIs |
| `@copilotkit/runtime` Intelligence (`CopilotKitIntelligence`, `/api/copilotkit`) | **Drop** | Hard coupling; see inventory below |
| `@copilotkit/channels` Slack | **Drop** (lab) / optional later | Not required for Orb ownership spike |
| OpenAI adapter (`@tanstack/ai-openai`, `OPENAI_*`, `openaiCompatibleText`) | **Keep shape / replace vendor** | Phase 2 multi-LLM adapter: OpenAI / Grok / Claude / Naya AI |
| Browser service (`src/browser/*`, `BROWSER_*`, compose browser) | **Keep** (lab localhost only) | Useful for Computer/Max research; not baked into nayaOS |
| OpenBot / Computers (`computer-*`, compose.computers*) | **Keep** (lab) | Maps to Orb Max / Computer panel pattern |
| Learning (`src/server/learning.ts`, `src/shared/learning.ts`, Intelligence learning links) | **Drop** or defer | Tied to CopilotKit Learning / outside docs |
| Voice / OpenAI Realtime (`src/server/voice.ts`, `useVoice.ts`) | **Defer** | Replace only after local threads + provider adapter exist |
| Headless Intelligence agent (`src/server/headless.ts`) | **Drop / replace** | Depends on Intelligence WS |
| Docker compose lab (`compose.yml`, computers compose) | **Keep** | Localhost bind only; lab isolation |
| Goose / nayaORB agent runtime | **Keep (locked)** | Not replaced by OpenDots |
| CopilotKit Intelligence project / account | **Drop** | Non-goal; no conversation SaaS |
| Bake into nayaOS ostree / Containerfile | **Drop** | Ship as app later (Phase 4), not bake |

---

## 3. Phases and exit criteria

### Phase 0 — Inventory

**Do:** Confirm fork hygiene, map OpenDots concepts → Zeon names, list Intelligence coupling paths (below), decide lab compose profile (app+browser, no Slack).

**Exit:** This spike doc accepted; coupling list agreed; lab runs on `127.0.0.1` only with no Intelligence key required for UI shell boot (may still fail chat until Phase 1).

### Phase 1 — Strip Intelligence + local threads

**Do:** Remove/gate `CopilotKitIntelligence`, `/api/copilotkit` dependency for create/list/get thread; introduce local thread + message store (filesystem or SQLite under lab volume); keep Chat/ThreadList UX against local API.

**Exit:** Create / list / open thread and send a turn **without** `INTELLIGENCE_API_KEY`; no outbound calls to `*.copilotkit.ai` / Intelligence hosts; conversation bytes stay on localhost volume.

### Phase 2 — Provider adapter

**Do:** Replace single OpenAI path with a small adapter interface (OpenAI / Grok / Claude / Naya AI). Keep TanStack tool bridge shape where useful; stop requiring CopilotKit runtime for model calls.

**Exit:** One lab config can switch providers via env (no secrets in git); at least two providers proven in lab; default lab path never uploads transcripts to third-party “Intelligence” products.

### Phase 3 — Orbit/Space + approval cards → Zeon semantics

**Do:** Rename/map Space→Orbit, Dot→Orb in product copy and IDs where cheap; wire `PageReviewCard` / `page-review-decision` to Zeon approval vocabulary (approve / decline / request-changes) matching Goose/nayaORB approval patterns where they exist.

**Exit:** Demo Orbit with local threads + review card producing a Zeon-shaped approval event; Computer/Max panel still lab-optional.

### Phase 4 — nayaOS app shell (not bake)

**Do:** Package as a **bespoke app** launched from Command chrome (same class as other naya apps)—container/Quadlet or local process—**not** baked into ostree. Pointers from `nayaOS/product/ORB_*.md`; runtime agent remains Goose in nayaORB.

**Exit:** From nayaOS Command, open Orb/Orbit UI that talks to lab/local backend; no Containerfile bake; Goose still default agent.

### Phase 5 — Optional Zeon OS / Aeon

**Do:** Only after Phase 4 is stable—evaluate carrying the same app into Zeon OS / Aeon surfaces.

**Exit:** Explicit Otis go/no-go; otherwise stop at nayaOS app.

---

## 4. Non-goals

- No CopilotKit account / Intelligence project for Zeon conversation data  
- No patient data / PHI in the lab  
- No replacing Goose as Orb runtime in nayaORB (until a later verified decision)  
- No baking OpenDots into nayaOS ostree / workstation Containerfile  
- No Slack / Learning / Voice as Phase 0–2 requirements  
- No pushing this fork to remotes that 403 (e.g. harizeon); local branch only until Otis says otherwise  
- No secrets in this doc or in committed `.env`

---

## 5. First PR candidates (smallest useful diffs)

1. **Docs-only:** this spike + nayaOS pointer (this change).  
2. **Config gate:** allow server boot and UI shell without `INTELLIGENCE_API_KEY`; clear “local threads not wired” empty state (no CopilotKit signup CTAs).  
3. **Local thread stub:** minimal `GET/POST /api/threads` + in-memory or `/data` JSON store; ThreadList reads it.  
4. **Strip Intelligence createThread/getThreadMessages** from `platform.ts` happy path once stub exists.  
5. **Provider adapter skeleton:** `LLMProvider` interface wrapping current `openaiCompatibleText` call site in `dot-agent.ts`.

Avoid large renames and Slack/Learning/Voice in the first PRs.

---

## 6. Naya answers (nayaOS) — 2026-10-01 PT

Accepted by Naya (nayaOS). These close the former open questions in §7.

1. **Threads Phase 1:** JSON/filesystem under the lab compose volume; SQLite only if the stub outgrows that. **No day-one Zeon store API** — wire existing/future Zeon APIs in **Phase 4**.
2. **Orbit:** Orb-only container (workflow home + ACL). **Not** 1:1 with Command spaces-lite or Forge Space; cross-links later.
3. **Approvals:** Thin Orb-native schema first, emitting Goose/nayaORB approve / decline / request-changes vocab. **Do not** block Phase 3 on a full Goose schema import.
4. **Multi-LLM:** Follow `ORB_LLM_SETTINGS` policy — Bitwarden keys; default Hermes proxy; lab env override; **no secrets in git**.
5. **Phase 4 packaging:** Browser/app window from Command chrome (naya apps class); Quadlet/sidecar if needed — **not** Electron-first, **not** ostree bake.
6. **CopilotKit React:** OK for Phase 1–2 while local threads land; target **zero `@copilotkit/*` on the conversation path by end of Phase 2** (UI keep-list can stay).
7. **Computer/Max:** Defer behind chat + approval. Command float Max stub stays **chrome-only** until then.
8. **Branding:** Use Orb/Orbit in product copy from **Phase 1 empty-states**.

---

## 7. Open questions for Otis / Naya — **decided** (see §6)

1. ~~Should local thread persistence be SQLite, JSON files under the compose volume, or an existing Zeon store API from day one?~~ → **Decided:** JSON/filesystem first; SQLite if needed; Zeon store APIs in Phase 4.  
2. ~~Does Orbit (Space) map 1:1 to Command spaces / Forge workspaces, or is it a new Orb-only container?~~ → **Decided:** Orb-only container; cross-link later.  
3. ~~Approval cards: reuse nayaORB/Goose approval event schema, or define a thin Orb-native schema first?~~ → **Decided:** thin Orb-native first; emit Goose/nayaORB vocab; no Phase 3 block on full import.  
4. ~~Multi-LLM: who owns API keys in lab vs. Hermes proxy vs. Naya AI—same policy as `ORB_LLM_SETTINGS.md`?~~ → **Decided:** `ORB_LLM_SETTINGS` (Bitwarden / Hermes default / lab override).  
5. ~~Phase 4 packaging: Electron/Tauri desktop, browser app in Command, or Quadlet sidecar—preference?~~ → **Decided:** Command chrome browser/app window; Quadlet/sidecar if needed; not Electron-first / not ostree bake.  
6. ~~Keep upstream CopilotKit React UI primitives temporarily (license/OK), or fork-clean UI with zero `@copilotkit/*` deps by end of Phase 2?~~ → **Decided:** React OK Phase 1–2; zero `@copilotkit/*` on conversation path by end Phase 2.  
7. ~~Computer/Max (OpenBot computers): in-scope for first Orbit demo, or defer behind chat+approval?~~ → **Decided:** defer; Max stub chrome-only until chat+approval.  
8. ~~Branding in-product: show “Orb/Orbit” immediately in Phase 1, or stay OpenDots labels until Phase 3?~~ → **Decided:** Orb/Orbit from Phase 1 empty-states.

---

## Zeon intelligence (zeonhq/api)

**Otis lock:** Zeon intelligence = **zeonhq/api** fuels Orb chat. LLMs stay **agnostic**. **No CopilotKit Intelligence.**

Inventory date: **2026-10-01 PT** (Studio). Phase 2 local-chat already lands at `feat/opendots-local-threads` (`0c97dc7`) via OpenAI-compatible `POST {OPENAI_BASE_URL}/chat/completions` (`src/server/local-chat.ts`).

### Where things live

| Piece | Path / remote | Role for Orb |
|-------|---------------|--------------|
| **zeonhq/api** | `/Users/aeon/workspace/zeonhq/api` → `github.com/zeonhq/api` | First-party product API. Today: domain routers call Hermes (e.g. `naya_assist` WS protocol via `NAYA_AGENT_URL`; `gaal` → `{GAAL_AGENT_URL}/v1/chat/completions`). **No general OpenAI-compatible Orb chat facade yet.** |
| **Hermes agent (fork)** | `/Users/aeon/workspace/zeonhq/_thirdparty/hermes-agent` → `zeonhq/hermes-agent` (upstream NousResearch) | Runs the Naya SOUL / agent. Two OpenAI-shaped wires (below). Dashboard ≠ wire. |
| **ORB_LLM_SETTINGS** | `nayaOS/product/ORB_LLM_SETTINGS.md` | Image contract: default mode `hermes_proxy`, port **8645**, Bitwarden env **hints** only, hostname in operator/Bitwarden. |
| **OpenDots lab** | `/Users/aeon/workspace/zeonhq/_thirdparty/OpenDots` | Consumer: `OPENAI_BASE_URL` + `OPENAI_API_KEY` + `OPENAI_MODEL`. |

No standalone `hermes/` app repo under `zeonhq/` root — Hermes is the `_thirdparty/hermes-agent` checkout plus lab process(es).

### Concrete endpoints (wire, not dashboard)

| Wire | Endpoint | Auth pattern (names only) | Notes |
|------|----------|---------------------------|-------|
| **Hermes subscription proxy** (default Orb mode) | `POST http://<host>:8645/v1/chat/completions` (also `/v1/models`) | Client may send **any** Bearer; proxy attaches real OAuth. Lab client env: `OPENAI_BASE_URL`, `OPENAI_API_KEY` (placeholder OK), `OPENAI_MODEL`. Operator inject: `BWS_ACCESS_TOKEN`. Settings secret_ref name: `bitwarden:nayaos/orb/hermes`. | `hermes proxy start` — `DEFAULT_PORT=8645`. **Not** dashboard **9132**. |
| **Hermes API server** (full agent + tools) | `POST http://127.0.0.1:8642/v1/chat/completions` (default) | Bearer `API_SERVER_KEY`. Env: `API_SERVER_ENABLED`, `API_SERVER_PORT`, `API_SERVER_HOST`, `API_SERVER_KEY`. | Different product: agent backend, not raw subscription passthrough. |
| **Hermes dashboard** | Naya default `NAYA_AGENT_URL` → port **9132**; Gaal dashboard **9130** | Session token / WS protocol (`HERMES_NAYA_SESSION_TOKEN`, `HERMES_SESSION_TOKEN`, …) | **Not** the OpenAI chat wire. Do not point `OPENAI_BASE_URL` here. |
| **zeonhq/api → Hermes (today)** | Domain routes only (e.g. assist / Medyfy / GAAL) | Server-side env hints: `NAYA_AGENT_URL`, `MEDYFY_NAYA_HERMES_URL`, `GAAL_AGENT_URL`, session/policy token **names** as in api services — **no secrets in this doc** | Not a drop-in `OPENAI_BASE_URL` for OpenDots yet. |

### Can OpenDots local-chat hit Hermes via `OPENAI_BASE_URL` today?

**Yes — shape already matches.** `openaiCompatibleChat` posts to `{baseUrl}/chat/completions` with `Authorization: Bearer ${OPENAI_API_KEY}`. Pointing lab env at the subscription proxy works when that process is up:

```bash
# Recommended lab recreate (values from Bitwarden / operator config — not committed)
OPENAI_BASE_URL=http://127.0.0.1:8645/v1   # or lab hostname:8645/v1
OPENAI_API_KEY=sk-unused                   # proxy accepts any bearer
OPENAI_MODEL=<model advertised by proxy> # e.g. Hermes catalog id
# Optional operator bootstrap: BWS_ACCESS_TOKEN → resolve bitwarden:nayaos/orb/hermes
```

Studio check (2026-10-01 PT): lab `opendots.env` still targets cloud OpenAI `…/v1`; nothing listening on **8645** / **9132** at inventory time. So capability is in code; live Hermes-fueled turn still needs proxy + env switch.

### Phase 2.5 plan (next adapter target)

1. **Keep OpenAI-compatible shape** — no CopilotKit Intelligence; continue `local-chat.ts` / `OPENAI_*` triple.
2. **Default `OPENAI_BASE_URL` to Hermes / zeonhq-api when available** — prefer subscription proxy `:8645/v1` (ORB_LLM_SETTINGS default). When zeonhq/api grows a first-party OpenAI-compatible Orb facade, same env switch — no UI required for the lab prove.
3. **UI still later** — no Orb/LLM Settings page in OpenDots this slice; mode switch is env / Bitwarden only (nayaOS Settings page is a separate chrome track).
4. **Do not** call third-party Intelligence hosts; do not commit secrets; do not treat dashboard **9132** as the wire.

### Gaps before a real Zeon-fueled Orb turn

1. Hermes **proxy** (or chosen API-server profile) must be running and reachable from the OpenDots process/compose network.
2. Lab hostname for `:8645` lives in operator config / Bitwarden — not invented in git.
3. `OPENAI_MODEL` must match what the proxy/API server advertises.
4. **zeonhq/api** still lacks a dedicated OpenAI-compatible Orb chat facade; until then Hermes proxy is the wire, api remains domain intelligence for other products.
5. Compose/localhost networking: containerized OpenDots cannot use `127.0.0.1` of the host without `host.docker.internal` / host network / published proxy.
6. Auth story for a future api facade (Zeon session vs placeholder Bearer) is undecided — keep placeholder-Bearer only for Hermes subscription proxy.
7. No product UI for provider switch yet (Phase 2.5 = env default only).

---

## Appendix A — Phase 0 inventory: Intelligence / CopilotKit coupling (file paths)

Concrete paths skimmed from `package.json` and `src/` (no secrets).

### Dependencies (`package.json`)

- `@copilotkit/channels`
- `@copilotkit/core`
- `@copilotkit/react-core`
- `@copilotkit/runtime`
- `@tanstack/ai` / `@tanstack/ai-openai` (model path; keep shape, swap vendors)

### Server — Intelligence / runtime

- `src/server/index.ts` — loads `INTELLIGENCE_*`, `OPENAI_*`; builds `/api/copilotkit` runtime URL; Intelligence WS default host  
- `src/server/platform-config.ts` — `intelligenceKey` / `intelligenceApiUrl` / `intelligenceWsUrl`; treats Intelligence as required setup  
- `src/server/platform.ts` — `CopilotKitIntelligence`, `basePath: '/api/copilotkit'`, createThread / getThreadMessages  
- `src/server/workspace-routes.ts` — `app.all('/copilotkit/*', …)`  
- `src/server/runtime-scope.ts` — `/api/copilotkit/` prefix  
- `src/server/dot-agent.ts` — `@copilotkit/runtime/v2`, requires `intelligenceKey`, `openaiCompatibleText`  
- `src/server/headless.ts` — `IntelligenceAgent` from `@copilotkit/core`  
- `src/server/learning.ts` — `CopilotKitIntelligence` types  
- `src/server/page-service.ts` — `PageIntelligence` thread message access  
- `src/server/page-routes.ts` — Intelligence error copy  
- `src/server/page-tools.ts` — `defineTool` from `@copilotkit/runtime/v2`  
- `src/server/computer-tools.ts` — `defineTool` from `@copilotkit/runtime/v2`  
- `src/server/tanstack-tools.ts` — CopilotKit tool factory / `copilotkit_*` skill names  
- `src/server/slack-channel.ts` — `@copilotkit/channels`  
- `src/server/voice.ts` — OpenAI Realtime + Intelligence transcript sync messaging  
- `src/server/research.ts` — live mode requires `OPENAI_*` + `BROWSER_*`

### Client — CopilotKit React

- `src/client/App.tsx` — `CopilotKitProvider`, `runtimeUrl="/api/copilotkit"`  
- `src/client/Chat.tsx` — `useCopilotKit`, `runAgent` / `stopAgent`  
- `src/client/ThreadList.tsx` — `useThreads`  
- `src/client/WorkspaceDialog.tsx` — Intelligence project / Learning setup copy  
- `src/client/ComputerPanel.tsx` — docs links (upstream)

### Shared / config / compose

- `src/shared/types.ts` — `intelligence: boolean` capability flag  
- `src/shared/voice-receipt.ts` — Intelligence message-id notes  
- `src/shared/learning.ts` — learning types  
- `.env.example` — `INTELLIGENCE_API_KEY` / `INTELLIGENCE_API_URL` / `INTELLIGENCE_WS_URL`, `OPENAI_*`, `BROWSER_*`, `SLACK_*`  
- `compose.yml` — passes Intelligence + OpenAI + browser env (lab localhost ports)

### UI keep-list (reshape, low Intelligence coupling)

- `src/client/SpaceNav.tsx`, `SpaceWorkspace.tsx`, `SpaceLibrary.tsx`  
- `src/client/PageReviewCard.tsx`, `page-review-decision.ts`, `src/shared/page-review.ts`  
- `src/client/ComputerPanel.tsx`, `ComputerToolCard.tsx`  
- `src/client/PageDocument.tsx`, `PageConversation.tsx`, editor/*  
- `src/browser/*` — browser service (lab)  
- `src/server/computer-*.ts` — computers (lab)

### Concept map (OpenDots → Zeon)

| OpenDots | Zeon |
|----------|------|
| Dot | Orb |
| Space | Orbit |
| Threads | Orb chat / threads |
| Computer | Orb Max (Command module) |
| Review cards | Approval cards |
| Agent runtime (upstream Intelligence) | Goose in nayaORB (unchanged for now) |

---

## Appendix B — Lab posture (locked context)

- Lab **only** on localhost Docker — not baked into nayaOS  
- Goose remains Orb runtime in **nayaORB** until verified otherwise  
- No CopilotKit Intelligence / no outside SaaS for conversation data  
- Multi-LLM via adapter (OpenAI / Grok / Claude / Naya AI); **Phase 2.5** defaults `OPENAI_BASE_URL` to Hermes proxy / zeonhq/api when available — see **Zeon intelligence (zeonhq/api)**  
- Goal: own Orb/Orbit using OpenDots UI/architecture, same adoption pattern as Goose  
- Eventually: bespoke app inside nayaOS (maybe Zeon OS / Aeon later)

---

## Goose wire parallel (Hermes into OpenDots lab — 2026-10-01 PT)

Same adoption pattern as Goose in nayaORB: **edge adapter + Zeon owns the path**.

- Keep OpenAI-compatible consumer shape (`local-chat.ts` / `OPENAI_*`); do not bake provider into nayaOS or invent a new SaaS.
- Point lab runtime at Hermes **subscription proxy** wire `:8645/v1` (not dashboard `:9132`). Container uses `OPENAI_BASE_URL=http://host.docker.internal:8645/v1`.
- `OPENAI_API_KEY` placeholder (`sk-unused`); proxy attaches real OAuth. Secrets via Bitwarden **names** only — `secret_ref`: `bitwarden:nayaos/orb/hermes` (env hint `BWS_ACCESS_TOKEN`).
- Model id follows Goose/nayaORB lab wire (`grok-4.6`); swap only to ids the proxy advertises.
- **Do not** call third-party CopilotKit Intelligence; match Goose's agnostic adapter pattern.

### Exact Goose → Hermes → Grok lab facts (found + Naya-confirmed 2026-10-01 ~23:49 PT)

| Layer | Fact |
|-------|------|
| **Goose (nayaORB)** | Runtime locked. Speaks OpenAI-compatible host via `GOOSE_PROVIDER=openai` → `OPENAI_HOST` / `OPENAI_BASE_PATH` (protocol adapter, not OpenAI vendor lock). Lab `orb.json` shape: `provider=openai_compatible`, `model=grok-4.6`, `base_url=…:8645/v1`. Docs: `nayaORB/docs/GOOSE.md`, `DECISIONS.md`, `LAB_IMAC.md`. |
| **Hermes profile** | Product identity profile **`naya`** (SOUL). **Not** Studio Hermes profile `hari` (Nous). Naya-confirmed wire profile: **`naya`**, provider **`xai-oauth`**, model **`grok-4.6`**. |
| **Proxy upstream** | `hermes proxy providers` → `nous` (Nous Portal), **`xai`** (xAI Grok OAuth). OpenDots lab uses **`--provider xai`**, not Nous. |
| **Start command** | `hermes proxy start --provider xai --host 0.0.0.0 --port 8645` (optionally `hermes -p naya …` once profile exists). Default bind port **8645**. |
| **Auth** | `hermes login --provider xai-oauth` **or** `hermes auth add xai-oauth --type oauth` (interactive SuperGrok OAuth). Proxy start fails without it: `Not logged into xAI Grok OAuth. Run \`hermes auth add xai-oauth --type oauth\` first.` |
| **OpenDots lab env (Studio, live)** | `OPENAI_BASE_URL=http://host.docker.internal:8645/v1`, `OPENAI_MODEL=grok-4.6`, `OPENAI_API_KEY=sk-unused`. Already OpenAI-compatible to host proxy. |

Studio sources checked: `~/.hermes` (default + `profiles/hari` only — **no `naya` profile dir**), `~/.config/goose` (extensions + empty `xai_oauth/` dir; no committed provider secret), `nayaORB` README/DECISIONS/LAB_IMAC/GOOSE, `nayaOS/product/ORB_LLM_SETTINGS.md`.

### Studio retest 2026-10-01 ~23:49 PT

1. `hermes proxy status` (default): **nous** not logged in; **xai** not logged in.
2. `hermes -p naya …` → **Profile 'naya' does not exist** (`hermes profile create naya` required first on this host).
3. `hermes proxy start --provider xai --host 0.0.0.0 --port 8645` → **blocked** (xAI OAuth missing). Nothing listening on **8645**.
4. OpenDots `POST /api/threads/:id/messages` (Bearer owner token, thread `5ddd45ca-…`) → **HTTP 503** (`The service request failed…`) — expected with dead upstream; env already points at `:8645`.
5. **Blocker for Otis/Hari (interactive):** create/use profile `naya`, complete SuperGrok OAuth, then restart proxy:

```bash
hermes profile create naya   # if missing on this machine
hermes -p naya login --provider xai-oauth
# or: hermes -p naya auth add xai-oauth --type oauth
hermes -p naya proxy start --provider xai --host 0.0.0.0 --port 8645
# then retest POST /api/threads/:id/messages (status only)
```

Do **not** invent SaaS / CopilotKit Intelligence. Do **not** use `hari` + Nous for this lab wire.

---

## Otis locks — 2026-10-01 ~23:49 PT

Appended as operator locks (OpenDots spike + nayaOS pointer):

1. **nayaOS = OS**; apps/modules (**ZPL, Orion, Gaal, Libra, Orb**) are **local-first / offline-capable**.
2. **Knowledge unified onto each machine** for rapid Orb reference.
3. **On-device + admin-protected knowledge engines** (delete/manipulate; **anti-extraction**).
4. **Engines / math / KB baked into OS / Orb** — **not** dependent on external apps.
5. **External infra = sync / push update only**.
6. **LLM:** Goose wire was **Hermes → Grok** (agnostic adapter); **match that for OpenDots**, **not** third-party Intelligence.
