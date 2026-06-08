import fs from "node:fs/promises";
import path from "node:path";

const dataDir = path.resolve(process.cwd(), "data");
const profilesPath = path.join(dataDir, "profiles.json");

export async function saveProfile(profile) {
  const profiles = await readProfiles();
  profiles[profile.psid] = {
    ...(profiles[profile.psid] || {}),
    ...profile,
    updatedAt: new Date().toISOString()
  };

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(profilesPath, JSON.stringify(profiles, null, 2), "utf8");
  return profiles[profile.psid];
}

export async function getProfile(psid) {
  const profiles = await readProfiles();
  return profiles[psid] || null;
}

export async function listProfiles() {
  const profiles = await readProfiles();
  return Object.values(profiles).sort((a, b) => {
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  });
}

async function readProfiles() {
  try {
    const raw = await fs.readFile(profilesPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}
