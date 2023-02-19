
/* IMPORT */

import {assert} from 'fava';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import Prompts from 'prompts-helpers';
import IconFontBuildr from '../dist/index.js';

/* MAIN */

const builder = new IconFontBuildr ({
  sources: [
    path.join ( process.cwd (), 'test', 'icons', '[icon].svg' ),
    'https://fonts.gstatic.com/s/i/materialicons/[icon]/v5/24px.svg',
    'https://fonts.gstatic.com/s/i/materialicons/[icon]/v4/24px.svg',
    'https://fonts.gstatic.com/s/i/materialicons/[icon]/v3/24px.svg',
    'https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/[icon].svg'
  ],
  icons: [
    'backup',
    'bug_report',
    'abacus',
    'public_domain',
    {
      icon: 'android-studio',
      name: 'android debug icon',
      codepoints: ['\ue002', '\ue004'],
      ligatures: ['debug', 'bridge']
    }
  ],
  output: {
    codepoints: true,
    ligatures: true,
    icons: path.join ( process.cwd (), 'test', 'buildr-icons' ),
    fonts: path.join ( process.cwd (), 'test', 'buildr-fonts' ),
    fontName: 'IconFont'
  }
});

await builder.build ();

assert.true ( fs.existsSync ( path.join ( builder.config.output.icons, 'public_domain.svg' ) ) );
assert.true ( fs.existsSync ( path.join ( builder.config.output.fonts, 'IconFont.woff2' ) ) );

console.log ( 'Check if the page looks alright, close it to continue...' );
console.log ( `file://${encodeURI ( path.join ( process.cwd (), 'test' ) )}/index.html` );

const result = await Prompts.yesNo ( 'Does it look alright?' );

assert.true ( result );

fs.rmdirSync ( builder.config.output.icons, { recursive: true } );
fs.rmdirSync ( builder.config.output.fonts, { recursive: true } );
