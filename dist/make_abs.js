"use strict";
/* IMPORT */
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var isUrl = require("is-url");
var path = require("path");
/* MAKE ABS */
function makeAbs(p) {
    if (!_.isString(p) || isUrl(p) || path.isAbsolute(p))
        return p;
    return path.resolve(process.cwd(), p);
}
/* EXPORT */
exports.default = makeAbs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZV9hYnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWFrZV9hYnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVk7O0FBRVosMEJBQTRCO0FBQzVCLDhCQUFnQztBQUNoQywyQkFBNkI7QUFFN0IsY0FBYztBQUVkLFNBQVMsT0FBTyxDQUFHLENBQUM7SUFFbEIsSUFBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUcsQ0FBQyxDQUFFLElBQUksS0FBSyxDQUFHLENBQUMsQ0FBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUcsQ0FBQyxDQUFFO1FBQUcsT0FBTyxDQUFDLENBQUM7SUFFMUUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUcsRUFBRSxDQUFDLENBQUUsQ0FBQztBQUU1QyxDQUFDO0FBRUQsWUFBWTtBQUVaLGtCQUFlLE9BQU8sQ0FBQyJ9