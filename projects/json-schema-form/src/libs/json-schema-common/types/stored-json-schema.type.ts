import { CommonJsonTypes } from "./json-type.type";

/** Схема */
export interface IStoredJsonSchema {
    /** Тип схемы */
    type: CommonJsonTypes,
    /** Название схемы */
    title?: string,
    /** Описание схемы */
    description?: string,
    /** Схема элемента массива. Для массива */
    items?: IStoredJsonSchema;
    /**
     * Дочерние поля. Для объекта
     *
     * Массив кортежей { ключ, схемаПоля }
     */
    properties?: IKeyed[];
}

/** Кортеж */
export interface IKeyed {
    /** Ключ в котором лежит поле в объекте */
    key: string,
    /** Схема поля */
    value: IStoredJsonSchema,
    /** Обязательное поле в объекте */
    required: boolean,
}
