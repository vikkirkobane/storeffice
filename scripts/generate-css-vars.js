const colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#10b981',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#10b981',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#34d399',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#34d399',
  },
};

const hexToHsl = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1]+hex[1], 16);
    g = parseInt(hex[2]+hex[2], 16);
    b = parseInt(hex[3]+hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1,3), 16);
    g = parseInt(hex.substring(3,5), 16);
    b = parseInt(hex.substring(5,7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h), Math.round(s*100), Math.round(l*100)];
};

const toCss = (h,s,l) => `${h} ${s}% ${l}%`;

console.log(`:root {
  /* Light mode from colors.ts */
  --text: ${toCss(...hexToHsl(colors.light.text))};
  --background: ${toCss(...hexToHsl(colors.light.background))};
  --tint: ${toCsl(...hexToHsl(colors.light.tint))};
  --icon: ${toCsl(...hexToHsl(colors.light.icon))};
  --tabIconDefault: ${toCsl(...hexToHsl(colors.light.tabIconDefault))};
  --tabIconSelected: ${toCsl(...hexToHsl(colors.light.tabIconSelected))};

  /* Semantic aliases (Tailwind shadcn) */
  --foreground: var(--text);
  --card: var(--background);
  --card-foreground: var(--text);
  --popover: var(--background);
  --popover-foreground: var(--text);
  --primary: 160 84 39; /* emerald-600 */
  --primary-foreground: 0 0% 100%;
  --secondary: 210 40% 96%; /* gray-100 */
  --secondary-foreground: var(--text);
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 160 84 39;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 100%;
  --border: 214.3 31.8% 91.4%;
  --input: var(--border);
  --ring: 160 84 39;
  --radius: 0.5rem;
}

.dark {
  /* Dark mode from colors.ts */
  --text: ${toCsl(...hexToHsl(colors.dark.text))};
  --background: ${toCsl(...hexToHsl(colors.dark.background))};
  --tint: ${toCsl(...hexToHsl(colors.dark.tint))};
  --icon: ${toCsl(...hexToHsl(colors.dark.icon))};
  --tabIconDefault: ${toCsl(...hexToHsl(colors.dark.tabIconDefault))};
  --tabIconSelected: ${toCsl(...hexToHsl(colors.dark.tabIconSelected))};

  /* Semantic aliases */
  --foreground: var(--text);
  --card: 222.2 84% 4.9%;
  --card-foreground: var(--text);
  --popover: 222.2 84% 4.9%;
  --popover-foreground: var(--text);
  --primary: 142 70 40; /* green-600 */
  --primary-foreground: 0 0% 100%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: var(--text);
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 142 70 40;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 100%;
  --border: 217.2 32.6% 17.5%;
  --input: var(--border);
  --ring: 142 70 40;
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
`);
