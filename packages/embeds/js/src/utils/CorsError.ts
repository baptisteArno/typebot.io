export class CorsError extends Error {
  constructor(origin: string) {
    super('This bot can only be executed on ' + origin)
  }
}
