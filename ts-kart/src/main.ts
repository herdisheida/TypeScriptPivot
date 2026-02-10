import "./style.css";
import confetti from "canvas-confetti";

// =============================================================
// WORKSHOP 2: POKEMON KART REFACTOR
// =============================================================

// --- Task 7: The Item Box (Discriminated Unions) ---
interface Mushroom {
  type: "mushroom";
  speedBoost: number;
}
interface Coin {
  type: "coin";
  points: number;
}

type Item = Mushroom | Coin;

function getRandomItem(): Item {
  if (Math.random() < 0.5) {
    return { type: "mushroom", speedBoost: 0.5 };
  }
  return { type: "coin", points: 1 };
}

interface IRacer {
  name: string;
  position: number;
  move(): void;
}

// Union type

type RaceState = "idle" | "racing" | "finished";
type MapName = "Rainbow Road" | "Choco Mountain";

abstract class Driver implements IRacer {
  state: RaceState;

  name: string;
  spriteUrl: string;
  laneId: number;
  position: number;
  speed: number;
  element: HTMLDivElement;

  inventory: Item | null;

  constructor(name: string, spriteUrl: string, laneId: number) {
    this.name = name;
    this.spriteUrl = spriteUrl;
    this.laneId = laneId;

    this.position = 0;
    this.speed = Math.random() * 0.5 + 0.2;
    this.state = "idle";

    this.element = document.createElement("div");
    this.element.className = "kart";

    this.inventory = getRandomItem();

    this.element.style.backgroundImage = `url('${spriteUrl}')`;

    const laneElement = document.getElementById(
      `lane-${laneId}`,
    ) as HTMLDivElement;
    laneElement.appendChild(this.element);
  }

  useItem() {
    if (!this.inventory) return;

    switch (this.inventory.type) {
      case "mushroom":
        console.log(`${this.name} used a Mushroom!`);
        this.speed += this.inventory.speedBoost;

        // visual
        this.element.classList.add("mushroom-boost");
        setTimeout(() => this.element.classList.remove("mushroom-boost"), 1500);
        break;

      case "coin":
        console.log(
          `${this.name} collected a Coin worth ${this.inventory.points} points!`,
        );

        // visual
        this.element.classList.add("coin-collect");
        setTimeout(() => this.element.classList.remove("coin-collect"), 1500);
        break;
    }

    this.inventory = null;
  }

  move() {
    if (this.state !== "racing") return;

    this.position += this.speed;
    this.element.style.left = `${this.position}%`;

    if (this.position >= 90) {
      this.state = "finished";
      finishRace(this);
    }
  }
}

class Pikachu extends Driver {
  constructor(lane: number) {
    super(
      "Pikachu",
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
      lane,
    );
  }

  useStar() {
    console.log("Pikachu used a Star!");
    this.speed += 0.5;
    this.element.classList.add("spin");
    setTimeout(() => this.element.classList.remove("spin"), 2000);
  }
}

class Charizard extends Driver {
  constructor(lane: number) {
    super(
      "Charizard",
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
      lane,
    );
  }

  roar() {
    console.log("Charizard Roars!");
    this.element.classList.add("big");
    setTimeout(() => this.element.classList.remove("big"), 2000);
  }
}

class Jigglypuff extends Driver {
  constructor(lane: number) {
    super(
      "Jigglypuff",
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png",
      lane,
    );
  }
}

class Bulbasaur extends Driver {
  constructor(lane: number) {
    super(
      "Bulbasaur",
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
      lane,
    );
  }
}

// --- 2. GAME SETUP ---

const drivers = [
  new Pikachu(0),
  new Charizard(1),
  new Jigglypuff(2),
  new Bulbasaur(3),
];

let currentMap: MapName = "Rainbow Road";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function startRace() {
  const overlay = document.getElementById("overlay") as HTMLDivElement;
  const counter = document.getElementById("counter-text") as HTMLDivElement;
  const btn = document.getElementById("start-btn") as HTMLButtonElement;
  const scoreboard = document.getElementById("scoreboard") as HTMLDivElement;

  btn.disabled = true;
  scoreboard.innerText = "Race Starting...";
  drivers.forEach((d) => {
    d.position = 0;
    d.element.style.left = "0%";
    d.inventory = getRandomItem(); // new race = new random item
  });

  overlay.classList.remove("hidden");

  counter.innerText = "3";
  await sleep(1000);

  counter.innerText = "2";
  await sleep(1000);

  counter.innerText = "1";
  await sleep(1000);

  counter.innerText = "GO!";
  counter.style.color = "gold";
  await sleep(500);

  overlay.classList.add("hidden");

  drivers.forEach((d) => {
    d.state = "racing";
    d.speed = Math.random() * 0.4 + 0.2;
  });

  requestAnimationFrame(gameLoop);
  btn.disabled = false;
}

// --- 3. THE LOOP ---

function gameLoop() {
  let isRaceOn = false;

  drivers.forEach((driver) => {
    if (driver.state === "racing") {
      isRaceOn = true;
      driver.move();

      // 10% chance to use item every frame
      if (Math.random() < 0.1) driver.useItem();

      if (Math.random() < 0.01) {
        if (driver instanceof Pikachu) {
          driver.useStar();
        } else if (driver instanceof Charizard) {
          driver.roar();
        }
      }
    }
  });

  if (isRaceOn) {
    requestAnimationFrame(gameLoop);
  }
}

function finishRace(winner: Driver) {
  const scoreboard = document.getElementById("scoreboard") as HTMLDivElement;
  if (scoreboard.innerText.includes("Winner")) return;

  const message = `Winner: ${winner.name} on ${currentMap}!`;
  scoreboard.innerText = message;

  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#FFD700", "#FF0000", "#00FF00", "#0000FF"],
  });
}

const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
startBtn.addEventListener("click", startRace);
