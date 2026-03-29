export const isBoolean = (value) => typeof value === 'boolean';

export const isNonEmptyString = (value) => (
    typeof value === 'string' && value.trim().length > 0
);

export const toPositiveInt = (value) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
};
