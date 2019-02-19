
/* IMPORT */

import mergeWith = require ( 'lodash/mergeWith' );
import isArray = require ( 'lodash/isArray' );
import chalk from 'chalk';
import * as del from 'del';
import * as execa from 'execa';
import * as fs from 'fs';
import * as globby from 'globby';
import * as got from 'got';
import * as isUrl from 'is-url';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as svg2font from 'svgicons2svgfont';
import * as temp from 'temp';
import * as ttf2woff2 from 'ttf2woff2';
import copy from './copy';
import exit from './exit';
import makeAbs from './make_abs';

temp.track ();

/* ICON FONT BUILDR */

class IconFontBuildr {

  /* VARIABLES */

  configDefault; config; paths;

  /* CONSTRUCTOR */

  constructor ( config? ) {

    this.configInit ( config );
    this.configCheck ();

  }

  /* CONFIG */

  configInit ( config? ) {

    this.configDefault = {
      sources: [],
      icons: [],
      output: {
        codepoints: false,
        ligatures: true,
        icons: undefined,
        fonts: path.join ( process.cwd (), 'icon_font' ),
        fontName: 'IconFont',
        formats: [
          'eot',
          'ttf',
          'woff',
          'woff2'
        ]
      }
    };

    this.config = mergeWith ( {}, this.configDefault, config, ( prev, next ) => isArray ( next ) ? next : undefined );

    this.config.icons = Object.keys(this.config.icons).reduce( ( obj, val ) => {
        const iconConfig = this.config.icons [ val ],
              key = iconConfig.icon || iconConfig

        if( !obj [ key ] ) obj [ key ] = { glyphs: [] };

        let icon = {
          name: iconConfig.name || key,
          codepoint: iconConfig.codepoint,
          ligature: iconConfig.ligature || key.replace ( /-/g, '_' ) // Hyphens aren't supported
        }

        if ( typeof icon.codepoint === 'number' ) icon.codepoint = String.fromCharCode ( icon.codepoint );

        obj[key].glyphs.push(icon);

        return obj
    }, {});
    this.config.sources = this.config.sources.map ( makeAbs );
    this.config.output.icons = makeAbs ( this.config.output.icons );
    this.config.output.fonts = makeAbs ( this.config.output.fonts );

  }

  configCheck () {

    if ( !this.config.sources.length ) exit ( 'You need to provide at least one source, both remote and local sources are supported' );

    const sourceUntokenized = this.config.sources.find ( source => !source.includes ( '[icon]' ) );

    if ( sourceUntokenized ) exit ( `The "${chalk.bold ( sourceUntokenized )}" source doesn't include the "${chalk.bold ( '[icon]' )}" token` );

    if ( !Object.keys(this.config.icons).length ) exit ( 'You need to provide at least one icon' );

    Object.keys ( this.config.icons ).map( key => this.config.icons [ key ] ).reduce( ( checkObject, icon ) => {
      icon.glyphs.forEach( glyph => {
        const { name, codepoint, ligature } = glyph;

        if ( checkObject.names.indexOf( name ) !== -1 ) exit ( `Glyph name "${ name }" was defined multiple times!` );
        checkObject.names.push ( name );

        if ( this.config.output.codepoints && codepoint ) {
          if ( checkObject.codepoints.indexOf( codepoint ) !== -1 ) exit ( `Codepoint "${ codepoint }" was defined multiple times (glyph "${ name }")!` );
          checkObject.codepoints.push ( codepoint );
        }

        if ( this.config.output.ligatures && ligature ) {
          if ( checkObject.ligatures.indexOf( ligature ) !== -1 ) exit ( `Ligature "${ ligature }" was defined multiple times (glyph "${ name }")!` );
          checkObject.ligatures.push ( ligature );
        }
      });

      return checkObject;
    }, { names: [], codepoints: [], ligatures: [] });

    const formats = this.configDefault.output.formats;

    if ( !this.config.output.formats.length ) exit ( `You need to provide at least one format, supported formats: ${formats.map ( format => `"${chalk.bold ( format )}"` ).join ( ', ' )}` );

    if ( !this.config.output.codepoints && !this.config.output.ligatures ) exit ( `Both "${chalk.bold ( 'output.codepoints' )}" and "${chalk.bold ( 'output.ligatures' )}" can't be "${chalk.bold ( 'false' )}"` );

    const formatUnsupported = this.config.output.formats.find ( format => !formats.includes ( format ) );

    if ( formatUnsupported ) exit ( `The format "${chalk.bold ( formatUnsupported )}" is not supported, supported formats: ${formats.map ( format => `"${chalk.bold ( format )}"` ).join ( ', ' )}` );

    if ( !this.config.output.fontName ) exit ( 'You need to provide a valid font name' );

  }

