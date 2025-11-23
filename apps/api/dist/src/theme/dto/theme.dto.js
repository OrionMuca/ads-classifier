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
exports.UpdateThemeDto = exports.CreateThemeDto = void 0;
const class_validator_1 = require("class-validator");
class CreateThemeDto {
    name;
    isActive;
    primary50;
    primary100;
    primary200;
    primary300;
    primary400;
    primary500;
    primary600;
    primary700;
    primary800;
    primary900;
    secondary50;
    secondary100;
    secondary200;
    secondary300;
    secondary400;
    secondary500;
    secondary600;
    secondary700;
    secondary800;
    secondary900;
    accent50;
    accent100;
    accent200;
    accent300;
    accent400;
    accent500;
    accent600;
    accent700;
    accent800;
    accent900;
    background;
    surface;
    textPrimary;
    textSecondary;
    logoUrl;
    faviconUrl;
}
exports.CreateThemeDto = CreateThemeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'Theme name is required' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Theme name must not exceed 100 characters' }),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateThemeDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary50 must be a valid hex color' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "primary50", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary100 must be a valid hex color' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "primary100", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary200 must be a valid hex color' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "primary200", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary300 must be a valid hex color' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "primary300", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary400 must be a valid hex color' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "primary400", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary500 must be a valid hex color' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "primary500", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary600 must be a valid hex color' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "primary600", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary700 must be a valid hex color' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "primary700", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary800 must be a valid hex color' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "primary800", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary900 must be a valid hex color' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "primary900", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "secondary50", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "secondary100", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "secondary200", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "secondary300", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "secondary400", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "secondary500", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "secondary600", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "secondary700", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "secondary800", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "secondary900", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "accent50", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "accent100", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "accent200", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "accent300", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "accent400", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "accent500", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "accent600", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "accent700", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "accent800", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "accent900", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "background", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "surface", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "textPrimary", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "textSecondary", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "logoUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "faviconUrl", void 0);
class UpdateThemeDto {
    name;
    isActive;
    primary50;
    primary100;
    primary200;
    primary300;
    primary400;
    primary500;
    primary600;
    primary700;
    primary800;
    primary900;
    secondary50;
    secondary100;
    secondary200;
    secondary300;
    secondary400;
    secondary500;
    secondary600;
    secondary700;
    secondary800;
    secondary900;
    accent50;
    accent100;
    accent200;
    accent300;
    accent400;
    accent500;
    accent600;
    accent700;
    accent800;
    accent900;
    background;
    surface;
    textPrimary;
    textSecondary;
    logoUrl;
    faviconUrl;
}
exports.UpdateThemeDto = UpdateThemeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateThemeDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "primary50", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "primary100", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "primary200", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "primary300", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "primary400", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "primary500", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "primary600", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "primary700", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "primary800", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "primary900", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "secondary50", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "secondary100", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "secondary200", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "secondary300", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "secondary400", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "secondary500", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "secondary600", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "secondary700", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "secondary800", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "secondary900", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "accent50", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "accent100", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "accent200", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "accent300", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "accent400", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "accent500", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "accent600", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "accent700", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "accent800", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "accent900", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "background", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "surface", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "textPrimary", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "textSecondary", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "logoUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "faviconUrl", void 0);
//# sourceMappingURL=theme.dto.js.map