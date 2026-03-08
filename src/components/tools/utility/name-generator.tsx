"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

const MALE_FIRST = [
  "James", "Robert", "John", "Michael", "David", "William", "Richard", "Joseph",
  "Thomas", "Christopher", "Charles", "Daniel", "Matthew", "Anthony", "Mark",
  "Donald", "Steven", "Andrew", "Paul", "Joshua", "Kenneth", "Kevin", "Brian",
  "George", "Timothy", "Ronald", "Jason", "Edward", "Jeffrey", "Ryan",
  "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin",
  "Scott", "Brandon", "Benjamin", "Samuel", "Raymond", "Gregory", "Frank",
  "Alexander", "Patrick", "Jack", "Dennis", "Jerry", "Tyler", "Nathan", "Henry",
];

const FEMALE_FIRST = [
  "Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth", "Susan",
  "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra",
  "Ashley", "Dorothy", "Kimberly", "Emily", "Donna", "Michelle", "Carol",
  "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura",
  "Cynthia", "Kathleen", "Amy", "Angela", "Shirley", "Anna", "Brenda", "Pamela",
  "Emma", "Nicole", "Helen", "Samantha", "Katherine", "Christine", "Debra",
  "Rachel", "Carolyn", "Janet", "Catherine", "Maria", "Heather", "Diane", "Olivia",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen",
  "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera",
  "Campbell", "Mitchell", "Carter", "Roberts", "Phillips", "Evans", "Turner",
];

const ADJECTIVES = [
  "Swift", "Brave", "Clever", "Dark", "Epic", "Fierce", "Grand", "Happy",
  "Iron", "Jade", "Keen", "Lunar", "Mystic", "Noble", "Omega", "Prime",
  "Quick", "Royal", "Shadow", "Turbo", "Ultra", "Vivid", "Wild", "Xenon",
  "Zesty", "Atomic", "Blaze", "Cosmic", "Drift", "Frost", "Glow", "Hyper",
  "Neon", "Pixel", "Quantum", "Sonic", "Cyber", "Storm", "Nova", "Echo",
];

const NOUNS = [
  "Wolf", "Eagle", "Tiger", "Dragon", "Phoenix", "Falcon", "Hawk", "Bear",
  "Lion", "Shark", "Cobra", "Panther", "Raven", "Fox", "Viper", "Panda",
  "Knight", "Ninja", "Wizard", "Pilot", "Hunter", "Rider", "Ranger", "Scout",
  "Blade", "Star", "Spark", "Bolt", "Wave", "Flame", "Forge", "Crest",
  "Core", "Byte", "Node", "Arc", "Zen", "Ace", "Sage", "Apex",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(type: string, gender: string): string {
  const firstPool =
    gender === "male" ? MALE_FIRST : gender === "female" ? FEMALE_FIRST : [...MALE_FIRST, ...FEMALE_FIRST];

  switch (type) {
    case "first":
      return pick(firstPool);
    case "last":
      return pick(LAST_NAMES);
    case "username": {
      const style = Math.random();
      const num = Math.floor(Math.random() * 999) + 1;
      if (style < 0.33) return `${pick(ADJECTIVES)}${pick(NOUNS)}${num}`;
      if (style < 0.66) return `${pick(firstPool)}${pick(NOUNS)}${num}`;
      return `${pick(ADJECTIVES)}_${pick(firstPool)}${num}`;
    }
    default:
      return `${pick(firstPool)} ${pick(LAST_NAMES)}`;
  }
}

export function NameGenerator() {
  const [type, setType] = useState("full");
  const [gender, setGender] = useState("any");
  const [count, setCount] = useState(10);
  const [names, setNames] = useState<string[]>([]);

  const generate = () => {
    const result: string[] = [];
    for (let i = 0; i < count; i++) result.push(generateName(type, gender));
    setNames(result);
  };

  const selectClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
              <option value="full">Full Name</option>
              <option value="first">First Name Only</option>
              <option value="last">Last Name Only</option>
              <option value="username">Username</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
              <option value="any">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Count</label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value))))}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generate}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {names.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Generated Names ({names.length})
            </h3>
            <CopyButton text={names.join("\n")} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {names.map((name, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2"
              >
                <span className="truncate text-sm text-foreground">{name}</span>
                <CopyButton text={name} className="ml-2 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
