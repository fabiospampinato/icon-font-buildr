# Icon Font Buildr

Build custom icon fonts, it supports remote and local icons sources.

## Install

```sh
npm install --global icon-font-buildr # If you want to use the CLI
npm install --save icon-font-buildr # If you want to use the API
```

## Usage

#### CLI

<p align="center">
	<img src="resources/CLI.gif" width="850" alt="CLI">
</p>

```sh
icon-font-buildr --config my_icon_font.json
icon-font-buildr # The `--config` option can be omitted if your configuration file is called `icon_font.json`
```

#### API

```ts
import IconFontBuildr from 'icon-font-buildr';

const builder = new IconFontBuildr ({
  sources: [ // Where to get the icons, both remote and local sources are supported. `[icon]` will be replace with the name of your icon
    path.join ( __dirname, 'icons', '[icon].svg' ),
    'https://material.io/tools/icons/static/icons/baseline-[icon]-24px.svg',
    'https://raw.githubusercontent.com/Templarian/MaterialDesign/master/icons/svg/[icon].svg'
  ],
  icons: [ // Name of the icons to download
    'backup',
    'bug_report',
    'amazon',
    'android-debug-bridge',
    'public_domain'
  ],
  output: {
    // codepoints: true, // Enable support for codepoints
    // ligatures: false, // Disable support for ligatures
    // icons: path.join ( __dirname, 'builder-icons' ), // Where to save the icons, if not provided they won't be stored permanently
    fonts: path.join ( __dirname, 'builder-fonts' ), // Where to save the fonts
    fontName: 'MaterialDesign', // The name of the font to generate
    formats: [ // Font formats to output
      'eot',
      'ttf',
      'woff',
      'woff2'
    ]
  }
});

await builder.build ();

const codepoints = await builder.getIconsCodepoints ( hex? ); // Get a map of icon names to codepoints, useful for generating HTML/CSS/SCSS etc.
const ligatures = await builder.getIconsLigatures (); // Get a map of icon names to ligatures, useful for generating HTML/CSS/SCSS etc.
```

## License

MIT © Fabio Spampinato
