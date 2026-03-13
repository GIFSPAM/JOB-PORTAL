export const SELECT_USER_BY_EMAIL = 'SELECT * FROM Users WHERE email = ?';

export const SELECT_USER_ID_BY_EMAIL = 'SELECT user_id FROM Users WHERE email = ?';

export const INSERT_USER = 'INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)';

export const INSERT_JOBSEEKER_PROFILE = `
    INSERT INTO JobSeekers (seeker_id, full_name, education, experience_years, phone_number)
    VALUES (?, ?, ?, ?, ?)
`;

export const INSERT_EMPLOYER_PROFILE = `
    INSERT INTO Employers (employer_id, company_name, industry, company_size, company_location, company_website, company_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`;

export const SELECT_AUTH_USER_BY_ID = `
    SELECT user_id, email, role, is_active, created_at
    FROM Users
    WHERE user_id = ?
`;
