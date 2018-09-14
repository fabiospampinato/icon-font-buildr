declare class IconFontBuildr {
    configDefault: any;
    config: any;
    paths: any;
    constructor(config?: any);
    configInit(config?: any): void;
    configCheck(): void;
    pathsInit(): void;
    pathsReset(): void;
    downloadIcons(): Promise<void>;
    downloadIconRemote(src: any, dst: any): Promise<boolean>;
    downloadIconLocal(src: any, dst: any): boolean;
    getIcons(): Promise<{}>;
    getIconsCodepoints(hex?: boolean): Promise<any>;
    build(): Promise<void>;
    buildFontSVG(): Promise<void>;
    buildFontTTF(): Promise<void>;
    buildFontEOT(): Promise<void>;
    buildFontWOFF(): Promise<void>;
    buildFontWOFF2(): Promise<void>;
    outputFonts(): void;
}
export default IconFontBuildr;
