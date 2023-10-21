import { SnackbarProps } from "@mui/base"
import { AlertProps } from "@mui/material"

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
        list: (query?: Partial<T>) => [key, "list", query],
        ids: [key, "id"],
        id: (id?: string) => [key, "id", id]
    } as QueryKeyObject<T>
}

export type TFeedback = {
    severity?: AlertProps["severity"],
    message?: AlertProps["children"] | string
}

declare module "*.png" {
  const value: string;
  export default value;
}

