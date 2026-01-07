"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseController = void 0;
const common_1 = require("@nestjs/common");
const firebase_auth_service_1 = require("./firebase-auth.service");
const firebase_auth_guard_1 = require("./guards/firebase-auth.guard");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
let FirebaseController = class FirebaseController {
    constructor(firebaseAuthService) {
        this.firebaseAuthService = firebaseAuthService;
    }
    async verifyToken(body) {
        try {
            const decodedToken = await this.firebaseAuthService.verifyToken(body.token);
            return {
                valid: true,
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name,
            };
        }
        catch (error) {
            return {
                valid: false,
                error: error.message,
            };
        }
    }
    async getCurrentUser(user) {
        return {
            uid: user.uid,
            email: user.email,
            name: user.name,
            picture: user.picture,
        };
    }
};
exports.FirebaseController = FirebaseController;
__decorate([
    (0, common_1.Post)('verify-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FirebaseController.prototype, "verifyToken", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FirebaseController.prototype, "getCurrentUser", null);
exports.FirebaseController = FirebaseController = __decorate([
    (0, common_1.Controller)('firebase'),
    __metadata("design:paramtypes", [firebase_auth_service_1.FirebaseAuthService])
], FirebaseController);
//# sourceMappingURL=firebase.controller.js.map