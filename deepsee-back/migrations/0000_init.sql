CREATE TABLE "history" (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    avatar VARCHAR(255)
);

CREATE TABLE "company" (
    id SERIAL PRIMARY KEY,
    owner_id INT UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    name VARCHAR(255) UNIQUE NOT NULL,
    business VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    description VARCHAR(1000),
    sub BOOLEAN,
    sub_id VARCHAR(255)
);

CREATE TABLE "company_invite" (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES "company"(id) ON DELETE CASCADE,
    guest_email VARCHAR(255),
    code VARCHAR(255)
);

CREATE TABLE "recruiter" (
    user_id INT REFERENCES "user"(id) ON DELETE CASCADE,
    company_id INT REFERENCES "company"(id) ON DELETE CASCADE
);

--- TALENT ---
CREATE TABLE "talent" (
    user_id INT UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    open_to_work BOOLEAN NOT NULL,
    title VARCHAR(255),
    external_links VARCHAR(1000),
    description VARCHAR(1000)
);

CREATE TABLE "talent_education_experience" (
    id SERIAL PRIMARY KEY,
    talent_id INT REFERENCES "talent"(user_id) ON DELETE CASCADE,
    diploma_type VARCHAR(255) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    description VARCHAR(1000)
);

CREATE TABLE "talent_work_experience" (
    id SERIAL PRIMARY KEY,
    talent_id INT REFERENCES "talent"(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    contract_type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    description VARCHAR(1000)
);

CREATE TABLE "talent_recommandation" (
    id SERIAL PRIMARY KEY,
    author_id INT REFERENCES "user"(id),
    recipient_id INT REFERENCES "user"(id) ON DELETE CASCADE,
    experience_id INT REFERENCES talent_work_experience(id),
    message VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--- JOF OFFER ---
CREATE TABLE "job_offer_test" (
    id SERIAL PRIMARY KEY,
    instructions VARCHAR(1000),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    duration INT,
    unit_name VARCHAR(255),
    units VARCHAR(10000)
);

CREATE TABLE "job_offer" (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES "company"(id) ON DELETE CASCADE,
    job_offer_test_id INT REFERENCES "job_offer_test"(id),
    contract_type VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    required_years_of_experience INT NOT NULL,
    required_diploma VARCHAR(255) NOT NULL,
    requirement_description VARCHAR(1000),
    main_description VARCHAR(1000),
    work_description VARCHAR(1000),
    published_at TIMESTAMP,
    location VARCHAR(255)
);

CREATE TABLE "job_offer_test_run" (
    talent_id INT REFERENCES "user"(id) ON DELETE CASCADE,
    job_offer_test_id INT REFERENCES "job_offer_test"(id),
    startable_until TIMESTAMP,
    ended_at TIMESTAMP,
    started_at TIMESTAMP,
    validated_at TIMESTAMP,
    PRIMARY KEY (talent_id, job_offer_test_id)
);

--- CANDIDACY ---
CREATE TABLE "candidacy" (
    id SERIAL PRIMARY KEY,
    job_offer_id INT REFERENCES "job_offer"(id) ON DELETE CASCADE,
    talent_id INT REFERENCES "talent"(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(255) NOT NULL,
    message VARCHAR(255),
    phone_interview_date TIMESTAMP,
    meet_link VARCHAR(255),
    interview_date TIMESTAMP
);

--- SKILLS ---
CREATE TABLE "skill" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(255) NOT NULL
);

CREATE TABLE "job_offer_skill" (
    job_offer_id INT REFERENCES "job_offer"(id) ON DELETE CASCADE,
    skill_id INT REFERENCES "skill"(id),
    level VARCHAR(255),
    PRIMARY KEY (job_offer_id, skill_id)
);

CREATE TABLE "talent_skill" (
    id SERIAL PRIMARY KEY,
    talent_id INT REFERENCES "talent"(user_id) ON DELETE CASCADE,
    skill_id INT REFERENCES "skill"(id),
    talent_education_experience_id INT REFERENCES "talent_education_experience"(id),
    talent_work_experience_id INT REFERENCES "talent_work_experience"(id),
    talent_recommandation_id INT REFERENCES "talent_recommandation"(id),
    level VARCHAR(255)
);

--- CHAT ---
CREATE TABLE "conversation" (
    id SERIAL PRIMARY KEY,
    talent_id INT REFERENCES "user"(id) ON DELETE CASCADE,
    company_id INT REFERENCES "company"(id),
    job_offer_id INT REFERENCES "job_offer"(id),
    candidacy_id INT REFERENCES "candidacy"(id) ON DELETE CASCADE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "message" (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES "conversation"(id) ON DELETE CASCADE,
    sender_id INT REFERENCES "user"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--- FILTER ---
CREATE TABLE "talent_search_config" (
    id SERIAL PRIMARY KEY,
    talent_id INT REFERENCES "talent"(user_id) ON DELETE CASCADE,
	alert BOOLEAN DEFAULT false,
    contract_type VARCHAR(255),
    company_name VARCHAR(255),
	company_business VARCHAR(255),
	location VARCHAR(255),
    text VARCHAR(1000)
);