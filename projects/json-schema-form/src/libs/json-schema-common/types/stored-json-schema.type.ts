import { CommonJsonTypes } from "./json-type.type";

/** Схема */
export interface IStoredJsonSchema {
    /** Тип схемы */
    type: CommonJsonTypes,
    /** Название схемы */
    title?: string | null,
    /** Описание схемы */
    description?: string | null,
    /** Обязательные дочерние поля. Для объекта */
    required?: string[]
    /** Схема элемента массива. Для массива */
    items?: IStoredJsonSchema | null;
    /**
     * Дочерние поля. Для объекта
     *
     * Массив кортежей { ключ, схемаПоля }
     */
    properties?: IKeyed<IStoredJsonSchema>[] | null;
}

/** Кортеж */
export interface IKeyed<T> {
    key: string,
    value: T
}
