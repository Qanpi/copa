export type QueryKeyObject<T> = {
    key: string
    all: [string],
    lists: [string, "list"],
    list: (query: Partial<T>) => [string, "list", Partial<T>]
    ids: [string, "id"],
    id: (id: string) => [string, "id", string],
}

export function queryKeyFactory<T>(key: string) {
    return {
        key,
        all: [key],
        lists: [key, "list"],
        list: (query) => [key, "list", query],
        ids: [key, "id"],
        id: (id) => [key, "id", id]
    } as QueryKeyObject<T>
}

