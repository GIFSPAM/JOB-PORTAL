CREATE DATABASE IF NOT EXISTS job_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE job_portal;

CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('jobseeker', 'employer', 'admin') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS JobSeekers (
    seeker_id INT PRIMARY KEY,
    full_name VARCHAR(100),
    phone_number VARCHAR(20),
    education VARCHAR(100),
    experience_years INT,
    resume_path VARCHAR(255),
    resume_filename VARCHAR(255),
    profile_picture_url VARCHAR(500),
    FOREIGN KEY (seeker_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Employers (
    employer_id INT PRIMARY KEY,
    company_name VARCHAR(100),
    company_phone VARCHAR(20),
    industry VARCHAR(100),
    company_size ENUM('1-10', '11-50', '51-200', '201-500', '500+'),
    company_location VARCHAR(100),
    company_website VARCHAR(150),
    profile_picture_url VARCHAR(500),
    FOREIGN KEY (employer_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT NOT NULL,
    title VARCHAR(100),
    description TEXT,
    location VARCHAR(100),
    job_type ENUM('full_time', 'part_time', 'internship'),
    salary_min INT,
    salary_max INT,
    application_count INT DEFAULT 0,
    status ENUM('open', 'closed') DEFAULT 'open',
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INT NULL,
    verified_at TIMESTAMP NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES Employers(employer_id)
        ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES Users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    seeker_id INT NOT NULL,
    status ENUM('applied', 'shortlisted', 'rejected', 'hired') DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_applications_job_seeker (job_id, seeker_id),
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id)
        ON DELETE CASCADE,
    FOREIGN KEY (seeker_id) REFERENCES JobSeekers(seeker_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS JobSkills (
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id)
        ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS SeekerSkills (
    seeker_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency ENUM('beginner', 'intermediate', 'advanced'),
    PRIMARY KEY (seeker_id, skill_id),
    FOREIGN KEY (seeker_id) REFERENCES JobSeekers(seeker_id)
        ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS AdminLogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action_type VARCHAR(50),
    target_table VARCHAR(50),
    target_id INT,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES Users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS SavedJobs (
    seeker_id INT NOT NULL,
    job_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (seeker_id, job_id),
    FOREIGN KEY (seeker_id) REFERENCES JobSeekers(seeker_id)
        ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_jobs_employer ON Jobs(employer_id);
CREATE INDEX idx_applications_job ON Applications(job_id);
CREATE INDEX idx_applications_seeker ON Applications(seeker_id);
CREATE INDEX idx_skill_name ON Skills(skill_name);
