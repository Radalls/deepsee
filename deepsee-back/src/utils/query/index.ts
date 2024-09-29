export const formatQueryFields = (fields: string[]): string => {
    return fields
        .filter(field => !field.startsWith('*'))
        .map(field => field.replace(/^_/, '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase())
        .join(', ');
};

