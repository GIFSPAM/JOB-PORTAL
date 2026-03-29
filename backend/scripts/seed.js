import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.SEED_BASE_URL || 'http://localhost:5000';
const ADMIN_SECRET = process.env.SEED_ADMIN_SECRET || process.env.ADMIN_SECRET || '';

const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
const EMPLOYER_PASSWORD = process.env.SEED_EMPLOYER_PASSWORD || 'Employer@12345';
const SEEKER_PASSWORD = process.env.SEED_SEEKER_PASSWORD || 'Seeker@12345';

const RUN_ID = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const DEFAULT_EMPLOYER_PROFILES = [
    {
        company_name: 'Northstar Labs',
        industry: 'SaaS',
        company_size: '51-200',
        company_location: 'Remote',
        company_website: 'https://northstar-labs.example.com',
        company_phone: '5551000001'
    },
    {
        company_name: 'Bluefin Retail Tech',
        industry: 'E-commerce',
        company_size: '201-500',
        company_location: 'Austin',
        company_website: 'https://bluefin-retail.example.com',
        company_phone: '5551000002'
    },
    {
        company_name: 'CloudHarbor Systems',
        industry: 'Cloud Infrastructure',
        company_size: '11-50',
        company_location: 'New York',
        company_website: 'https://cloudharbor.example.com',
        company_phone: '5551000003'
    }
];

const DEFAULT_JOB_TEMPLATES = [
    {
        title: 'Backend Engineer',
        description: 'Build API features, optimize SQL queries, and maintain reliable production services.',
        location: 'Remote',
        job_type: 'full_time',
        salary_min: 70000,
        salary_max: 95000,
        skills: ['node.js', 'express', 'sql', 'mariadb', 'docker'],
        required_experience: 3
    },
    {
        title: 'Frontend Engineer',
        description: 'Implement performant UI flows and collaborate with product/design teams on customer features.',
        location: 'San Francisco',
        job_type: 'full_time',
        salary_min: 68000,
        salary_max: 92000,
        skills: ['react', 'typescript', 'javascript', 'testing'],
        required_experience: 2
    },
    {
        title: 'Junior QA Analyst',
        description: 'Write and execute test plans, report defects, and support release quality checks.',
        location: 'Chicago',
        job_type: 'part_time',
        salary_min: 32000,
        salary_max: 48000,
        skills: ['testing', 'javascript', 'git'],
        required_experience: 1
    },
    {
        title: 'Cloud Platform Intern',
        description: 'Support internal tooling and monitoring dashboards for platform reliability projects.',
        location: 'Austin',
        job_type: 'internship',
        salary_min: 20000,
        salary_max: 28000,
        skills: ['python', 'aws', 'git'],
        required_experience: 0
    }
];

const DEFAULT_SEEKER_PROFILES = [
    {
        full_name: 'Arjun Patel',
        education: "Bachelor's",
        experience_years: 4,
        phone_number: '7771000001',
        skills: ['node.js', 'express', 'sql', 'docker', 'git']
    },
    {
        full_name: 'Maya Thompson',
        education: "Master's",
        experience_years: 3,
        phone_number: '7771000002',
        skills: ['react', 'typescript', 'javascript', 'testing']
    },
    {
        full_name: 'Ethan Brooks',
        education: "Bachelor's",
        experience_years: 1,
        phone_number: '7771000003',
        skills: ['testing', 'javascript', 'git']
    },
    {
        full_name: 'Noah Reed',
        education: 'Diploma',
        experience_years: 0,
        phone_number: '7771000004',
        skills: ['python', 'aws', 'git']
    },
    {
        full_name: 'Sofia Lin',
        education: "Master's",
        experience_years: 5,
        phone_number: '7771000005',
        skills: ['node.js', 'sql', 'mariadb', 'aws', 'docker']
    },
    {
        full_name: 'Daniel Cruz',
        education: "Bachelor's",
        experience_years: 2,
        phone_number: '7771000006',
        skills: ['react', 'javascript', 'git', 'testing']
    }
];

function readPositiveInt(value, fallback) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
    return parsed;
}

const EMPLOYER_COUNT = readPositiveInt(process.env.SEED_EMPLOYERS, DEFAULT_EMPLOYER_PROFILES.length);
const SEEKER_COUNT = readPositiveInt(process.env.SEED_SEEKERS, DEFAULT_SEEKER_PROFILES.length);
const JOBS_PER_EMPLOYER = readPositiveInt(process.env.SEED_JOBS_PER_EMPLOYER, 2);
const APPS_PER_SEEKER = readPositiveInt(process.env.SEED_APPS_PER_SEEKER, 2);

