#!/usr/bin/env bash
set -euo pipefail

REPO="nikomakr/graphql"
PROJECT="GraphQL"

create_issue() {
  local title="$1"
  local label="$2"
  local body="$3"
  gh issue create --repo "$REPO" --title "$title" --label "$label" --project "$PROJECT" --body "$body"
}

create_issue "3.1 Build profile view layout" "Epic3" "$(cat <<'TICKETEOF'
**Description:** Create the overall structure of the profile view in index.html.

**Requirements:**
- [ ] Profile view toggled in, replacing the login view, once authenticated
- [ ] Clear sections/regions for identification, XP, third data point, and statistics
- [ ] Responsive layout, readable on mobile width

**Acceptance criteria:**
- Profile view only shows once a valid JWT exists
- Layout does not overlap or break on a narrow viewport
- Logout control is reachable from this view

**Outcome:** An empty but structured profile shell, ready to be populated with real data.
TICKETEOF
)"

create_issue "3.3 Display XP total and third data point" "Epic3" "$(cat <<'TICKETEOF'
**Description:** Add the XP total and your chosen third data point to the profile view.

**Requirements:**
- [ ] XP total calculated from transaction data
- [ ] Third data point chosen and displayed
- [ ] Both values update correctly for the logged-in user

**Acceptance criteria:**
- XP total matches manual calculation from the same data in GraphiQL
- No hardcoded placeholder values remain

**Outcome:** All three required profile data points are live and correct.
TICKETEOF
)"

create_issue "4.1 XP over time animated line graph" "Epic4" "$(cat <<'TICKETEOF'
**Description:** Build an SVG line graph plotting XP earned over time, animated on load.

**Requirements:**
- [ ] Uses the filtered/ordered XP query
- [ ] X-axis represents time, Y-axis represents XP
- [ ] Line/points animate in on load
- [ ] Readable at a glance, with basic axis labels

**Acceptance criteria:**
- Graph accurately reflects the underlying transaction data
- Animation runs once per load
- Renders correctly with very few and with many data points

**Outcome:** A working animated SVG chart showing XP progress over time.
TICKETEOF
)"

echo "3.1, 3.3, 4.1 created."