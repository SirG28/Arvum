import { randomBytes } from "node:crypto";

function slugifyBase(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function generateMachineSlug(title: string) {
  const suffix = randomBytes(3).toString("hex");
  return `${slugifyBase(title)}-${suffix}`;
}
