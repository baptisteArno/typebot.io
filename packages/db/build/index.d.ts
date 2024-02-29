/**
 * Model Account
 *
 */
export declare type Account = {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
    oauth_token_secret: string | null;
    oauth_token: string | null;
    refresh_token_expires_in: number | null;
};
/**
 * Model Session
 *
 */
export declare type Session = {
    id: string;
    sessionToken: string;
    userId: string;
    expires: Date;
};
/**
 * Model User
 *
 */
export declare type User = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    lastActivityAt: Date;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    apiToken: string | null;
    company: string | null;
    onboardingCategories: string[];
    graphNavigation: GraphNavigation | null;
};
/**
 * Model Workspace
 *
 */
export declare type Workspace = {
    id: string;
    name: string;
    icon: string | null;
    createdAt: Date;
    plan: Plan;
    stripeId: string | null;
};
/**
 * Model MemberInWorkspace
 *
 */
export declare type MemberInWorkspace = {
    userId: string;
    workspaceId: string;
    role: WorkspaceRole;
};
/**
 * Model WorkspaceInvitation
 *
 */
export declare type WorkspaceInvitation = {
    id: string;
    createdAt: Date;
    email: string;
    workspaceId: string;
    type: WorkspaceRole;
};
/**
 * Model CustomDomain
 *
 */
export declare type CustomDomain = {
    name: string;
    createdAt: Date;
    workspaceId: string | null;
};
/**
 * Model Credentials
 *
 */
export declare type Credentials = {
    id: string;
    createdAt: Date;
    workspaceId: string | null;
    data: string;
    name: string;
    type: string;
    iv: string;
};
/**
 * Model VerificationToken
 *
 */
export declare type VerificationToken = {
    identifier: string;
    token: string;
    expires: Date;
};
/**
 * Model DashboardFolder
 *
 */
export declare type DashboardFolder = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    parentFolderId: string | null;
    workspaceId: string | null;
};
/**
 * Model Typebot
 *
 */
export declare type Typebot = {
    id: string;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date | null;
    updatedBy: string | null;
    deletedAt: Date | null;
    deletedBy: string | null;
    icon: string | null;
    name: string;
    publishedTypebotId: string | null;
    folderId: string | null;
    blocks: [];
    variables: [];
    edges: [];
    theme: {};
    settings: {};
    publicId: string | null;
    customDomain: string | null;
    subDomain: string;
    workspaceId: string | null;
    domain: string | null;
    availableFor: string[];
};
/**
 * Model Invitation
 *
 */
export declare type Invitation = {
    createdAt: Date;
    email: string;
    typebotId: string;
    type: CollaborationType;
};
/**
 * Model CollaboratorsOnTypebots
 *
 */
export declare type CollaboratorsOnTypebots = {
    userId: string;
    typebotId: string;
    type: CollaborationType;
};
/**
 * Model PublicTypebot
 *
 */
export declare type PublicTypebot = {
    id: string;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date | null;
    updatedBy: string | null;
    deletedAt: Date | null;
    deletedBy: string | null;
    typebotId: string;
    name: string;
    blocks: [];
    variables: [];
    edges: [];
    theme: {};
    settings: {};
    publicId: string | null;
    customDomain: string | null;
};
/**
 * Model Result
 *
 */
export declare type Result = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    typebotId: string;
    variables: [];
    isCompleted: boolean;
};
/**
 * Model Log
 *
 */
export declare type Log = {
    id: string;
    createdAt: Date;
    resultId: string;
    status: string;
    description: string;
    details: string | null;
};
/**
 * Model Answer
 *
 */
export declare type Answer = {
    createdAt: Date;
    resultId: string;
    stepId: string;
    blockId: string;
    variableId: string | null;
    content: string;
};
/**
 * Model Coupon
 *
 */
export declare type Coupon = {
    userPropertiesToUpdate: {};
    code: string;
    dateRedeemed: Date | null;
};
/**
 * Model Webhook
 *
 */
export declare type Webhook = {
    id: string;
    url: string | null;
    method: string;
    queryParams: [];
    headers: [];
    body: string | null;
    typebotId: string;
};
/**
 * Enums
 */
export declare const GraphNavigation: {
    MOUSE: string;
    TRACKPAD: string;
};
export declare type GraphNavigation = (typeof GraphNavigation)[keyof typeof GraphNavigation];
export declare const Plan: {
    FREE: string;
    PRO: string;
    TEAM: string;
    LIFETIME: string;
    OFFERED: string;
};
export declare type Plan = (typeof Plan)[keyof typeof Plan];
export declare const WorkspaceRole: {
    ADMIN: string;
    MEMBER: string;
    GUEST: string;
};
export declare type WorkspaceRole = (typeof WorkspaceRole)[keyof typeof WorkspaceRole];
export declare const CollaborationType: {
    READ: string;
    WRITE: string;
    FULL_ACCESS: string;
};
export declare type CollaborationType = (typeof CollaborationType)[keyof typeof CollaborationType];
