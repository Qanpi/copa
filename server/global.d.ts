export {};

declare global {
    namespace Express {
        interface User {
            id?: string,
            name?: string,
            team?: string,
            role?: string
        }
        interface Request {
            user?: User
        }
    }
}
