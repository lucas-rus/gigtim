-- GigTim — Complete ROMARG MySQL Schema Conversion
-- Generated for REMOVED on ROMARG Brașov Server

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('WORKER', 'EMPLOYER', 'ADMIN') NOT NULL,
    avatar_url TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Worker Profiles Table
CREATE TABLE IF NOT EXISTS worker_profiles (
    user_id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    cnp VARCHAR(13) DEFAULT NULL,
    id_card_series VARCHAR(20) DEFAULT NULL,
    phone_number VARCHAR(50) NOT NULL DEFAULT '',
    city VARCHAR(100) NOT NULL DEFAULT '',
    county VARCHAR(100) NOT NULL DEFAULT '',
    bio TEXT,
    reliability_score DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    total_shifts_completed INT NOT NULL DEFAULT 0,
    skills TEXT NOT NULL DEFAULT '', -- JSON array string or comma separated values
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Employer Profiles Table
CREATE TABLE IF NOT EXISTS employer_profiles (
    user_id VARCHAR(36) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL DEFAULT '',
    cui VARCHAR(50) NOT NULL DEFAULT '',
    address VARCHAR(255) NOT NULL DEFAULT '',
    city VARCHAR(100) NOT NULL DEFAULT '',
    county VARCHAR(100) NOT NULL DEFAULT '',
    lat DOUBLE PRECISION DEFAULT NULL,
    lng DOUBLE PRECISION DEFAULT NULL,
    employer_rating DECIMAL(3,1) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Job Shifts Table
CREATE TABLE IF NOT EXISTS job_shifts (
    id VARCHAR(36) PRIMARY KEY,
    employer_id VARCHAR(36) NOT NULL,
    role_needed ENUM('BARISTA', 'WAITER', 'DISHWASHER', 'STAGEHAND') NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    hourly_pay_ron DECIMAL(8,2) NOT NULL,
    status ENUM('OPEN', 'FILLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES employer_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    shift_id VARCHAR(36) NOT NULL,
    worker_id VARCHAR(36) NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'NO_SHOW') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_application (shift_id, worker_id),
    FOREIGN KEY (shift_id) REFERENCES job_shifts(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Chat Rooms Table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('SHIFT', 'DIRECT') NOT NULL,
    shift_id VARCHAR(36) DEFAULT NULL,
    name VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shift_id) REFERENCES job_shifts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Chat Room Members Table
CREATE TABLE IF NOT EXISTS chat_room_members (
    room_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    edited_at DATETIME DEFAULT NULL,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Forum Posts Table
CREATE TABLE IF NOT EXISTS forum_posts (
    id VARCHAR(36) PRIMARY KEY,
    author_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('GENERAL', 'TIPS', 'JOBS', 'LEGAL') NOT NULL DEFAULT 'GENERAL',
    pinned TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Forum Comments Table
CREATE TABLE IF NOT EXISTS forum_comments (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('SHIFT_APPLICATION','APPLICATION_ACCEPTED','APPLICATION_REJECTED','SHIFT_REMINDER','REVIEW_REQUEST','CHAT_MESSAGE','ID_VERIFIED','ID_REJECTED','ADMIN_NOTICE') NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSON DEFAULT NULL,
    `read` TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    shift_id VARCHAR(36) NOT NULL,
    reviewer_id VARCHAR(36) NOT NULL,
    reviewee_id VARCHAR(36) NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_shift_review (shift_id, reviewer_id),
    FOREIGN KEY (shift_id) REFERENCES job_shifts(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. ID Verifications Table
CREATE TABLE IF NOT EXISTS id_verifications (
    id VARCHAR(36) PRIMARY KEY,
    worker_id VARCHAR(36) NOT NULL,
    persona_inquiry_id VARCHAR(255) UNIQUE,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'NEEDS_REVIEW') NOT NULL DEFAULT 'PENDING',
    persona_status VARCHAR(100),
    rejection_reasons JSON DEFAULT NULL,
    verified_at DATETIME DEFAULT NULL,
    expires_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
