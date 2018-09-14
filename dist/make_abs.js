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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZV9hYnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWFrZV9hYnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVk7O0FBRVosMEJBQTRCO0FBQzVCLDhCQUFnQztBQUNoQywyQkFBNkI7QUFFN0IsY0FBYztBQUVkLGlCQUFtQixDQUFDO0lBRWxCLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBRyxDQUFDLENBQUUsSUFBSSxLQUFLLENBQUcsQ0FBQyxDQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBRyxDQUFDLENBQUcsQ0FBQztRQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFFMUUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRyxFQUFFLENBQUMsQ0FBRSxDQUFDO0FBRTVDLENBQUM7QUFFRCxZQUFZO0FBRVosa0JBQWUsT0FBTyxDQUFDIn0=