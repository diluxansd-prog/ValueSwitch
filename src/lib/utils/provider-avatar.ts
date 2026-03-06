const providerColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export function getProviderColor(name: string) {
  const index =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 6;
  return providerColors[index];
}

export function getProviderInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
