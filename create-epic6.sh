#!/usr/bin/env bash
set -euo pipefail

REPO="nikomakr/graphql"
PROJECT="GraphQL"

gh label create Epic6 --repo "$REPO" --color "8250DF" --force

create_issue() {
  local title="$1"
  local label="$2"
  local body="$3"
  gh issue create --repo "$REPO" --title "$title" --label "$label" --project "$PROJECT" --body "$body"
}

create_issue "6.1 Replace projects feed with real names and pass dates" "Epic6" "$(cat <<'TICKETEOF'
**Description:** Replace the current placeholder project list in the projects section with real project names and the date each was passed, using data already available from the XP by project query.

**Requirements:**
- [ ] List shows real project names, not placeholder text
- [ ] Each entry shows the date the project was passed
- [ ] Only passed projects are listed (or clearly indicate status if failed ones are included)
- [ ] List remains scrollable as before

**Acceptance criteria:**
- Project names match what is shown in the XP by project treemap
- Dates are accurate, matching the underlying result data

**Outcome:** The projects list shows real, dated project completions instead of placeholder rows.
TICKETEOF
)"

create_issue "6.2 Wire real skills data into skill matrix" "Epic6" "$(cat <<'TICKETEOF'
**Description:** Replace the static placeholder radar chart in the skills section with real data pulled from skill-type transactions.

**Requirements:**
- [ ] Query skill_* type transactions for the logged-in user
- [ ] Radar chart axes reflect real skill categories present in the data
- [ ] Radar chart shape reflects real skill levels, not hardcoded placeholder values

**Acceptance criteria:**
- Skill values on the chart match the amounts returned by the skill_* transaction query
- Chart updates correctly for the logged-in user, no hardcoded numbers remain

**Outcome:** The skill matrix displays real, current skill data instead of a static mockup.
TICKETEOF
)"

create_issue "6.3 Simplify sidebar to logo and logout only" "Epic6" "$(cat <<'TICKETEOF'
**Description:** Reduce the sidebar navigation to just the logo (linking home) and the sign-out button, removing the other nav items that do not correspond to a real separate view.

**Requirements:**
- [ ] Sidebar retains the nav-logo link
- [ ] Sidebar retains the logout button
- [ ] Other nav items removed or repurposed as needed
- [ ] Layout remains visually balanced after removal

**Acceptance criteria:**
- Sidebar functions correctly with the reduced set of controls
- No leftover broken links or dead click targets

**Outcome:** A cleaner sidebar showing only controls that actually do something.
TICKETEOF
)"

create_issue "6.4 Add scrollable full list for piscine exercises" "Epic6" "$(cat <<'TICKETEOF'
**Description:** Alongside the top-3-most-recent summary per piscine, add a way to scroll through the complete list of exercises for that piscine.

**Requirements:**
- [ ] Top 3 most recent exercises remain visible by default per piscine
- [ ] A scrollable view/expansion shows the full list of exercises for that piscine
- [ ] Works correctly for any number of detected piscines, not just two

**Acceptance criteria:**
- Full exercise list matches the real underlying data, no items missing
- Scrolling behaves smoothly and does not break the card layout

**Outcome:** Users can see the top 3 at a glance, or scroll to see every attempted exercise per piscine.
TICKETEOF
)"

create_issue "6.5 Add developer level title based on level ranges" "Epic6" "$(cat <<'TICKETEOF'
**Description:** Display a developer title/tier alongside the numeric level, based on defined level ranges.

**Requirements:**
- [ ] Level 0-9 shows Aspiring Developer
- [ ] Level 10-19 shows Beginner Developer
- [ ] Level 20-32 shows Apprentice Developer
- [ ] Level 33-41 shows Assistant Developer
- [ ] Level 42-49 shows Basic Developer
- [ ] Level 50 and above shows Junior Developer

**Acceptance criteria:**
- Title shown matches the correct range for the real current level
- No gap in coverage between ranges, every possible level maps to a title

**Outcome:** The profile widget shows both the numeric level and a meaningful title, closing the visual gap in that section.
TICKETEOF
)"

create_issue "6.6 Restyle audit ratio section to match dashboard theme" "Epic6" "$(cat <<'TICKETEOF'
**Description:** Review and restyle the audit ratio section so its colours and visual treatment feel consistent with the rest of the dashboard rather than standing apart.

**Requirements:**
- [ ] Colour choices align with the existing neon-void theme variables
- [ ] Typography and spacing match the conventions used elsewhere on the dashboard
- [ ] Any remaining ad-hoc styling from earlier iterations is cleaned up

**Acceptance criteria:**
- Section visually reads as part of the same design system as the rest of the page
- No leftover unused CSS from earlier audit ratio versions remains in the stylesheet

**Outcome:** A cohesive-looking audit ratio section that no longer feels visually out of place.
TICKETEOF
)"

echo "Epic6 label and all six tickets created."