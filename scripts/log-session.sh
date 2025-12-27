#!/usr/bin/env bash
# Minimal session timer: record start/stop timestamps and duration (minutes).
# Usage:
#   scripts/log-session.sh start   # record start time
#   scripts/log-session.sh stop    # compute diff -> tmp/last_session_minutes
# Files:
#   tmp/session_start          # ISO start timestamp
#   tmp/last_session_minutes   # integer minutes diff between start and stop

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$ROOT_DIR/tmp"
START_FILE="$TMP_DIR/session_start"
LAST_FILE="$TMP_DIR/last_session_minutes"

mkdir -p "$TMP_DIR"

cmd="${1:-}"

iso_now() {
  date -Iseconds
}

case "$cmd" in
  start)
    iso_now >"$START_FILE"
    echo "start recorded: $(cat "$START_FILE")"
    ;;
  stop)
    if [ ! -f "$START_FILE" ]; then
      echo "no start file; run 'start' first" >&2
      exit 1
    fi
    start_ts=$(cat "$START_FILE")
    end_ts=$(iso_now)
    # compute seconds diff using date arithmetic
    start_sec=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "${start_ts//Z/+0000}" "+%s" 2>/dev/null || true)
    end_sec=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "${end_ts//Z/+0000}" "+%s" 2>/dev/null || true)
    if [ -z "$start_sec" ] || [ -z "$end_sec" ]; then
      echo "failed to parse timestamps" >&2
      exit 1
    fi
    diff_min=$(( (end_sec - start_sec + 30) / 60 )) # round to nearest minute
    echo "$diff_min" >"$LAST_FILE"
    echo "duration (min): $diff_min (start=$start_ts, end=$end_ts)"
    ;;
  *)
    echo "usage: $0 {start|stop}" >&2
    exit 1
    ;;
esac

