import { ObjectId } from "mongodb";

export type Id = ObjectId | string;

export type QueryKeyFactory<T> = {
    all: string,
    id: (id: Id) =>  [string, string],
    query: (query: Partial<T>) => [string, Partial<T>]
}