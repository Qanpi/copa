export {};

declare global {
    namespace Express {
        interface User {
            id?: string,
            name?: string,
            team?: {
                id: string,
                name: string,
            },
            role?: string
        }
        interface Request {
            user?: User
        }
    }
}
