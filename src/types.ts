
/* MAIN */

type Format = 'eot' | 'ttf' | 'woff' | 'woff2';

type Icon = {
  icon: string,
  name: string,
  codepoints: string[],
  ligatures: string[]
};

type Config = {
  sources: string[]
  icons: (string | Icon)[],
  output: {
    codepoints?: boolean,
    ligatures?: boolean,
    icons?: string,
    fonts: string,
    fontName: string,
    formats: Format[]
  }
};

type Paths = {
  cache: {
    root: string,
    icons: string,
    fontSVG: string,
    fontTTF: string,
    fontEOT: string,
    fontWOFF: string,
    fontWOFF2: string,
  },
  output: {
    fontSVG: string,
    fontTTF: string,
    fontEOT: string,
    fontWOFF: string,
    fontWOFF2: string
  }
};

/* EXPORT */

export type {Icon, Config, Paths};
