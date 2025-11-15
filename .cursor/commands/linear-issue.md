**Purpose**: Turn a Linear issue into an autonomous, end‑to‑end implementation flow inside Cursor, with minimal chatter and strict Graphite/Linear compliance. This is **not** a background agent; it runs as a single slash command that orchestrates investigation, implementation, validation, and a **deferred** PR workflow.
---
## How to Use
- **Command**: `/linear-issue <LinearKey|IssueID?> [BG?]`
- **Arguments**
    - `LinearKey|IssueID` *(optional)*: Accepts either a Linear issue key (e.g. `AIC-432`) or a Linear issue ID. If provided, the command will always call the Linear MCP `get_issue` using this exact token without relying on or inspecting the current branch or commit message.

        - If omitted, the command will attempt to detect an identifier from:

            1. current **Git branch** name, then
            2. latest **commit message**, else
            3. prompt for a key.
    - `BG` *(optional)*: If the last token is `BG`, the command also **appends** a Background‑Agent prompt (see §10) to the Linear issue and then returns to idle.
---
## Single‑Run Contract
- This command executes **now**, within the current Cursor session.
- It follows the **Two‑Phase Workflow** with **minimal external output** (single‑line updates only), and enforces the **Deferred‑Branch Strategy**: **no** branch/PR until the developer explicitly types **PR** after completion.
---
## Exact Behavior (What this command must do)
1. **Resolve the Issue**
    - Resolve the identifier:

        - If `LinearKey|IssueID` is provided, use it as-is (key or ID). Do not require or derive from the current branch or commit.
        - Otherwise, attempt to extract from branch → commit message → prompt for a key.
    - **Always call Linear MCP **`get_issue` with the resolved identifier.
    - **Fetch** from the retrieved issue: title, description, acceptance criteria, labels, priority, and any attachments/links.
    - If the issue cannot be found or fetched → output: `🔴 20% – Clarification needed: issue not found for "<identifier>". Provide a valid Linear key or issue ID.`
    - **Inject** the full issue body into `{issue}` to scope the task.
    - **Load rules**: `fetch_rules global/graphite-linear-workflow`. Also load any relevant rules based on edited files (example: `global/react-best-practices`). If the required rule cannot be fetched → **Stop** with the Failure Stop‑Line (see §7.2).
2. **Complexity Assessment**
    - Estimate **Total Effort (TE)**.
    - **If TE ≤ 4h and task is straightforward** → proceed.
    - **If TE > 4h** or acceptance criteria are unclear → **Stop** and ask **one** very specific clarification question. **Do not** create sub‑issues unless you will execute them now.
3. **Two‑Phase Workflow (Minimal External Output)**
4. PhasePurposeExternal Output (exactly 1 line)**Phase 1 – Investigation**Understand, design, plan.`Phase 1: [EMOJI_CONFIDENCE] [PERCENT]%`**Phase 2 – Execution**Implement, test, validate.`Phase 2: [EMOJI_COMPLETION] [PERCENT]%`
5. **Scales**
    - *Phase 1 (Confidence)*: 🟢 90��100 % · 🟡 60‑89 % · 🟠 30‑59 % · 🔴 < 30 %
    - *Phase 2 (Completion)*: ⬜ 0 % · 🟥 1‑25 % · 🟧 26‑50 % · 🟨 51‑75 % · 🟩 76‑99 % · ✅ 100 %
6. **Auto‑transition**: Investigate until reaching **🟢** confidence, then switch to **Phase 2**.
7. **Implementation Rules**
    - Keep **Linear** as the **single source of truth**.
    - **No narrative logs**; only the mandated single‑line Phase updates and Stop‑Lines.
    - **No subtasks** unless they will be implemented **now** in this session.
8. **Validation**
    - Run **all** project tests, linters, CI, and type checks applicable to the repo. Fix failures until Phase 2 shows **✅ 100 %**.
9. **Stop Rule (exactly one stop‑line)**
10. **Situations & Formats**
    - **Clarification needed (Phase 1 < 30 %)** → `🔴 [X]% – Clarification needed: <very specific question>`
    - **Feature complete, awaiting PR instruction** → `🟦 100% – Feature ready. Reply “PR” (or give feedback) to continue.`
11. **Graphite Git Workflow — Deferred Branch**
    - Work on the **current parent branch** during investigation, coding, and validation.
    - When **Phase 2 reaches ✅ 100%** and all validations pass → **Pause** and emit the 🟦 100% stop‑line.
    - **Only if** the developer replies **PR** (or “open PR”). Then:

        1. **Stage** files **selectively** per `graphite_linear_workflow` (use `git add <file>`; **never** `-a`).
        2. **Create branch and initial commit**: `gt create -m "<Linear‑Key>: <concise commit title>"`.
        3. **Publish the stack**: `gt ss --no-edit --publish`.
        4. **Post** the PR link/identifier.
