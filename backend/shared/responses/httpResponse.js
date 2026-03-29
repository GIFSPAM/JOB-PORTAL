export const ok = (res, data = null, message = null, status = 200) => {
    const payload = { success: true };
    if (message) payload.message = message;
    if (data !== null && data !== undefined) payload.data = data;
    return res.status(status).json(payload);
};

export const fail = (res, message, status = 400, details = null) => {
    const payload = { success: false, message };
    if (details) payload.details = details;
    return res.status(status).json(payload);
};
