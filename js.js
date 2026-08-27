const SAVE_KEY = "feed-ake-save-v1";

const upgradeData = [
  {
    id: "big-bites",
    icon: "🥕",
    name: "Big bites",
    description: "+1 food per click",
    baseCost: 25,
    effect: "click",
    amount: 1
  },
  {
    id: "snack-bag",
    icon: "🧺",
    name: "Snack bag",
    description: "+5 food per click",
    baseCost: 120,
    effect: "click",
    amount: 5
  },
  {
    id: "super-sandwich",
    icon: "🥪",
    name: "Super sandwich",
    description: "+20 food per click",
    baseCost: 700,
    effect: "click",
    amount: 20
  },
  {
    id: "golden-spoon",
    icon: "🥄",
    name: "Golden spoon",
    description: "+75 food per click",
    baseCost: 3500,
    effect: "click",
    amount: 75
  },
  {
    id: "friendly-helper",
    icon: "🐿️",
    name: "Friendly helper",
    description: "+1 food every second",
    baseCost: 60,
    effect: "auto",
    amount: 1
  },
  {
    id: "feeding-team",
    icon: "🧑‍🍳",
    name: "Feeding team",
    description: "+5 food every second",
    baseCost: 300,
    effect: "auto",
    amount: 5
  },
  {
    id: "food-truck",
    icon: "🚚",
    name: "Food truck",
    description: "+25 food every second",
    baseCost: 1500,
    effect: "auto",
    amount: 25
  },
  {
    id: "ake-cafe",
    icon: "🏡",
    name: "Åke's café",
    description: "+100 food every second",
    baseCost: 9000,
    effect: "auto",
    amount: 100
  },
  {
    id: "magic-apple",
    icon: "✨",
    name: "Magic apple",
    description: "Doubles food from every click",
    baseCost: 18000,
    effect: "multiplier",
    amount: 2
  },
  {
    id: "rainbow-basket",
    icon: "🌈",
    name: "Rainbow basket",
    description: "Adds +500 food every second",
    baseCost: 50000,
    effect: "auto",
    amount: 500
  }
];

const defaultState = {
  food: 0,
  totalFed: 0,
  clickPower: 1,
  autoPerSecond: 0,
  clickMultiplier: 1,
  upgrades: {}
};

let state = loadState();
let toastTimer;

const elements = {
  foodCount: document.getElementById("foodCount"),
  clickPower: document.getElementById("clickPower"),
  autoCount: document.getElementById("autoCount"),
  feedButton: document.getElementById("feedButton"),
  message: document.getElementById("message"),
  happinessText: document.getElementById("happinessText"),
  happinessBar: document.getElementById("happinessBar"),
  upgradeList: document.getElementById("upgradeList"),
  toast: document.getElementById("toast"),
  saveStatus: document.getElementById("saveStatus"),
  resetButton: document.getElementById("resetButton")
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved) return { ...defaultState, upgrades: {} };

    return {
      ...defaultState,
      ...saved,
      food: Math.max(0, Number(saved.food) || 0),
      totalFed: Math.max(0, Number(saved.totalFed) || 0),
      clickPower: Math.max(1, Number(saved.clickPower) || 1),
      autoPerSecond: Math.max(0, Number(saved.autoPerSecond) || 0),
      clickMultiplier: Math.max(1, Number(saved.clickMultiplier) || 1),
      upgrades: saved.upgrades && typeof saved.upgrades === "object"
        ? saved.upgrades
        : {}
    };
  } catch {
    return { ...defaultState, upgrades: {} };
  }
}

function saveState() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    elements.saveStatus.textContent = "Progress saved";

    setTimeout(() => {
      elements.saveStatus.textContent = "Progress saves automatically";
    }, 1200);
  } catch {
    elements.saveStatus.textContent = "Playing in this session";
  }
}

function formatNumber(number) {
  return Math.floor(number).toLocaleString();
}

