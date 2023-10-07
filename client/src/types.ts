export type QueryKeyFactory<T> = {
    all: string,
    id: (id: string) =>  [string, string],
    query: (query: Partial<T>) => [string, Partial<T>]
}