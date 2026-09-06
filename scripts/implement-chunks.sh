#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
ROADMAP="$REPO_ROOT/docs/implementation-chunks.md"
RESULT_SCHEMA="$SCRIPT_DIR/codex-chunk-result.schema.json"

CODEX_BIN="${CODEX_BIN:-codex}"
OPENSPEC_BIN="${OPENSPEC_BIN:-openspec}"
GIT_BIN="${GIT_BIN:-git}"
NODE_BIN="${NODE_BIN:-node}"

usage() {
  printf '%s\n' \
    'Usage: scripts/implement-chunks.sh' \
    '' \
    'Implement every remaining chunk in docs/implementation-chunks.md using' \
    'foreground, non-interactive Codex sessions. The repository must start clean' \
    'and must not contain an active OpenSpec change.' \
    '' \
    'Optional environment overrides: CODEX_BIN, OPENSPEC_BIN, GIT_BIN, NODE_BIN'
}

log() {
  printf '[chunk-runner] %s\n' "$*"
}

die() {
  log "ERROR: $*"
  exit 1
}

on_error() {
  local exit_code=$?
  log "ERROR: command failed during ${CURRENT_PHASE:-startup} (exit $exit_code)"
  exit "$exit_code"
}

trap on_error ERR
trap 'log "Interrupted"; exit 130' INT TERM

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi
[[ $# -eq 0 ]] || die "unexpected argument: $1 (use --help)"

for command_name in "$CODEX_BIN" "$OPENSPEC_BIN" "$GIT_BIN" "$NODE_BIN"; do
  command -v "$command_name" >/dev/null 2>&1 || die "required command not found: $command_name"
done

[[ -f "$ROADMAP" ]] || die "roadmap not found: $ROADMAP"
[[ -f "$RESULT_SCHEMA" ]] || die "response schema not found: $RESULT_SCHEMA"
[[ "$($GIT_BIN -C "$REPO_ROOT" rev-parse --show-toplevel)" == "$REPO_ROOT" ]] || \
  die "script directory is not at the root of its Git repository"

mapfile -t ROADMAP_CHANGES < <(
  sed -n 's/^\*\*OpenSpec change:\*\* `\([^`][^`]*\)`$/\1/p' "$ROADMAP"
)
(( ${#ROADMAP_CHANGES[@]} > 0 )) || die "no OpenSpec change names found in the roadmap"

is_archived() {
  local change_name=$1 archive_dir base
  shopt -s nullglob
  for archive_dir in "$REPO_ROOT"/openspec/changes/archive/*-"$change_name"; do
    [[ -d "$archive_dir" ]] || continue
    base=${archive_dir##*/}
    if [[ "$base" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-${change_name}$ ]]; then
      shopt -u nullglob
      return 0
    fi
  done
  shopt -u nullglob
  return 1
}

completed_count() {
  local change_name count=0
  for change_name in "${ROADMAP_CHANGES[@]}"; do
    if is_archived "$change_name"; then
      ((count += 1))
    fi
  done
  printf '%s\n' "$count"
}

first_remaining_change() {
  local change_name
  for change_name in "${ROADMAP_CHANGES[@]}"; do
    if ! is_archived "$change_name"; then
      printf '%s\n' "$change_name"
      return 0
    fi
  done
  return 1
}

active_changes() {
  "$OPENSPEC_BIN" list --json | "$NODE_BIN" -e '
    let input = "";
    process.stdin.on("data", chunk => input += chunk);
    process.stdin.on("end", () => {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed.changes)) throw new Error("OpenSpec output has no changes array");
      for (const change of parsed.changes) {
        const name = typeof change === "string" ? change : (change.name ?? change.id);
        if (typeof name !== "string" || name.length === 0) throw new Error("OpenSpec returned an unnamed change");
        process.stdout.write(`${name}\n`);
      }
    });
  '
}

read_active_changes() {
  local destination=$1 output
  local -n changes_ref=$destination
  output=$(active_changes)
  changes_ref=()
  if [[ -n "$output" ]]; then
    mapfile -t changes_ref <<< "$output"
  fi
}

parse_result() {
  local result_file=$1
  "$NODE_BIN" -e '
    const fs = require("fs");
    const parsed = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    for (const key of ["outcome", "change", "summary"]) {
      if (typeof parsed[key] !== "string") throw new Error(`invalid result field: ${key}`);
    }
    process.stdout.write(`${parsed.outcome}\n${parsed.change}\n${parsed.summary.replace(/[\r\n\t]+/g, " ")}\n`);
  ' "$result_file"
}

assert_apply_complete() {
  local change_name=$1
  "$OPENSPEC_BIN" instructions apply --change "$change_name" --json | "$NODE_BIN" -e '
    let input = "";
    process.stdin.on("data", chunk => input += chunk);
    process.stdin.on("end", () => {
      const parsed = JSON.parse(input);
      if (parsed.state !== "all_done") {
        console.error(`apply state is ${parsed.state ?? "unknown"}, expected all_done`);
        process.exit(1);
      }
    });
  '
}

run_codex() {
  local phase=$1 prompt=$2 result_file
  local -a result_fields
  CURRENT_PHASE=$phase
  result_file=$(mktemp "${TMPDIR:-/tmp}/codex-chunk-result.XXXXXX.json")
  TEMP_FILES+=("$result_file")

  log "Starting Codex phase: $phase"
  "$CODEX_BIN" \
    --ask-for-approval never \
    --sandbox workspace-write \
    --cd "$REPO_ROOT" \
    exec \
    --ephemeral \
    --color always \
    --output-schema "$RESULT_SCHEMA" \
    --output-last-message "$result_file" \
    "$prompt" 2>&1

  [[ -s "$result_file" ]] || die "Codex produced no structured result during $phase"
  mapfile -t result_fields < <(parse_result "$result_file")
  (( ${#result_fields[@]} == 3 )) || die "Codex returned an invalid result during $phase"
  log "Codex phase $phase returned ${result_fields[0]}: ${result_fields[2]}"
  CODEX_OUTCOME=${result_fields[0]}
  CODEX_CHANGE=${result_fields[1]}
}

TEMP_FILES=()
cleanup() {
  local file
  for file in "${TEMP_FILES[@]}"; do
    [[ ! -e "$file" ]] || rm -f -- "$file"
  done
}
trap cleanup EXIT

CURRENT_PHASE=startup
[[ -z "$($GIT_BIN -C "$REPO_ROOT" status --porcelain)" ]] || \
  die "Git worktree is not clean; commit or stash existing changes first"

read_active_changes INITIAL_ACTIVE
(( ${#INITIAL_ACTIVE[@]} == 0 )) || \
  die "active OpenSpec change exists: ${INITIAL_ACTIVE[*]}"

iteration=0
max_iterations=$(( ${#ROADMAP_CHANGES[@]} + 1 ))

while (( iteration < max_iterations )); do
  ((iteration += 1))
  before_count=$(completed_count)
  expected_change=$(first_remaining_change || true)
  log "Iteration $iteration: $before_count/${#ROADMAP_CHANGES[@]} chunks archived"

  proposal_prompt=$(printf '%s\n' \
    'Use the openspec-propose skill.' \
    'Inspect docs/implementation-chunks.md, the current implementation, main OpenSpec specs, and archived changes.' \
    'Find the first roadmap chunk in document order whose named OpenSpec change has not been implemented and archived.' \
    'If one exists, create that exact named OpenSpec change and generate every proposal, design, delta spec, and task artifact required for implementation. Preserve the chunk scope and acceptance checks, and do not implement code.' \
    'If all roadmap chunks are implemented and archived, do not modify the repository.' \
    'This is unattended automation: do not ask questions. Make safe minor assumptions and record them; return blocked when a material ambiguity prevents correct work.' \
    'Your final response must match the supplied JSON schema. Use outcome created with the change name, complete with an empty change, or blocked with the relevant change when known.')
  run_codex "proposal" "$proposal_prompt"

  if [[ "$CODEX_OUTCOME" == "complete" ]]; then
    [[ -z "$expected_change" ]] || die "Codex reported completion but $expected_change is not archived"
    read_active_changes ACTIVE_AFTER_COMPLETE
    (( ${#ACTIVE_AFTER_COMPLETE[@]} == 0 )) || die "Codex reported completion but left an active change"
    [[ -z "$($GIT_BIN -C "$REPO_ROOT" status --porcelain)" ]] || die "completion check modified the worktree"
    log "All ${#ROADMAP_CHANGES[@]} implementation chunks are complete"
    exit 0
  fi

  [[ "$CODEX_OUTCOME" == "created" ]] || die "proposal phase ended with $CODEX_OUTCOME"
  [[ -n "$expected_change" ]] || die "Codex created a change after every roadmap chunk was archived"
  [[ "$CODEX_CHANGE" == "$expected_change" ]] || \
    die "Codex created '$CODEX_CHANGE'; expected '$expected_change'"
  read_active_changes ACTIVE_AFTER_PROPOSAL
  (( ${#ACTIVE_AFTER_PROPOSAL[@]} == 1 )) || die "proposal phase must leave exactly one active change"
  [[ "${ACTIVE_AFTER_PROPOSAL[0]}" == "$expected_change" ]] || \
    die "active change '${ACTIVE_AFTER_PROPOSAL[0]}' does not match '$expected_change'"

  apply_prompt=$(printf '%s\n' \
    "Use the openspec-apply-change skill to implement active change '$expected_change'." \
    'Read all apply context and complete every task. Use relevant Phaser skills where applicable, including runtime playtesting for player-visible work.' \
    'Run the tests and build required by the change, and mark tasks complete only when their behavior is fully implemented.' \
    'This is unattended automation: do not ask questions or reduce scope. Return blocked if correct completion requires user input or if verification cannot pass.' \
    'Do not archive or commit during this phase.' \
    'Your final response must match the supplied JSON schema. Use outcome applied only when every task is complete; otherwise use blocked. Set change to the exact active change name.')
  run_codex "apply:$expected_change" "$apply_prompt"
  [[ "$CODEX_OUTCOME" == "applied" || "$CODEX_OUTCOME" == "complete" ]] || \
    die "apply phase ended with $CODEX_OUTCOME"
  [[ "$CODEX_CHANGE" == "$expected_change" ]] || die "apply phase returned the wrong change name"
  assert_apply_complete "$expected_change" || die "OpenSpec reports incomplete implementation tasks"

  head_before_finalize=$($GIT_BIN -C "$REPO_ROOT" rev-parse HEAD)
  finalize_prompt=$(printf '%s\n' \
    "Finalize active OpenSpec change '$expected_change'." \
    'Use the openspec-archive-change workflow, including its inline openspec-sync-specs workflow.' \
    'Verify artifacts and tasks are complete, intelligently merge every delta spec into the main specs, validate the specs, and archive the change.' \
    'Then review the complete diff and create exactly one Git commit containing the implementation, completed task artifacts, synchronized main specs, and archived change. Use a concise imperative commit message naming the chunk.' \
    'Do not amend existing commits and do not leave tracked changes uncommitted.' \
    'This is unattended automation: do not ask questions and never skip validation, spec sync, or incomplete work. Return blocked instead.' \
    'Your final response must match the supplied JSON schema. Use outcome finalized only after archive and commit both succeed; otherwise use blocked. Set change to the exact change name.')
  run_codex "finalize:$expected_change" "$finalize_prompt"
  [[ "$CODEX_OUTCOME" == "finalized" || "$CODEX_OUTCOME" == "complete" ]] || \
    die "finalize phase ended with $CODEX_OUTCOME"
  [[ "$CODEX_CHANGE" == "$expected_change" ]] || die "finalize phase returned the wrong change name"

  read_active_changes ACTIVE_AFTER_FINALIZE
  (( ${#ACTIVE_AFTER_FINALIZE[@]} == 0 )) || die "finalize phase left an active OpenSpec change"
  is_archived "$expected_change" || die "archive for '$expected_change' was not found"
  head_after_finalize=$($GIT_BIN -C "$REPO_ROOT" rev-parse HEAD)
  [[ "$head_after_finalize" != "$head_before_finalize" ]] || die "finalize phase did not create a commit"
  [[ -z "$($GIT_BIN -C "$REPO_ROOT" status --porcelain)" ]] || die "finalize phase left a dirty Git worktree"
  after_count=$(completed_count)
  (( after_count == before_count + 1 )) || die "completed chunk count did not advance by exactly one"
  log "Completed and committed $expected_change ($after_count/${#ROADMAP_CHANGES[@]})"
done

die "iteration limit reached before every roadmap chunk was archived"
