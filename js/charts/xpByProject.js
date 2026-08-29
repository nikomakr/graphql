function squarify(items, x, y, w, h) {
  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const results = [];
  if (total <= 0 || items.length === 0) {
    return results;
  }
  layoutRow(items.slice(), x, y, w, h, total, results);
  return results;
}

function worstRatio(row, rowSum, shorterSide, total, totalArea) {
  if (rowSum === 0) return Infinity;
  const rowArea = (rowSum / total) * totalArea;
  const rowThickness = rowArea / shorterSide;
  let maxRatio = 0;
  row.forEach((item) => {
    const itemArea = (item.amount / total) * totalArea;
    const itemLength = itemArea / rowThickness;
    const ratio = Math.max(
      rowThickness / itemLength,
      itemLength / rowThickness,
    );
    maxRatio = Math.max(maxRatio, ratio);
  });
  return maxRatio;
}

function layoutRow(items, x, y, w, h, total, results) {
  if (items.length === 0) return;

  const shorterSide = Math.min(w, h);
  const totalArea = w * h;

  let row = [];
  let rowSum = 0;
  let i = 0;

  while (i < items.length) {
    const testRow = row.concat([items[i]]);
    const testSum = rowSum + items[i].amount;
    const worstCurrent = row.length
      ? worstRatio(row, rowSum, shorterSide, total, totalArea)
      : Infinity;
    const worstTest = worstRatio(
      testRow,
      testSum,
      shorterSide,
      total,
      totalArea,
    );

    if (row.length === 0 || worstTest <= worstCurrent) {
      row = testRow;
      rowSum = testSum;
      i++;
    } else {
      break;
    }
  }

  const rowArea = (rowSum / total) * totalArea;
  const rowThickness = rowArea / shorterSide;
  const isWide = w >= h;

  let offset = 0;
  row.forEach((item) => {
    const itemArea = (item.amount / total) * totalArea;
    const itemLength = itemArea / rowThickness;

    if (isWide) {
      results.push({
        ...item,
        x,
        y: y + offset,
        width: rowThickness,
        height: itemLength,
      });
    } else {
      results.push({
        ...item,
        x: x + offset,
        y,
        width: itemLength,
        height: rowThickness,
      });
    }
    offset += itemLength;
  });

  const remaining = items.slice(row.length);
  if (remaining.length > 0) {
    if (isWide) {
      layoutRow(
        remaining,
        x + rowThickness,
        y,
        w - rowThickness,
        h,
        total - rowSum,
        results,
      );
    } else {
      layoutRow(
        remaining,
        x,
        y + rowThickness,
        w,
        h - rowThickness,
        total - rowSum,
        results,
      );
    }
  }
}

function buildLabelPlan(rect) {
  const words = rect.name.split("-").filter(Boolean);
  const fontSize = 9;
  const charWidth = fontSize * 0.62;
  const lineHeight = fontSize + 3;
  const valueLineHeight = 9;
  const hPadding = 10;
  const vPadding = 8;

  const maxWordWidth = Math.max(...words.map((w) => w.length * charWidth));
  const nameBlockHeight = words.length * lineHeight;

  const fitsWidth = rect.width >= maxWordWidth + hPadding;
  const fitsNameOnly = fitsWidth && rect.height >= nameBlockHeight + vPadding;
  const fitsNameAndValue =
    fitsWidth &&
    rect.height >= nameBlockHeight + valueLineHeight + vPadding + 4;

  if (fitsNameAndValue) {
    return { words, showValue: true, fontSize, lineHeight, valueLineHeight };
  }
  if (fitsNameOnly) {
    return { words, showValue: false, fontSize, lineHeight, valueLineHeight };
  }
  return null;
}

function blueShade(ratio) {
  const light = [140, 200, 255];
  const dark = [10, 40, 90];
  const rgb = light.map((c, i) => Math.round(c + (dark[i] - c) * ratio));
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  const textColor = brightness > 140 ? "#06121d" : "#e6edf3";
  return { fill: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`, textColor };
}

async function renderXpByProjectChart() {
  const result = await getXpByProject();
  if (!result.success || result.items.length === 0) {
    return;
  }

  const svg = document.getElementById("xp-project-chart");
  const tooltip = document.getElementById("treemap-tooltip");
  const width = 560;
  const height = 400;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const layout = squarify(result.items, 0, 0, width, height);
  const maxAmount = Math.max(...result.items.map((i) => i.amount));

  let content = "";
  layout.forEach((rect, i) => {
    const ratio = maxAmount > 0 ? rect.amount / maxAmount : 0;
    const { fill: color, textColor } = blueShade(ratio);
    const plan = buildLabelPlan(rect);

    let labelMarkup = "";
    if (plan) {
      const startY = rect.y + 6 + plan.fontSize;
      const nameLines = plan.words
        .map(
          (word, li) =>
            `<tspan x="${(rect.x + 6).toFixed(1)}" dy="${li === 0 ? 0 : plan.lineHeight}">${escapeHtml(word)}</tspan>`,
        )
        .join("");

      labelMarkup = `<text y="${startY.toFixed(1)}" class="treemap-label" style="font-size:${plan.fontSize}px;fill:${textColor}">${nameLines}</text>`;

      if (plan.showValue) {
        const valueY =
          startY +
          (plan.words.length - 1) * plan.lineHeight +
          plan.valueLineHeight +
          4;
        labelMarkup += `<text x="${(rect.x + 6).toFixed(1)}" y="${valueY.toFixed(1)}" class="treemap-value" style="fill:${textColor}">${formatXp(rect.amount)}</text>`;
      }
    }

    content += `<g class="treemap-cell" data-name="${escapeHtml(rect.name)}" data-value="${formatXp(rect.amount)}">
      <rect x="${rect.x.toFixed(1)}" y="${rect.y.toFixed(1)}" width="${rect.width.toFixed(1)}" height="${rect.height.toFixed(1)}" fill="${color}" fill-opacity="0.7" stroke="var(--void)" stroke-width="2"/>
      ${labelMarkup}
    </g>`;
  });

  svg.innerHTML = content;

  svg.querySelectorAll(".treemap-cell").forEach((cell) => {
    cell.addEventListener("mouseenter", () => {
      tooltip.textContent = `${cell.dataset.name}: ${cell.dataset.value}`;
      tooltip.hidden = false;
    });
    cell.addEventListener("mousemove", (e) => {
      const wrapRect = svg.parentElement.getBoundingClientRect();
      positionTooltipSmart(tooltip, wrapRect, e.clientX, e.clientY);
    });
    cell.addEventListener("mouseleave", () => {
      tooltip.hidden = true;
    });
  });
}
