"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborationType = exports.WorkspaceRole = exports.Plan = exports.GraphNavigation = void 0;
/**
 * Enums
 */
// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275
exports.GraphNavigation = {
    MOUSE: 'MOUSE',
    TRACKPAD: 'TRACKPAD'
};
exports.Plan = {
    FREE: 'FREE',
    PRO: 'PRO',
    TEAM: 'TEAM',
    LIFETIME: 'LIFETIME',
    OFFERED: 'OFFERED'
};
exports.WorkspaceRole = {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
    GUEST: 'GUEST'
};
exports.CollaborationType = {
    READ: 'READ',
    WRITE: 'WRITE',
    FULL_ACCESS: 'FULL_ACCESS'
};
