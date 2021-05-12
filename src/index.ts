
/* IMPORT */

import isArray = require ( 'lodash/isArray' );
import isNumber = require ( 'lodash/isNumber' );
import isString = require ( 'lodash/isString' );
import flatten = require ( 'lodash/flatten' );
import mergeWith = require ( 'lodash/mergeWith' );
import uniq = require ( 'lodash/uniq' );
import {spawnSync} from 'child_process';
import * as fs from 'fs';
import isUrl from 'is-url';
import fetch from 'node-fetch';
import * as path from 'path';
import {color} from 'specialist';
import svg2font from 'svgicons2svgfont';
import * as temp from 'temp';
import * as ttf2woff2 from 'wawoff2';
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
    this.config.icons = this.getIcons ( this.config.icons );
    this.config.sources = this.config.sources.map ( makeAbs );

    if ( isString ( this.config.output.icons ) ) {
      this.config.output.icons = makeAbs ( this.config.output.icons );
    }

    if ( isString ( this.config.output.fonts ) ) {
      this.config.output.fonts = makeAbs ( this.config.output.fonts );
    }

  }

  configCheck () {

    if ( !this.config.sources.length ) exit ( 'You need to provide at least one source, both remote and local sources are supported' );

    const sourceUntokenized = this.config.sources.find ( source => !source.includes ( '[icon]' ) );

    if ( sourceUntokenized ) exit ( `The "${color.bold ( sourceUntokenized )}" source doesn't include the "${color.bold ( '[icon]' )}" token` );

    const icons = Object.values ( this.config.icons ) as any; //TSC

    if ( !icons.length ) exit ( 'You need to provide at least one icon' );

    const names = icons.map ( icon => icon.name );

    if ( names.length !== uniq ( names ).length ) exit ( 'There are duplicated names' );

    const codepoints = flatten ( icons.map ( icon => icon.codepoints ) );

    if ( codepoints.length !== uniq ( codepoints ).length ) exit ( 'There are duplicated codepoints' );

    const ligatures = flatten ( icons.map ( icon => icon.ligatures ) );

    if ( ligatures.length !== uniq ( ligatures ).length ) exit ( 'There are duplicated ligatures' );

    const formats = this.configDefault.output.formats;

    if ( !this.config.output.formats.length ) exit ( `You need to provide at least one format, supported formats: ${formats.map ( format => `"${color.bold ( format )}"` ).join ( ', ' )}` );

    if ( !this.config.output.codepoints && !this.config.output.ligatures ) exit ( `Both "${color.bold ( 'output.codepoints' )}" and "${color.bold ( 'output.ligatures' )}" can't be "${color.bold ( 'false' )}"` );

    const formatUnsupported = this.config.output.formats.find ( format => !formats.includes ( format ) );

    if ( formatUnsupported ) exit ( `The format "${color.bold ( formatUnsupported )}" is not supported, supported formats: ${formats.map ( format => `"${color.bold ( format )}"` ).join ( ', ' )}` );

    if ( !this.config.output.fontName ) exit ( 'You need to provide a valid font name' );

    if ( !isString ( this.config.output.fonts ) ) exit ( 'You need to provide a valid value for the "output.fonts" configuration option' );

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

    fs.mkdirSync ( this.paths.cache.icons, { recursive: true } );
    fs.mkdirSync ( fontsDir, { recursive: true } );

  }

  pathsReset () {

    fs.rmdirSync ( this.paths.cache.root, { recursive: true } );

  }

  /* DOWNLOAD */

  async downloadIcons () {

    const downloaders = [this.downloadIconLocal.bind ( this ), this.downloadIconRemote.bind ( this )];

    await Promise.all ( Object.values ( this.config.icons ).map ( async ({ icon }) => {

      const dst = this.getIconPath ( icon );

      let downloaded = false;

      for ( let si = 0, sl = this.config.sources.length; !downloaded && si < sl; si++ ) {

        const srcTokenized = this.config.sources[si],
              src = srcTokenized.replace ( '[icon]', icon );

        for ( let di = 0, dl = downloaders.length; !downloaded && di < dl; di++ ) {

          const downloader = downloaders[di];

          downloaded = await downloader ( src, dst );

        }

      }

      if ( !downloaded ) exit ( `The "${color.bold ( icon )}" icon has not been found in any of the sources` );

    }));

  }

  async downloadIconRemote ( src: string, dst: string ): Promise<boolean> {

    if ( !isUrl ( src ) ) return false;

    try {

      const response = await fetch ( src );

      if ( response.status !== 200 ) throw new Error ( 'Non-200 request' );

      const content = await response.text ();

      fs.writeFileSync ( dst, content );

      console.log ( `Downloaded "${color.bold ( src )}"` );

      return true;

    } catch ( e ) {

      return false;

    }

  }

  async downloadIconLocal ( src: string, dst: string ): Promise<boolean> {

    if ( !fs.existsSync ( src ) ) return false;

    copy ( src, dst );

    console.log ( `Copied "${color.bold ( src )}"` );

    return true;

  }

  /* ICONS */

  getIcons ( arr ) {

    const icons = arr.reduce ( ( acc, val ) => {

      const icon = val.icon || val,
            name = val.name || icon,
            codepoints = val.codepoints ? this.sanitizeIconCodepoints ( val.codepoints ) : [],
            ligatures = val.ligatures ? this.sanitizeIconLigatures ( val.ligatures ) : [this.sanitizeIconLigature ( icon )];

      acc[icon] = { icon, name, codepoints, ligatures };

      return acc;

    }, {} );

    /* DEFAULT CODEPOINTS */

    const codepointStart = '\uE000'.charCodeAt ( 0 ), // Beginning of Unicode's private use area
          codepoints = flatten ( Object.values ( icons ).map ( ({ codepoints }) => codepoints ) );

    let codepointOffset = 0;

    Object.values ( icons ).forEach ( ( icon: any ) => { //TSC

      if ( icon.codepoints.length ) return;

      while ( true ) { // Finding a free codepoint

        const codepoint = String.fromCharCode ( codepointStart + codepointOffset++ );

        if ( codepoints.includes ( codepoint ) ) continue;

        icon.codepoints = [codepoint];

        break;

      }

    });

    return icons;

  }

  getIconPath ( icon: string ) {

    return path.join ( this.paths.cache.icons, `${icon}.svg` );

  }

  getIconsMap ( mapper: Function ): { [index: string]: any } {

    const map = {};

    for ( let icon in this.config.icons ) {

      map[icon] = mapper ( this.config.icons[icon] );

    }

    return map;

  }

  getIconsCodepoints ( hex: boolean = false ): { [index: string]: string[] } {

    return this.getIconsMap ( icon => !hex ? icon.codepoints : icon.codepoints.map ( codepoint => codepoint.charCodeAt ( 0 ).toString ( 16 ) ) );

  }

  getIconsLigatures (): { [index: string]: string[] } {

    return this.getIconsMap ( icon => icon.ligatures );

  }

  sanitizeIconCodepoint ( codepoint: number | string ): string {

    return isNumber ( codepoint ) ? String.fromCodePoint ( codepoint ) : codepoint;

  }

  sanitizeIconCodepoints ( codepoints: ( number | string )[] ): string[] {

    return uniq ( codepoints.map ( this.sanitizeIconCodepoint ) );

  }

  sanitizeIconLigature ( ligature: string ): string {

    return ligature.replace ( /-/g, '_' ); // Hyphens aren't supported

  }

  sanitizeIconLigatures ( ligatures: string[] ): string[] {

    return uniq ( ligatures.map ( this.sanitizeIconLigature ) );

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

    return new Promise ( ( res, rej ) => {

      const stream = new svg2font ({
        centerHorizontally: true,
        fontHeight: 4096,
        fontName: this.config.output.fontName,
        normalize: true,
        log: () => {}
      });

      stream.pipe ( fs.createWriteStream ( this.paths.cache.fontSVG ) )
            .on ( 'finish', res )
            .on ( 'error', rej );

      Object.values ( this.config.icons ).forEach ( ({ icon, name, codepoints, ligatures }) => {

        const filePath = this.getIconPath ( icon ),
              glyph = fs.createReadStream ( filePath ),
              unicode: string[] = [];

        if ( this.config.output.codepoints ) unicode.push ( ...codepoints );
        if ( this.config.output.ligatures ) unicode.push ( ...ligatures );

        glyph['metadata'] = { unicode, name };

        stream.write ( glyph );

      });

      stream.end ();

    });

  }

  async buildFontTTF () {

    spawnSync ( 'npx', ['svg2ttf', this.paths.cache.fontSVG, this.paths.cache.fontTTF] );

  }

  async buildFontEOT () {

    spawnSync ( 'npx', ['ttf2eot', this.paths.cache.fontTTF, this.paths.cache.fontEOT] );

  }

  async buildFontWOFF () {

    spawnSync ( 'npx', ['ttf2woff', this.paths.cache.fontTTF, this.paths.cache.fontWOFF] );

  }

  async buildFontWOFF2 () {

    const ttf = fs.readFileSync ( this.paths.cache.fontTTF ),
          woff2 = await ttf2woff2.compress ( ttf );

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
