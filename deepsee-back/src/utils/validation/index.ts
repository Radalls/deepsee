export const validateNumber = (value: any): number | null => {
    if (value === undefined || value === null) {
        return null;
    }

    const number = Number(value);
    return isNaN(number) ? null : number;
};

export const validateBoolean = (value: any): boolean | null => {
    if (value === true) {
        return true;
    }

    if (value === false) {
        return false;
    }

    return null;
};

export const validateString = (value: any): string | null => {
    if (value && typeof value === 'string') {
        const trimmedValue = value.trim();
        return trimmedValue !== '' ? trimmedValue : null;
    }

    return null;
};

export const validateDate = (value: any): Date | null => {
    if (typeof value === 'string') {
        const date = new Date(value);

        if (!isNaN(date.getTime())) {
            return date;
        }
    }

    return null;
};

export const validateEnum = <T extends Record<string, string>>(
    value: any,
    enumType: T
): T[keyof T] | null => {
    const stringValue = validateString(value);
    if (!(stringValue)) {
        return null;
    }
    const formattedValue = stringValue.toLocaleUpperCase().trim();

    const enumValues = Object.values(enumType);
    return enumValues.includes(formattedValue as T[keyof T]) ? formattedValue as T[keyof T] : null;
};

export const validateEmail = (value: any): string | null => {
    if (!(validateString(value))) {
        return null;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? value : null;
};
