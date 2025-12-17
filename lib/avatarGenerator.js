const AVATAR_STYLES = ["avataaars", "pixel-art", "lorelei"];

function getRandomStyle() {
  return AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
}

export function generateAvatarUrl(seed) {
  const style = getRandomStyle();
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(
    seed
  )}&scale=80`;
}
