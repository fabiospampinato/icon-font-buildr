
/* IMPORT */

import {describe} from 'ava-spec';
import * as del from 'del';
import * as fs from 'fs';
import * as path from 'path';
import IconFontBuildr from '../dist';
import testURL from './test_url';

/* ICON FONT BUILDER */

describe ( 'Icon Font Buildr', it => {

  it ( 'Creates an icon font', async t => {

    const builder = new IconFontBuildr ({
      sources: [
        path.join ( __dirname, 'icons', '[icon].svg' ),
        'https://material.io/tools/icons/static/icons/baseline-[icon]-24px.svg',
        'https://raw.githubusercontent.com/Templarian/MaterialDesign/master/icons/svg/[icon].svg'
      ],
      icons: [
        'backup',
        'bug_report',
        'amazon',
        'public_domain',
        {
          icon: 'android-debug-bridge',
          name: 'android debug icon',
          codepoints: ['\ue002', '\ue004'],
          ligatures: ['debug', 'bridge']
        }
      ],
      output: {
        codepoints: true,
        ligatures: true,
        icons: path.join ( __dirname, 'buildr-icons' ),
        fonts: path.join ( __dirname, 'buildr-fonts' ),
        fontName: 'IconFont'
      }
    });

    await builder.build ();

    t.true ( fs.existsSync ( path.join ( builder.config.output.icons, 'public_domain.svg' ) ) );
    t.true ( fs.existsSync ( path.join ( builder.config.output.fonts, 'IconFont.woff2' ) ) );

    console.log ( 'Check if the page looks alright, close it to continue...' );

    await testURL ( `file://${encodeURI ( __dirname )}/index.html` );

    del.sync ( builder.config.output.icons );
    del.sync ( builder.config.output.fonts );

  });

});
