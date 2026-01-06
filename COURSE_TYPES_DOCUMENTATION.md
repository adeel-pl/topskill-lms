# Course Types and Management Documentation

## Overview

TopSkill LMS supports multiple course delivery types: **Online**, **Physical**, and **Hybrid** courses. Additionally, physical courses can be organized into **Batches**, which can be further categorized as **Physical Classes**, **Internships**, or **Bootcamps**.

## Course Modalities

### 1. Online Courses
- **Description**: Fully online, self-paced courses
- **Features**:
  - Video lectures (YouTube or direct URLs)
  - Quizzes and assignments
  - Progress tracking
  - Lifetime access
  - No physical attendance required
- **Admin Setup**:
  1. Create course with `modality = 'online'`
  2. Add sections and lectures
  3. Set price and other details
  4. No batch management needed

### 2. Physical Courses
- **Description**: In-person classes with scheduled sessions
- **Features**:
  - Requires batch management
  - Scheduled sessions with locations
  - Attendance tracking
  - Limited capacity per batch
  - Session registration
- **Admin Setup**:
  1. Create course with `modality = 'physical'`
  2. Set `max_batch_size` (default: 25 students)
  3. Create batches (see Batch Management below)
  4. Schedule sessions for each batch

### 3. Hybrid Courses
- **Description**: Combination of online and physical components
- **Features**:
  - Online video content
  - Physical sessions for hands-on practice
  - Flexible learning approach
- **Admin Setup**:
  1. Create course with `modality = 'hybrid'`
  2. Add online sections/lectures
  3. Create batches for physical components
  4. Schedule physical sessions

## Batch Management

Batches are used to organize students for physical courses. Each batch has a specific type:

### Batch Types

#### 1. Physical Class (`batch_type = 'physical'`)
- **Use Case**: Regular classroom-based courses
- **Example**: "Python Programming - Batch 1"
- **Features**:
  - Scheduled sessions
  - Location-based
  - Attendance tracking
  - Capacity limits

#### 2. Internship (`batch_type = 'internship'`)
- **Use Case**: Internship programs with structured learning
- **Example**: "Web Development Internship - Summer 2024"
- **Features**:
  - Extended duration
  - Project-based learning
  - Mentorship sessions
  - Progress tracking

#### 3. Bootcamp (`batch_type = 'bootcamp'`)
- **Use Case**: Intensive, short-duration training programs
- **Example**: "Full Stack Bootcamp - January 2024"
- **Features**:
  - Intensive schedule
  - Fast-paced learning
  - Multiple sessions per day
  - Completion certificates

### Creating Batches

1. **Via Admin Panel**:
   - Navigate to: `/admin/lms/batch/`
   - Click "Add Batch"
   - Select course
   - Choose batch type
   - Set capacity, dates, instructor
   - Save

2. **Auto-Creation**:
   - Batches are automatically created when enrollment exceeds capacity
   - System creates new batches as needed

### Batch Sessions

Each batch can have multiple sessions:

- **Scheduling**: Set start/end datetime, location
- **Auto-Scheduling**: System can auto-create sessions based on enrollment
- **Registration**: Students register for specific sessions
- **Attendance**: Track attendance per session

## Workflow Examples

### Example 1: Online Course
```
1. Create Course (modality: online)
2. Add Sections & Lectures
3. Add Quizzes/Assignments
4. Set Price
5. Publish
→ Students enroll and learn at their own pace
```

### Example 2: Physical Course with Batches
```
1. Create Course (modality: physical, max_batch_size: 25)
2. Create Batch (type: physical, capacity: 25)
3. Schedule Sessions (dates, times, location)
4. Students enroll → assigned to batch
5. Students register for sessions
6. Track attendance
```

### Example 3: Internship Program
```
1. Create Course (modality: physical)
2. Create Batch (type: internship, capacity: 10)
3. Set start/end dates (e.g., 3 months)
4. Schedule weekly mentorship sessions
5. Add assignments and projects
6. Track progress
```

### Example 4: Bootcamp
```
1. Create Course (modality: hybrid)
2. Add online pre-work lectures
3. Create Batch (type: bootcamp, capacity: 30)
4. Schedule intensive daily sessions (2 weeks)
5. Combine online + physical learning
```

## Admin Features

### Batch Admin (`/admin/lms/batch/`)
- View all batches
- Filter by type, course, instructor
- See enrolled count and available slots
- Auto-schedule sessions (actions)
- Manage batch details

### Batch Session Admin (`/admin/lms/batchsession/`)
- View all sessions
- Filter by batch, date
- See registered students
- Manage session details

### Course Admin (`/admin/lms/course/`)
- Create courses with different modalities
- Set batch capacity for physical/hybrid courses
- Manage course content
- View enrollments

## API Endpoints

### Batches
- `GET /api/batches/` - List batches
- `POST /api/batches/` - Create batch
- `GET /api/batches/{id}/` - Batch details
- `POST /api/batches/{id}/auto_schedule_sessions/` - Auto-schedule

### Batch Sessions
- `GET /api/batch-sessions/` - List sessions
- `GET /api/batch-sessions/{id}/` - Session details
- `POST /api/batch-sessions/{id}/register/` - Register for session

## Best Practices

1. **Online Courses**: Keep content updated, add preview lectures
2. **Physical Courses**: Plan batches in advance, set realistic capacity
3. **Internships**: Longer duration, focus on projects
4. **Bootcamps**: Intensive schedule, prepare materials in advance
5. **Hybrid**: Balance online and physical components

## Common Issues

1. **No batches created**: Check if course modality is 'physical' or 'hybrid'
2. **Sessions not showing**: Ensure batch has sessions scheduled
3. **Capacity exceeded**: System auto-creates new batches
4. **Attendance not tracking**: Verify session registrations exist

