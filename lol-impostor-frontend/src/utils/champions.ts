export function getChampionImageUrl(championName: string): string {
  // Using Data Dragon for champion square images
  return `https://ddragon.leagueoflegends.com/cdn/13.18.1/img/champion/${championName}.png`;
}

export function getChampionSplashUrl(championName: string): string {
  // Using Data Dragon for champion splash images
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`;
}

// Fallback image in case champion image fails to load
export const FALLBACK_CHAMPION_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjM0Y0MTQ2Ii8+CjxwYXRoIGQ9Ik00MCA0MEg4MFY4MEg0MFY0MFoiIGZpbGw9IiM2Qzc1N0QiLz4KPC9zdmc+';