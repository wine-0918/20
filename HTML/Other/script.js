const buttons = document.querySelectorAll(".color-btn");
const solutionOutput = document.getElementById("solution-output");
const targetColorSelect = document.getElementById("target-color");
targetColorSelect.value = "any";
const targetCountSelect = document.getElementById("target-count");
const applyColorsBtn = document.getElementById("apply-colors");
const setColorSelects = document.querySelectorAll(".set-color");
const decideBtn = document.getElementById("decide-button");

const colorCycle = ["red", "blue", "yellow"];
let lastPressed = -1;

function getNextColor(color) {
  const index = colorCycle.indexOf(color);
  return colorCycle[(index + 1) % colorCycle.length];
}

function setColor(index, color) {
  buttons[index].classList.remove("red", "blue", "yellow");
  buttons[index].classList.add(color);
  buttons[index].dataset.color = color;
}

function randomColor() {
  return colorCycle[Math.floor(Math.random() * colorCycle.length)];
}

function initializeButtons() {
  buttons.forEach((btn, i) => {
    const color = randomColor();
    setColor(i, color);
  });
}

function applyCustomColors() {
  setColorSelects.forEach((select, i) => {
    const val = select.value;
    if (val) {
      setColor(i, val);
    } else {
      setColor(i, randomColor());
    }
  });
  solutionOutput.textContent = "初期色を反映しました。";
}

buttons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    if (lastPressed === index) return;
    const left = (index + buttons.length - 1) % buttons.length;
    const right = (index + 1) % buttons.length;

    [left, right].forEach(i => {
      const currentColor = buttons[i].dataset.color;
      const nextColor = getNextColor(currentColor);
      setColor(i, nextColor);
    });

    lastPressed = index;
  });
});

function getCurrentColors() {
  return Array.from(buttons).map(btn => btn.dataset.color);
}

// 色名の日本語変換（表示用）
function colorName(c) {
  return c === "red" ? "赤" : c === "blue" ? "青" : "黄色";
}

// 「どれでもいい」を考慮した判定関数
function isMatch(baseColor, color) {
  return baseColor === "any" || baseColor === color;
}

// 指定されたtargetColorが"any"なら全色で試して最短ルートを探す関数
function findBestSolution(targetColor, targetCount) {
  const candidates = targetColor === "any" ? colorCycle : [targetColor];
  const initialColors = getCurrentColors();
  let bestSolution = null;

  for (const color of candidates) {
    const solution = findSolutionForColor(initialColors, color, targetCount);
    if (solution && (!bestSolution || solution.length < bestSolution.length)) {
      bestSolution = solution;
      bestSolution.color = color; // どの色でそろえたか記録
    }
  }
  return bestSolution;
}

// 1色に絞って最短ルート探索
function findSolutionForColor(initialColors, targetColor, targetCount) {
  const length = initialColors.length;
  let bestSolution = null;

  function check(colors) {
    for (let i = 0; i < length; i++) {
      let count = 0;
      for (let j = 0; j < targetCount; j++) {
        if (colors[(i + j) % length] === targetColor) count++;
        else break;
      }
      if (count === targetCount) return i;
    }
    return -1;
  }

  function clone(arr) {
    return arr.slice();
  }

  function tryActions(depth, maxDepth, history, colors) {
    if (depth > maxDepth) return;
    if (check(colors) !== -1) {
      if (!bestSolution || history.length < bestSolution.length) {
        bestSolution = history.slice();
      }
      return;
    }
    for (let i = 0; i < length; i++) {
      if (history.length > 0 && history[history.length - 1] === i) continue; // 連打防止
      const nextColors = clone(colors);
      const left = (i + length - 1) % length;
      const right = (i + 1) % length;
      nextColors[left] = getNextColor(nextColors[left]);
      nextColors[right] = getNextColor(nextColors[right]);
      history.push(i);
      tryActions(depth + 1, maxDepth, history, nextColors);
      history.pop();
    }
  }

  tryActions(0, 6, [], initialColors);

  return bestSolution;
}

function showSolution() {
  const targetColor = targetColorSelect.value;
  const targetCount = parseInt(targetCountSelect.value);
  const solution = findBestSolution(targetColor, targetCount);

  if (!solution) {
    solutionOutput.textContent = "解決できませんでした。";
  } else {
    const steps = solution.map(i => `ボタン${i + 1}を押す`).join(" → ");
    const finalColorName = colorName(solution.color || targetColor);
    solutionOutput.innerHTML = `<strong>操作手順:</strong> ${steps}<br><strong>説明:</strong> ${solution.length}回の操作で${targetCount}個の${finalColorName}をそろえることができます。`;
  }
}

applyColorsBtn.addEventListener("click", applyCustomColors);
decideBtn.addEventListener("click", showSolution);

initializeButtons();
