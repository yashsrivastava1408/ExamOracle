const adjectives = ["Silent", "Hidden", "Clever", "Swift", "Brave", "Calm", "Fierce", "Wandering", "Midnight", "Golden", "Crimson", "Azure", "Shadow"];
const animals = ["Fox", "Wolf", "Owl", "Hawk", "Panther", "Tiger", "Bear", "Raven", "Falcon", "Stag", "Lynx", "Viper", "Cobra"];

export function generateAlias(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `${adj}_${animal}${number}`;
}
