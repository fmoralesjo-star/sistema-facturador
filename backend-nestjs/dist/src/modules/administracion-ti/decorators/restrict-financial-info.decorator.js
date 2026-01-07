"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestrictFinancialInfo = RestrictFinancialInfo;
const common_1 = require("@nestjs/common");
const restrict_financial_info_guard_1 = require("../guards/restrict-financial-info.guard");
function RestrictFinancialInfo() {
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(restrict_financial_info_guard_1.RestrictFinancialInfoGuard));
}
//# sourceMappingURL=restrict-financial-info.decorator.js.map