7.1 **Compliance Checklist**
- Obey all `globs`, `filters`, and `actions.suggest` defined in `graphite_linear_workflow` and other fetched rules.
- Stage only the files permitted by the rules.
- If multiple rules conflict → prefer **project‑specific > global > examples**.
7.2 **Failure Handling**
- If `global/graphite-linear-workflow` cannot be fetched or directives are unclear → output:

    - `🔴 15% – Clarification needed: global/graphite-linear-workflow not found or compliance unclear`
    - Then **wait** for guidance.
8. **User‑Triggered Pull Request (after 🟦 100%)**
- On **PR** (or similar):

    1. Stage relevant file changes.
    2. Run `gt create -m "<Linear‑Key>: <concise commit title>"`.
    3. Rebase onto `main` (or specified target) and resolve conflicts.
    4. `gt ss --no-edit --publish`.
    5. Post the PR link/identifier.
- If feedback is provided instead of PR → address it, rerun validations, return to **🟦 100%** stop‑line.
9. **Background‑Agent Trigger (BG)**
- If the command token `BG` is present **while paused at 🟦 100%**:

    1. **Append** the Background‑Agent Prompt (template below) to the Linear issue description, replacing `{{branch_name}}` with the full branch name provided by the developer.
    2. Ensure **triple backticks are escaped** inside the embedded prompt.
    3. Return to **idle** at 🟦 100%.
10. **Background‑Agent Prompt Template (to append verbatim to Linear issue)**
> Replace `{{branch_name}}` and insert the exact task body between the markers. Escape code fences inside with ````.
> `<background_agent_prompt>
# Background Agent – Autonomous Task Execution
## 🎯 Main Mission
You are a **Cursor autonomous agent**. You act independently to accomplish tasks without constant user supervision.
## 📋 YOUR TASK
**Branch to create:** `{{branch_name}}`
<!-- START OF ASSIGNED TASK -->
<INSERT TASK DESCRIPTION EXACTLY AS PROVIDED>
<!-- END OF ASSIGNED TASK -->
This task is your **ABSOLUTE PRIORITY**.
## 🔄 Operation Mode
### 1. TWO‑PHASE Communication
(Use the Phase‑1 / Phase‑2 score system: confidence %, completion %.)
### 2. Graphite Branch & PR Workflow
> **Overview****Environment bootstrap****Phase 1 – Investigation****Phase 2 – Coding****Publish PR** with Graphite
0 – Bootstrap *(before Phase 1)*
```bash
# Make sure Graphite rules are loaded
cursor fetch_rules global/graphite-linear-workflow
# Identify base branch, attach & create work branch
CUR=$(git rev-parse --abbrev-ref HEAD)
REMOTE=$(git branch -r --contains $(git rev-parse HEAD) | grep -v '->' | head -n1)
BRANCH=${REMOTE#origin/}
if gt get "$BRANCH" 2>&1 | grep -q "Could not find an open PR"; then gt co "$BRANCH"; fi
WORK={{branch_name}}
gt branch create "$WORK"
```
*(After this point, enter Phase 1.)*
1 – Commit Strategy during Phase 2
```bash
git add <paths>
git commit -m "${WORK}: initial implementation"
# further changes → gt modify -s
```
2 – Publish PR when ✅ 100 %
```bash
cursor fetch_rules global/graphite-linear-workflow
gt ss --no-edit --publish
```
*Graphite handles pushing.*
### ✅ Validation
Run only `precommit`, `build`, and unit-test scripts. **Do not** run E2E/browser tests.
### Code style
Minimal comments, self‑explanatory, no new docs files.
</background_agent_prompt>
`
11. **Stop‑Line Recap**
- **Never** emit more than **one** stop‑line per pause.
- Formats are **exactly**:

    - `🔴 [X]% – Clarification needed: <question>`
    - `🟦 100% – Feature ready. Reply “PR” (or give feedback) to continue.`
12. **Safety & Scope Guards**
- **Never** run `gt create` or `gt ss` before the explicit **PR** instruction.
- **Never** stage all (no `git add -A` or `-a`). Stage **only** allowed paths.
- **Never** create Linear subtasks unless they will be executed **now**.
- If rule compliance is uncertain → stop with the failure stop‑line (§7.2).
---
## One‑Screen Summary (for Cursor)
- Fetch Linear → load rules → assess complexity → Phase 1 → Phase 2 → validate → **🟦 100%** → on **PR**: stage selectively → `gt create` → `gt ss --no-edit --publish` → post PR link.
- Optional `BG`: append background prompt to Linear and return to **🟦 100%**.