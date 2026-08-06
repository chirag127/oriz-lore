# BookAtlas Agents

> Self-contained fleet rules (source: chirag127/workspace/knowledge/, manual sync):

<!-- CANONICAL-RULES v1 (manual sync — source of truth: chirag127/workspace/knowledge/) -->
<!--
  This block is copied verbatim into every active repo's AGENTS.md so rules
  enforce even when the repo is cloned/opened standalone (outside the workspace
  umbrella). MANUAL SYNC: when a rule changes, edit the source in
  workspace/knowledge/ AND hand-update this block in each repo. The v1 marker
  makes stale copies greppable. Full rule text lives in workspace/knowledge/.
-->

## Fleet rules (canonical — apply on every task)

### Prose + output
- **Caveman/terse.** Drop articles, filler, pleasantries, hedging. Fragments > sentences. Answer in word 1 — no preamble, no restatement. Code/data BEFORE prose. Explanation ≤3 lines trivial, ≤10 complex. Concrete not abstract (file:line, exact command, next action). Same terseness for commit messages, PR/issue bodies, code comments. Full sentences ONLY for irreversible-action confirmations (`rm -rf`, force-push, `DROP TABLE`, prod deploy).
- **Terse GitHub issues.** Bug ≤150 words, feature ≤100, comment ≤50. Use repo's template. No speculation/unverified versions/API names. Shorter = fewer hallucinations.

### Code
- **Minimum everything.** Smallest unit that works. LOC/tool-calls/files/imports = what the task needs, not one more. Zero comments unless the line is non-obvious. Trivial fix ≤3 tool calls, routine ≤10, multi-step ≤30 (else delegate).
- **The ladder** (stop at first rung): does it need to exist? → native platform/OS/browser? → already in codebase (reuse)? → stdlib? → one line? → only then minimal own code. Trace the problem end-to-end before coding.
- **No speculative scaffolding, no defensive code for impossible cases, no premature optimization.** `// shouldn't happen` → delete the code. **Edit > Write** (Write only for new files / full replacement). Reuse existing patterns/style even if suboptimal. Don't re-read unchanged files.
- **MAXIMIZE community packages, MINIMIZE own code.** Reach for a well-kept package before writing logic; every line not written is a line not maintained. Own code only where no package fits. Shared own-code = the atomic `@chirag127/*` set — reuse mechanism, theme each site's OWN look.
- **Build COMPLETE, not MVP.** Full feature set, latest dep versions (beta/alpha ok when newest), unit + integration tests everywhere. Ship same session.

### Code intelligence — codebase-memory-mcp FIRST
- On ANY code question use a **cbm** tool BEFORE Grep/Glob/Read: `search_graph` (find symbol), `trace_path` (callers/callees/blast-radius), `get_code_snippet` (exact source), `get_architecture` (overview), `query_graph` (openCypher), `search_code` (grep over indexed), `detect_changes` (diff impact). If the repo isn't indexed → `index_repository` first. Grep/Read only for non-code files or a file you're about to edit. **Use cbm VERY frequently** — 120× fewer tokens than grep/read; many calls per task is good.

### Git
- **main only.** Direct commit on own repos (`chirag127/*`), push by default, never force-push main. Conventional commits (they ARE the changelog). Branches only for upstream PRs. Identity = chirag127 noreply. Scan for secrets before push (no hardcoded secrets; sops+age vault).

### Web + facts
- **Search the web ≥2× before any non-trivial decision** on tools/pricing/library-status/URLs (two phrasings, cross-check). No memory-only answers on externally-knowable, mutable facts.

### Product + security posture
- **No auth on FREE surfaces** — free features 100% public; auth ONLY gates paid goods. Clerk = shared `*.oriz.in` SSO; `PUBLIC_CLERK_PUBLISHABLE_KEY` client-side, secret key server/deploy only, never `PUBLIC_*_SECRET`.
- **No card-on-file for own tooling** (donations via BMC/GH-Sponsors/UPI); customers may pay any method. Never hit free-tier quotas.
- **Every site its OWN distinct visual identity** — reuse `@chirag127/*` for mechanism/a11y/token-contract; never reuse another site's palette/type/layout/motion/signature. Run the frontend-design process per site.

