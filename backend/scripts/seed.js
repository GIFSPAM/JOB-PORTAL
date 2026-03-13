import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.SEED_BASE_URL || 'http://localhost:5000';
const ADMIN_SECRET = process.env.SEED_ADMIN_SECRET || process.env.ADMIN_SECRET || '';

const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
const EMPLOYER_PASSWORD = process.env.SEED_EMPLOYER_PASSWORD || 'Employer@12345';
const SEEKER_PASSWORD = process.env.SEED_SEEKER_PASSWORD || 'Seeker@12345';

const EMPLOYER_COUNT = Number(process.env.SEED_EMPLOYERS || 3);
const SEEKER_COUNT = Number(process.env.SEED_SEEKERS || 6);
const JOBS_PER_EMPLOYER = Number(process.env.SEED_JOBS_PER_EMPLOYER || 3);
const APPS_PER_SEEKER = Number(process.env.SEED_APPS_PER_SEEKER || 3);

const RUN_ID = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const SKILLS_POOL = [
    'javascript', 'typescript', 'node.js', 'express', 'react', 'sql', 'mariadb',
    'docker', 'aws', 'python', 'java', 'rest', 'git', 'redis', 'testing'
];

const LOCATIONS = ['Remote', 'New York', 'San Francisco', 'Austin', 'Chicago'];
const JOB_TYPES = ['full_time', 'part_time', 'internship'];
const STATUSES = ['shortlisted', 'rejected', 'hired'];

const summary = {
    users: { admins: 0, employers: 0, seekers: 0 },
    jobs: { created: 0, verified: 0 },
    resumesUploaded: 0,
    skillsUpdated: 0,
    savedJobs: 0,
    applications: { submitted: 0, statusUpdated: 0 }
};

const ensureNumber = (value) => Number(value ?? 0);
const unwrapData = (payload) => payload?.data ?? payload;

function getToken(payload) {
    const data = unwrapData(payload);
    return data?.token;
}

function getUserId(payload) {
    const data = unwrapData(payload);
    return ensureNumber(data?.user_id);
}

function sample(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickUnique(arr, count) {
    const copy = [...arr];
    const out = [];
    while (copy.length && out.length < count) {
        const idx = Math.floor(Math.random() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
    }
    return out;
}

async function api(path, { method = 'GET', token, json, formData, expected = [200] } = {}) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    let body;
    if (json !== undefined) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(json);
    } else if (formData) {
        body = formData;
    }

    const res = await fetch(`${BASE_URL}${path}`, { method, headers, body });

    let payload;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        payload = await res.json();
    } else {
        payload = { message: await res.text() };
    }

    if (!expected.includes(res.status)) {
        throw new Error(`${method} ${path} failed (${res.status}): ${JSON.stringify(payload)}`);
    }

    return { status: res.status, payload };
}

function makePdfBlob() {
    const minimalPdf = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 50 100 Td (Seed Resume) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000207 00000 n \ntrailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n300\n%%EOF`;
    return new Blob([minimalPdf], { type: 'application/pdf' });
}

async function registerAndLoginAdmin() {
    const email = `admin.seed.${RUN_ID}@example.com`;

    await api('/api/auth/register', {
        method: 'POST',
        json: {
            email,
            password: ADMIN_PASSWORD,
            role: 'admin',
            secretKey: ADMIN_SECRET
        },
        expected: [201]
    });

    const login = await api('/api/auth/login', {
        method: 'POST',
        json: { email, password: ADMIN_PASSWORD },
        expected: [200]
    });

    summary.users.admins += 1;
    const token = getToken(login.payload);
    if (!token) throw new Error('Admin login did not return token.');
    return { token, email };
}

async function registerAndLoginEmployer(index) {
    const email = `employer${index}.seed.${RUN_ID}@example.com`;

    await api('/api/auth/register', {
        method: 'POST',
        json: {
            email,
            password: EMPLOYER_PASSWORD,
            role: 'employer',
            company_name: `Seed Company ${index} ${RUN_ID}`,
            industry: 'Software',
            company_size: sample(['11-50', '51-200', '201-500']),
            company_location: sample(LOCATIONS),
            company_website: `https://seed-company-${index}.example.com`,
            company_phone: `555000${String(index).padStart(4, '0')}`
        },
        expected: [201]
    });

    const login = await api('/api/auth/login', {
        method: 'POST',
        json: { email, password: EMPLOYER_PASSWORD },
        expected: [200]
    });

    summary.users.employers += 1;
    const token = getToken(login.payload);
    if (!token) throw new Error('Employer login did not return token.');
    return { token, userId: getUserId(login.payload), email };
}

async function registerAndLoginSeeker(index) {
    const email = `seeker${index}.seed.${RUN_ID}@example.com`;

    await api('/api/auth/register', {
        method: 'POST',
        json: {
            email,
            password: SEEKER_PASSWORD,
            role: 'jobseeker',
            full_name: `Seed Seeker ${index}`,
            education: sample(['Bachelor\'s', 'Master\'s', 'Diploma']),
            experience_years: index % 6,
            phone_number: `777000${String(index).padStart(4, '0')}`
        },
        expected: [201]
    });

    const login = await api('/api/auth/login', {
        method: 'POST',
        json: { email, password: SEEKER_PASSWORD },
        expected: [200]
    });

    summary.users.seekers += 1;
    const token = getToken(login.payload);
    if (!token) throw new Error('Seeker login did not return token.');
    return { token, userId: getUserId(login.payload), email };
}

