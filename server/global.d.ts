export {};

declare global {
    namespace Express {
        interface User {
            id: string,
            name: string,
            role: string
        }
    }
}