  /* PATHS */

  pathsInit () {

    const { fonts: fontsDir, fontName } = this.config.output,
          tempDir = temp.mkdirSync ( 'icon-font-buildr' );

    this.paths = {
      cache: {
        root: tempDir,
        icons: this.config.output.icons || path.join ( tempDir, 'icons' ),
        fontSVG: path.join ( tempDir, `${fontName}.svg` ),
        fontTTF: path.join ( tempDir, `${fontName}.ttf` ),
        fontEOT: path.join ( tempDir, `${fontName}.eot` ),
        fontWOFF: path.join ( tempDir, `${fontName}.woff` ),
        fontWOFF2: path.join ( tempDir, `${fontName}.woff2` )
      },
      output: {
        fontSVG: path.join ( fontsDir, `${fontName}.svg` ),
        fontTTF: path.join ( fontsDir, `${fontName}.ttf` ),
        fontEOT: path.join ( fontsDir, `${fontName}.eot` ),
        fontWOFF: path.join ( fontsDir, `${fontName}.woff` ),
        fontWOFF2: path.join ( fontsDir, `${fontName}.woff2` )
      }
    };

    mkdirp.sync ( this.paths.cache.icons );
    mkdirp.sync ( fontsDir );

  }

  pathsReset () {

    del.sync ( this.paths.cache.root, { force: true } );

  }

  /* DOWNLOAD */

  async downloadIcons () {

    const downloaders = [this.downloadIconLocal.bind ( this ), this.downloadIconRemote.bind ( this )];

    await Promise.all ( Object.keys(this.config.icons).map(key => this.config.icons[key].src || key).map ( async icon => {

      const dst = path.join ( this.paths.cache.icons, `${icon}.svg` );

      let downloaded = false;

      for ( let si = 0, sl = this.config.sources.length; !downloaded && si < sl; si++ ) {

        const srcTokenized = this.config.sources[si],
              src = srcTokenized.replace ( '[icon]', icon );

        for ( let di = 0, dl = downloaders.length; !downloaded && di < dl; di++ ) {

          const downloader = downloaders[di];

          downloaded = await downloader ( src, dst );

        }

      }

      if ( !downloaded ) exit ( `The "${chalk.bold ( icon )}" icon has not been found in any of the sources` );

    }));

  }

  async downloadIconRemote ( src, dst ) {

    if ( !isUrl ( src ) ) return false;

    try {

      const {body} = await got ( src );

      fs.writeFileSync ( dst, body );

      console.log ( `Downloaded "${chalk.bold ( src )}"` );

      return true;

    } catch ( e ) {

      return false;

    }

  }

  downloadIconLocal ( src, dst ) {

    if ( !fs.existsSync ( src ) ) return false;

    copy ( src, dst );

    console.log ( `Copied "${chalk.bold ( src )}"` );

    return true;

  }

  /* ICONS */

