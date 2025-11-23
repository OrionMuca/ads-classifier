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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAdDto = exports.CreateAdDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateAdDto {
    title;
    image;
    link;
    position;
    layout;
    active;
}
exports.CreateAdDto = CreateAdDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Title must be at least 3 characters long' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Title must not exceed 200 characters' }),
    __metadata("design:type", String)
], CreateAdDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Image must be a valid URL' }),
    __metadata("design:type", String)
], CreateAdDto.prototype, "image", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Link must be a valid URL' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "link", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: 'Position must be 0 or greater' }),
    __metadata("design:type", Number)
], CreateAdDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AdLayout, { message: 'Layout must be either CARD or BANNER' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "layout", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateAdDto.prototype, "active", void 0);
class UpdateAdDto {
    title;
    image;
    link;
    position;
    layout;
    active;
}
exports.UpdateAdDto = UpdateAdDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Title must be at least 3 characters long' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Title must not exceed 200 characters' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAdDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Image must be a valid URL' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAdDto.prototype, "image", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Link must be a valid URL' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAdDto.prototype, "link", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: 'Position must be 0 or greater' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAdDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AdLayout, { message: 'Layout must be either CARD or BANNER' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAdDto.prototype, "layout", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateAdDto.prototype, "active", void 0);
//# sourceMappingURL=ad.dto.js.map