async function createJobsForEmployer(employer, adminToken) {
    const jobs = [];

    for (let i = 1; i <= JOBS_PER_EMPLOYER; i += 1) {
        const skills = pickUnique(SKILLS_POOL, 3 + (i % 2));

        const created = await api('/api/employer/post', {
            method: 'POST',
            token: employer.token,
            json: {
                title: `Seed ${sample(['Backend', 'Frontend', 'Fullstack'])} Engineer ${i} (${RUN_ID})`,
                description: 'Auto-generated test job created by seed script.',
                location: sample(LOCATIONS),
                job_type: sample(JOB_TYPES),
                salary_min: 45000 + i * 1500,
                salary_max: 70000 + i * 3000,
                skills
            },
            expected: [201]
        });

        const jobId = ensureNumber(created.payload.job_id);
        summary.jobs.created += 1;

        await api(`/api/admin/verify-job/${jobId}`, {
            method: 'PATCH',
            token: adminToken,
            expected: [200]
        });

        summary.jobs.verified += 1;
        jobs.push({ jobId, employerToken: employer.token });
    }

    return jobs;
}

async function uploadSeekerResume(seeker) {
    const form = new FormData();
    form.append('resume', makePdfBlob(), `seed-resume-${seeker.userId}.pdf`);

    await api('/api/seeker/profile/resume', {
        method: 'PUT',
        token: seeker.token,
        formData: form,
        expected: [200]
    });

    summary.resumesUploaded += 1;
}

async function updateSeekerSkills(seeker, index) {
    const chosen = pickUnique(SKILLS_POOL, 4 + (index % 2));
    const prof = ['beginner', 'intermediate', 'advanced'];

    await api('/api/seeker/skills', {
        method: 'PUT',
        token: seeker.token,
        json: {
            skills: chosen.map((name, i) => ({ name, proficiency: prof[i % prof.length] }))
        },
        expected: [200]
    });

    summary.skillsUpdated += 1;
}

async function seekerSavesAndApplies(seeker, availableJobs) {
    const targetJobs = pickUnique(availableJobs, Math.min(APPS_PER_SEEKER, availableJobs.length));

    for (const target of targetJobs) {
        await api(`/api/seeker/saved-jobs/${target.jobId}`, {
            method: 'POST',
            token: seeker.token,
            expected: [201, 409]
        });
        summary.savedJobs += 1;

        const applied = await api(`/api/seeker/apply/${target.jobId}`, {
            method: 'POST',
            token: seeker.token,
            expected: [201, 409]
        });

        if (applied.status === 201) {
            summary.applications.submitted += 1;
            const appId = ensureNumber(applied.payload.data?.application_id);
            if (appId) {
                await api(`/api/employer/application-status/${appId}`, {
                    method: 'PATCH',
                    token: target.employerToken,
                    json: { status: sample(STATUSES) },
                    expected: [200, 403]
                });
                summary.applications.statusUpdated += 1;
            }
        }
    }
}

async function runSeed() {
    if (!globalThis.fetch || !globalThis.FormData || !globalThis.Blob) {
        throw new Error('Node runtime must provide fetch/FormData/Blob. Use Node 18+ to run the seed script.');
    }

    if (!ADMIN_SECRET) {
        throw new Error('Missing admin secret. Set ADMIN_SECRET (or SEED_ADMIN_SECRET) in backend/.env.');
    }

    console.log(`Seeding against ${BASE_URL}`);
    console.log(`Run ID: ${RUN_ID}`);

    const admin = await registerAndLoginAdmin();

    const employers = [];
    for (let i = 1; i <= EMPLOYER_COUNT; i += 1) {
        employers.push(await registerAndLoginEmployer(i));
    }

    const seekers = [];
    for (let i = 1; i <= SEEKER_COUNT; i += 1) {
        seekers.push(await registerAndLoginSeeker(i));
    }

    const jobs = [];
    for (const employer of employers) {
        const created = await createJobsForEmployer(employer, admin.token);
        jobs.push(...created);
    }

    for (let i = 0; i < seekers.length; i += 1) {
        const seeker = seekers[i];
        await uploadSeekerResume(seeker);
        await updateSeekerSkills(seeker, i);
        await seekerSavesAndApplies(seeker, jobs);

        if (jobs.length) {
            await api(`/api/seeker/job-match/${jobs[0].jobId}`, {
                method: 'GET',
                token: seeker.token,
                expected: [200, 404]
            });
        }

        await api('/api/seeker/stats', { method: 'GET', token: seeker.token, expected: [200, 404] });
    }

    await api('/api/admin/stats', { method: 'GET', token: admin.token, expected: [200, 404] });

    for (const employer of employers) {
        await api('/api/employer/stats', { method: 'GET', token: employer.token, expected: [200, 404] });
    }

    console.log('Seed completed successfully.');
    console.table({
        admin_users: summary.users.admins,
        employer_users: summary.users.employers,
        seeker_users: summary.users.seekers,
        jobs_created: summary.jobs.created,
        jobs_verified: summary.jobs.verified,
        resumes_uploaded: summary.resumesUploaded,
        seeker_skills_updated: summary.skillsUpdated,
        jobs_saved_attempted: summary.savedJobs,
        applications_submitted: summary.applications.submitted,
        application_status_updates: summary.applications.statusUpdated
    });
}

runSeed().catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
});
