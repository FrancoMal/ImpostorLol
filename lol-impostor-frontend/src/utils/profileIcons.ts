// Available profile icons
export const PROFILE_ICONS = [
  '0.png', '1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png',
  '10.png', '11.png', '12.png', '13.png', '14.png', '15.png', '16.png', '17.png', '18.png', '19.png',
  '20.png', '21.png', '22.png', '23.png', '24.png', '25.png', '26.png', '27.png', '28.png', '29.png',
  '5491.png', '5492.png', '5493.png', '5494.png', '5495.png', '5497.png', '5499.png', '5959.png', '6566.png'
];

export function getProfileIconUrl(iconName: string): string {
  // Use public directory for static assets
  return `/assets/icons/${iconName}`;
}

export function getRandomProfileIcon(): string {
  return PROFILE_ICONS[Math.floor(Math.random() * PROFILE_ICONS.length)];
}