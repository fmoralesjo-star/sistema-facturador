"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddClosingDateToCompany1767414515901 = void 0;
class AddClosingDateToCompany1767414515901 {
    constructor() {
        this.name = 'AddClosingDateToCompany1767414515901';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users_companies" ADD "fecha_cierre_contable" date`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users_companies" DROP COLUMN "fecha_cierre_contable"`);
    }
}
exports.AddClosingDateToCompany1767414515901 = AddClosingDateToCompany1767414515901;
//# sourceMappingURL=1767414515901-AddClosingDateToCompany.js.map