const summary = {
    users: { admins: 0, employers: 0, seekers: 0 },
    jobs: { created: 0, verified: 0 },
    resumesUploaded: 0,
    skillsUpdated: 0,
    savedJobs: 0,
    applications: {
        submitted: 0,
        statusUpdated: 0,
        hired: 0,
        shortlisted: 0,
        rejected: 0
    }
};

const hiredByJob = new Map();

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

function getSeedItem(items, index) {
    return items[index % items.length];
}

function normalizeSkillName(value) {
    return String(value || '').trim().toLowerCase();
}

function uniqueSkills(values) {
    return [...new Set(values.map(normalizeSkillName).filter(Boolean))];
}

function getProficiency(experienceYears, order) {
    if (experienceYears >= 5 && order < 2) return 'advanced';
    if (experienceYears >= 2) return order === 0 ? 'advanced' : 'intermediate';
    return order === 0 ? 'intermediate' : 'beginner';
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

function buildEmployerProfile(index) {
    const base = getSeedItem(DEFAULT_EMPLOYER_PROFILES, index);
    const cycle = Math.floor(index / DEFAULT_EMPLOYER_PROFILES.length);
    const suffix = cycle > 0 ? ` ${cycle + 1}` : '';

    return {
        company_name: `${base.company_name}${suffix}`,
        industry: base.industry,
        company_size: base.company_size,
        company_location: base.company_location,
        company_website: base.company_website,
        company_phone: `${base.company_phone.slice(0, 7)}${String(index + 1).padStart(3, '0')}`
    };
}

function buildSeekerProfile(index) {
    const base = getSeedItem(DEFAULT_SEEKER_PROFILES, index);
    const cycle = Math.floor(index / DEFAULT_SEEKER_PROFILES.length);
    const suffix = cycle > 0 ? ` ${cycle + 1}` : '';

    return {
        full_name: `${base.full_name}${suffix}`,
        education: base.education,
        experience_years: base.experience_years,
        phone_number: `${base.phone_number.slice(0, 7)}${String(index + 1).padStart(3, '0')}`,
        skills: uniqueSkills(base.skills)
    };
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
    const profile = buildEmployerProfile(index);
    const email = `employer${index}.seed.${RUN_ID}@example.com`;

    await api('/api/auth/register', {
        method: 'POST',
        json: {
            email,
            password: EMPLOYER_PASSWORD,
            role: 'employer',
            company_name: profile.company_name,
            industry: profile.industry,
            company_size: profile.company_size,
            company_location: profile.company_location,
            company_website: profile.company_website,
            company_phone: profile.company_phone
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
    return { token, userId: getUserId(login.payload), email, index, profile };
}

async function registerAndLoginSeeker(index) {
    const profile = buildSeekerProfile(index);
    const email = `seeker${index}.seed.${RUN_ID}@example.com`;

    await api('/api/auth/register', {
        method: 'POST',
        json: {
            email,
            password: SEEKER_PASSWORD,
            role: 'jobseeker',
            full_name: profile.full_name,
            education: profile.education,
            experience_years: profile.experience_years,
            phone_number: profile.phone_number
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
    return { token, userId: getUserId(login.payload), email, profile };
}

async function createJobsForEmployer(employer, adminToken) {
    const jobs = [];
    const perEmployerCount = Math.min(JOBS_PER_EMPLOYER, DEFAULT_JOB_TEMPLATES.length);

    for (let i = 0; i < perEmployerCount; i += 1) {
        const template = getSeedItem(DEFAULT_JOB_TEMPLATES, employer.index + i);
        const title = `${template.title} - ${employer.profile.company_name}`;

        const created = await api('/api/employer/post', {
            method: 'POST',
            token: employer.token,
            json: {
                title,
                description: template.description,
                location: template.location,
                job_type: template.job_type,
                salary_min: template.salary_min,
                salary_max: template.salary_max,
                skills: uniqueSkills(template.skills)
            },
            expected: [201]
        });

        const jobId = ensureNumber(created.payload.job_id || created.payload.data?.job_id);
        if (!jobId) throw new Error('Job creation response did not include a job_id.');

        summary.jobs.created += 1;

        await api(`/api/admin/verify-job/${jobId}`, {
            method: 'PATCH',
            token: adminToken,
            expected: [200]
        });

        summary.jobs.verified += 1;
        jobs.push({
            jobId,
            employerToken: employer.token,
            title,
            skills: uniqueSkills(template.skills),
            requiredExperience: template.required_experience
        });
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

async function updateSeekerSkills(seeker) {
    const chosen = seeker.profile.skills;

    await api('/api/seeker/skills', {
        method: 'PUT',
        token: seeker.token,
        json: {
            skills: chosen.map((name, order) => ({
                name,
                proficiency: getProficiency(seeker.profile.experience_years, order)
            }))
        },
        expected: [200]
    });

    summary.skillsUpdated += 1;
}

function rankJobsForSeeker(seeker, availableJobs) {
    const seekerSkillSet = new Set(uniqueSkills(seeker.profile.skills));

    const scored = availableJobs.map((job) => {
        const overlap = job.skills.filter((skill) => seekerSkillSet.has(skill)).length;
        const matchRatio = job.skills.length ? overlap / job.skills.length : 0;
        const experienceDelta = seeker.profile.experience_years - job.requiredExperience;
        const weightedScore = Number((matchRatio * 0.85 + Math.max(-0.2, Math.min(0.2, experienceDelta * 0.05))).toFixed(4));

        return {
            ...job,
            overlap,
            matchRatio,
            weightedScore
        };
    });

    scored.sort((a, b) => b.weightedScore - a.weightedScore);
    return scored;
}

function pickApplicationStatus(seeker, rankedJob, seekerAlreadyHired) {
    const jobAlreadyHasHire = hiredByJob.get(rankedJob.jobId) === true;
    const isHighMatch = rankedJob.matchRatio >= 0.8;
    const isGoodMatch = rankedJob.matchRatio >= 0.5;
    const hasRequiredExperience = seeker.profile.experience_years >= rankedJob.requiredExperience;

    if (!jobAlreadyHasHire && !seekerAlreadyHired && isHighMatch && hasRequiredExperience) {
        hiredByJob.set(rankedJob.jobId, true);
        summary.applications.hired += 1;
        return 'hired';
    }
    if (isGoodMatch) {
        summary.applications.shortlisted += 1;
        return 'shortlisted';
    }

    summary.applications.rejected += 1;
    return 'rejected';
}

async function seekerSavesAndApplies(seeker, availableJobs) {
    const rankedJobs = rankJobsForSeeker(seeker, availableJobs);
    const saveLimit = Math.min(APPS_PER_SEEKER + 1, rankedJobs.length);
    const applyLimit = Math.min(APPS_PER_SEEKER, rankedJobs.length);

    for (const target of rankedJobs.slice(0, saveLimit)) {
        const saved = await api(`/api/seeker/saved-jobs/${target.jobId}`, {
            method: 'POST',
            token: seeker.token,
            expected: [201, 409]
        });
        if (saved.status === 201) summary.savedJobs += 1;
    }

    const applyTargets = rankedJobs
        .filter((job) => job.overlap > 0)
        .slice(0, applyLimit);

    let seekerAlreadyHired = false;

    for (const target of applyTargets) {

        const applied = await api(`/api/seeker/apply/${target.jobId}`, {
            method: 'POST',
            token: seeker.token,
            expected: [201, 409]
        });

        if (applied.status === 201) {
            summary.applications.submitted += 1;
            const appId = ensureNumber(applied.payload.data?.application_id);
            if (appId) {
                const status = pickApplicationStatus(seeker, target, seekerAlreadyHired);
                await api(`/api/employer/application-status/${appId}`, {
                    method: 'PATCH',
                    token: target.employerToken,
                    json: { status },
                    expected: [200]
                });

                if (status === 'hired') seekerAlreadyHired = true;
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
    for (let i = 0; i < EMPLOYER_COUNT; i += 1) {
        employers.push(await registerAndLoginEmployer(i));
    }

    const seekers = [];
    for (let i = 0; i < SEEKER_COUNT; i += 1) {
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
        await updateSeekerSkills(seeker);
        if (jobs.length) {
            await seekerSavesAndApplies(seeker, jobs);
        }

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
        jobs_saved: summary.savedJobs,
        applications_submitted: summary.applications.submitted,
        application_status_updates: summary.applications.statusUpdated,
        applications_hired: summary.applications.hired,
        applications_shortlisted: summary.applications.shortlisted,
        applications_rejected: summary.applications.rejected
    });
}

runSeed().catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
});