  async getIcons () {

    const filePaths = ( await globby ( '*.svg', { cwd: this.paths.cache.icons, absolute: true } ) ).sort (), // Ensuring the order is fixed
          codepointStart = '\uE000'.charCodeAt ( 0 ), // Beginning of Unicode's private use area
          usedCodepoints: any = [],
          icons = {};

    let codepointOffset = 0;

    filePaths.forEach ( filePath => {
      icons [ filePath ] = { filePath, glyphs: [] }

      const basename = path.basename ( filePath, path.extname ( filePath ) ),
            iconConfig = this.config.icons [ basename ];

      iconConfig.glyphs.forEach( glyph => {
        let { codepoint } = glyph;

        while ( !codepoint || usedCodepoints.indexOf ( codepoint ) !== -1 ) {
          codepoint = String.fromCharCode ( codepointStart + ( codepointOffset++ ) )
        }

        usedCodepoints.push(codepoint);
        const codepointHex = codepoint.charCodeAt ( 0 ).toString ( 16 );

        icons [ filePath ].glyphs.push ( mergeWith ( glyph, { codepoint, codepointHex } ) );
      });
    });

    return icons;
  }

  async getIconsCodepoints ( hex = false ) {

    const icons = await this.getIcons (),
          values = Object.values ( icons ) as any[]; //TSC

    return values.reduce ( ( acc, icon ) => {

      icon.glyphs.forEach( glyph => {
        acc[glyph.name] = hex ? glyph.codepointHex : glyph.codepoint;
      });

      return acc;

    }, {} );

  }

  async getIconsLigatures () {

    const icons = await this.getIcons (),
          values = Object.values ( icons ) as any[]; //TSC

    return values.reduce ( ( acc, icon ) => {

      icon.glyphs.forEach( glyph => {
        acc[glyph.name] = glyph.ligature;
      });

      return acc;

    }, {} );

  }

  /* BUILD */

  async build  () {

    this.pathsInit ();

    await this.downloadIcons ();

    await this.buildFontSVG ();
    await this.buildFontTTF ();
    await this.buildFontEOT ();
    await this.buildFontWOFF ();
    await this.buildFontWOFF2 ();

    this.outputFonts ();

    this.pathsReset ();

  }

  async buildFontSVG () {

    const icons = await this.getIcons ();
    console.dir(icons, { depth: null })

    const stream = new svg2font ({
      centerHorizontally: true,
      fontHeight: 4096,
      fontName: this.config.output.fontName,
      normalize: true
    });

    stream.pipe ( fs.createWriteStream ( this.paths.cache.fontSVG ) );

    Object.values ( icons ).forEach ( ( iconGlyphs: any ) => { //TSC
      iconGlyphs.glyphs.forEach( glyphData => {
        const glyph: any = fs.createReadStream ( iconGlyphs.filePath ), //TSC
              unicode: string[] = [];

        if ( this.config.output.codepoints ) unicode.push ( glyphData.codepoint );
        if ( this.config.output.ligatures ) unicode.push ( glyphData.ligature );

        glyph.metadata = {
          unicode,
          name: glyphData.name
        };
        console.log(glyph.metadata)

        stream.write ( glyph );

      });
    });

    stream.end ();

  }

  async buildFontTTF () {

    await execa ( 'npx', ['svg2ttf', this.paths.cache.fontSVG, this.paths.cache.fontTTF] );

  }

  async buildFontEOT () {

    await execa ( 'npx', ['ttf2eot', this.paths.cache.fontTTF, this.paths.cache.fontEOT] );

  }

  async buildFontWOFF () {

    await execa ( 'npx', ['ttf2woff', this.paths.cache.fontTTF, this.paths.cache.fontWOFF] );

  }

  async buildFontWOFF2 () {

    const ttf = fs.readFileSync ( this.paths.cache.fontTTF ),
          woff2 = ttf2woff2 ( ttf );

    fs.writeFileSync ( this.paths.cache.fontWOFF2, woff2 );

  }

  /* OUTPUT */

  outputFonts () {

    this.config.output.formats.forEach ( format => {

      const src = this.paths.cache[`font${format.toUpperCase ()}`],
            dst = this.paths.output[`font${format.toUpperCase ()}`];

      copy ( src, dst );

    });

  }

}

/* EXPORT */

export default IconFontBuildr;