function getUpgradeCost(upgrade) {
  const level = state.upgrades[upgrade.id] || 0;
  return Math.floor(upgrade.baseCost * Math.pow(1.65, level));
}

function renderUpgrades() {
  elements.upgradeList.innerHTML = upgradeData.map((upgrade) => {
    const level = state.upgrades[upgrade.id] || 0;
    const cost = getUpgradeCost(upgrade);
    const affordable = state.food >= cost;

    return `
      <div class="upgrade">
        <div class="upgrade-icon">${upgrade.icon}</div>
        <div>
          <h3>${upgrade.name} <span>Lv. ${level}</span></h3>
          <p>${upgrade.description}</p>
        </div>
        <button class="buy-button" data-upgrade="${upgrade.id}" ${affordable ? "" : "disabled"}>
          ${formatNumber(cost)} 🍎
        </button>
      </div>
    `;
  }).join("");

  elements.upgradeList.querySelectorAll(".buy-button").forEach((button) => {
    button.addEventListener("click", () => buyUpgrade(button.dataset.upgrade));
  });
}

function render() {
  elements.foodCount.textContent = formatNumber(state.food);
  elements.clickPower.textContent = formatNumber(state.clickPower * state.clickMultiplier);
  elements.autoCount.textContent = formatNumber(state.autoPerSecond);

  const happiness = Math.min(100, state.totalFed % 101);
  elements.happinessText.textContent = `${happiness}%`;
  elements.happinessBar.style.width = `${happiness}%`;

  if (happiness >= 80) {
    elements.message.textContent = "Åke is absolutely delighted! ✨";
  } else if (happiness >= 40) {
    elements.message.textContent = "Åke is feeling much better!";
  } else if (state.totalFed > 0) {
    elements.message.textContent = "Mmm, that was delicious!";
  } else {
    elements.message.textContent = "Åke is hungry!";
  }

  renderUpgrades();
}

function feed() {
  const foodGained = state.clickPower * state.clickMultiplier;

  state.food += foodGained;
  state.totalFed += foodGained;

  elements.feedButton.classList.add("pressed");
  setTimeout(() => elements.feedButton.classList.remove("pressed"), 120);

  const floatNumber = document.createElement("span");
  floatNumber.className = "float-number";
  floatNumber.textContent = `+${formatNumber(foodGained)} 🍎`;
  floatNumber.style.left = `${45 + Math.random() * 10}%`;
  floatNumber.style.top = "35%";

  elements.feedButton.parentElement.appendChild(floatNumber);
  setTimeout(() => floatNumber.remove(), 800);

  render();
  saveState();
}

function buyUpgrade(id) {
  const upgrade = upgradeData.find((item) => item.id === id);
  if (!upgrade) return;

  const cost = getUpgradeCost(upgrade);

  if (state.food < cost) {
    showToast("You need more food for that upgrade.");
    return;
  }

  state.food -= cost;
  state.upgrades[id] = (state.upgrades[id] || 0) + 1;

  if (upgrade.effect === "click") {
    state.clickPower += upgrade.amount;
  } else if (upgrade.effect === "auto") {
    state.autoPerSecond += upgrade.amount;
  } else if (upgrade.effect === "multiplier") {
    state.clickMultiplier *= upgrade.amount;
  }

  showToast(`${upgrade.name} upgraded!`);
  render();
  saveState();
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2200);
}

elements.feedButton.addEventListener("click", feed);

elements.resetButton.addEventListener("click", () => {
  if (!confirm("Reset all your feeding progress?")) return;

  state = { ...defaultState, upgrades: {} };
  saveState();
  render();
  showToast("A fresh start for Åke!");
});

setInterval(() => {
  if (state.autoPerSecond > 0) {
    state.food += state.autoPerSecond;
    state.totalFed += state.autoPerSecond;
    render();
    saveState();
  }
}, 1000);

render();
