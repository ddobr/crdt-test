import { CommonJsonTypes } from "./json-type.type";

/** Схема */
export interface IStoredJsonSchema {
    /** Тип схемы */
    type: CommonJsonTypes,
    /** Название схемы */
    title?: string,
    /** Описание схемы */
    description?: string,
    /** Обязательные дочерние поля. Для объекта */
    required?: string[]
    /** Схема элемента массива. Для массива */
    items?: IStoredJsonSchema;
    /**
     * Дочерние поля. Для объекта
     *
     * Массив кортежей { ключ, схемаПоля }
     */
    properties?: IKeyed<IStoredJsonSchema>[];
}

/** Кортеж */
export interface IKeyed<T> {
    key: string,
    value: T
}
