export const parseValue = (value: any) => {
    if (typeof value === 'number') {
        return value;
    } else if (typeof value === 'string') {
        return `"${value}"`;
    } else if (typeof value === 'object') {
        return JSON.stringify(value);
    } else {
        return value;
    }
};
