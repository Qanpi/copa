import { CrudInterface, DataTypes, OmitId, Table } from "brackets-manager";
import { Id } from "brackets-model";
import Tournament from "../../models/tournament";
import Participant from "../../models/participant";
import Match from "../../models/match";
import {
  matches as _matches,
  filter as _filter,
  isMatch as _isMatch,
  remove as _remove,
} from "lodash-es";
import { handleInsert } from "./insert";
import { handleSelect } from "./select";
import { handleUpdate } from "./update";
import { handleDelete } from "./delete";

export class MongooseForBrackets implements CrudInterface {
  insert<T extends keyof DataTypes>(
    table: T,
    value: OmitId<DataTypes[T]>
  ): Promise<number>;
  insert<T extends keyof DataTypes>(
    table: T,
    values: OmitId<DataTypes[T]>[]
  ): Promise<boolean>;
  async insert<T extends keyof DataTypes>(
    table: T,
    data: OmitId<DataTypes[T]> | OmitId<DataTypes[T]>[]
  ): Promise<Id | boolean> {
    return handleInsert(table, data);
  }

  select<T extends keyof DataTypes>(table: T): Promise<DataTypes[T][] | null>;
  select<T extends keyof DataTypes>(
    table: T,
    id: Id
  ): Promise<DataTypes[T] | null>;
  select<T extends keyof DataTypes>(
    table: T,
    filter: Partial<DataTypes[T]>
  ): Promise<DataTypes[T][] | null>;
  async select<T extends keyof DataTypes>(
    table: T,
    filter?: Partial<DataTypes[T]> | Id
  ): Promise<DataTypes[T][] | DataTypes[T] | null> {
    return handleSelect(table, filter);
  }

  update<T extends keyof DataTypes>(
    table: T,
    id: Id,
    value: DataTypes[T]
  ): Promise<boolean>;
  update<T extends keyof DataTypes>(
    table: T,
    filter: Partial<DataTypes[T]>,
    value: Partial<DataTypes[T]>
  ): Promise<boolean>;
  async update<T extends keyof DataTypes>(
    table: T,
    filter: Partial<DataTypes[T]> | Id,
    data: Partial<DataTypes[T]> | DataTypes[T]
  ): Promise<boolean> {
    return handleUpdate(table, filter, data);
  }

  delete<T extends keyof DataTypes>(table: T): Promise<boolean>;
  delete<T extends keyof DataTypes>(
    table: T,
    filter: Partial<DataTypes[T]>
  ): Promise<boolean>;
  async delete<T extends keyof DataTypes>(
    table: T,
    filter?: Partial<DataTypes[T]>
  ): Promise<boolean> {
    return handleDelete(table, filter);
  }
}