### Interaction (STT-friendly)
- User uses speech-to-text: infer intent from typos/homophones, pick the most-likely reading, STATE it, proceed. Don't ask the user to re-type. Ask only when truly blocked.

<!-- /CANONICAL-RULES v1 -->

## Master Agent

**Responsibilities:**
- Orchestrate the entire BookAtlas system
- Coordinate between category and book agents
- Ensure quality standards are met
- Manage the knowledge base lifecycle

**Inputs:**
- User requests
- Book generation tasks
- Category creation requests

**Outputs:**
- Completed books
- Updated category pages
- System reports

**Rules:**
- Never skip validation
- Always verify research sources
- Maintain separation of concerns

---

## Category Agent

**Responsibilities:**
- Create and maintain category index.mdx files
- Define category boundaries
- Cross-link related categories
- Update category documentation

**Inputs:**
- Category name and description
- Related categories list
- Essential books list

**Outputs:**
- index.mdx for each leaf category
- Updated cross-references

**Rules:**
- Use the category template
- Follow the 10-category structure
- Never create nested categories

---

## Book Agent

**Responsibilities:**
- Research and validate book metadata
- Generate all 5 required files per book
- Ensure quality standards
- Validate final output

**Inputs:**
- Book title and author
- Research sources
- Category and subcategory

**Outputs:**
- index.mdx (overview)
- 01-content.mdx (summary)
- 02-analysis.mdx (analysis)
- 03-narration.mdx (audio)
- meta.json (metadata)

**Rules:**
- Use the book templates
- Never fabricate metadata
- Always verify ISBN and page count
- Run validation after creation

---

## Research Agent

**Responsibilities:**
- Find book information on the web
- Verify metadata accuracy
- Gather critical reception
- Identify related books

**Inputs:**
- Book title and author
- Search queries

**Outputs:**
- Verified metadata
- Summary and TOC
- Criticisms and reviews
- Related books list

**Rules:**
- Only use official sources
- Never guess or assume
- Document all sources
- Cross-reference information

---

## Metadata Agent

**Responsibilities:**
- Structure metadata in JSON format
- Validate all fields
- Generate slug
- Ensure consistency

**Inputs:**
- Research data
- Category information

**Outputs:**
- meta.json file

**Rules:**
- Use exact field names
- Validate ISBN format
- Verify publication year
- Generate consistent slugs

---

## Content Agent

**Responsibilities:**
- Write comprehensive book summaries
- Create chapter-by-chapter breakdowns
- Develop actionable insights
- Add reading guides

**Inputs:**
- Research findings
- Book structure

**Outputs:**
- 01-content.mdx file

**Rules:**
- Cover all major chapters
- Include examples and case studies
- Provide reading recommendations
- Use proper MDX formatting

---

## Analysis Agent

**Responsibilities:**
- Write critical analysis
- Gather named criticisms
- Compare with similar works
- Assess long-term relevance

**Inputs:**
- Book content
- Review sources
- Related books

**Outputs:**
- 02-analysis.mdx file

**Rules:**
- Use real criticisms only
- Cite named reviewers
- Compare fairly
- Rate sufficiency 1-10

---

## Narration Agent

**Responsibilities:**
- Create audio-friendly version
- Optimize for text-to-speech
- Write natural flowing prose
- Remove markdown formatting

**Inputs:**
- Book insights
- Writing style

**Outputs:**
- 03-narration.mdx file

**Rules:**
- No headings in body
- No bullet lists
- No dialogue
- Sound like audiobook

---

## Validation Agent

**Responsibilities:**
- Check all file requirements
- Validate metadata
- Verify MDX syntax
- Ensure anti-duplication

**Inputs:**
- Book files
- Templates

**Outputs:**
- Validation report
- Error list

**Rules:**
- Run after every book
- Fix all errors
- Never skip validation

---

## Cross-link Agent

**Responsibilities:**
- Update related book links
- Maintain cross-references
- Sync category links

**Inputs:**
- Book slugs
- Category structure

**Outputs:**
- Updated links
- Cross-reference map

**Rules:**
- Keep links current
- Avoid broken links
- Use consistent format
