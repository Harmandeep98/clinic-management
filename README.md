# 🏥 Clinic Management System

A comprehensive multi-tenant healthcare management platform designed for clinics, doctors, and patients.

---

## 🎯 What is This System?

The Clinic Management System is a **cloud-based platform** that helps medical clinics streamline their daily operations. It supports **multiple clinics** under one platform, each operating independently with their own staff, doctors, and patients.

---

## 👥 Who Uses This System?

| Role             | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------ |
| **Clinic Admin** | Manages clinic settings, staff, and oversees operations                        |
| **Doctor**       | Views appointments, starts visits, writes prescriptions, uploads lab reports   |
| **Staff**        | Handles front-desk tasks like scheduling appointments and patient registration |
| **Patient**      | Books appointments, views medical history, accesses prescriptions and reports  |

---

## ⚙️ Core Features

### 🏢 Multi-Clinic Support

- Each clinic operates independently with its own data
- Clinics have unique short codes (e.g., `ABC01`) for identification
- Support for multiple locations (country, state, city)
- Clinic status management: Active, Inactive, or Suspended

### 👨‍⚕️ Doctor Management

- Doctors can work across multiple clinics
- Specialization and registration number tracking
- Public/private visibility settings
- Activity status management

### 🧑‍🤝‍🧑 Patient Records

- Comprehensive patient profiles with demographics
- Gender tracking (Male, Female, Other)
- Phone number for OTP-based authentication
- External reference support for integration with other systems
- Patients can be linked to multiple clinics

### 📅 Appointment Scheduling

- Schedule appointments between patients and doctors
- Unique appointment references (e.g., `ABC01-A1234`)
- Status tracking: **Scheduled** → **Completed** / **Cancelled** / **No Show**
- Notes and timestamps for record keeping

### 🩺 Visit Management

- Visits are created from completed appointments
- Track visit status: **In Progress** → **Completed**
- Unique visit references (e.g., `ABC01-V5678`)
- Start and completion timestamps
- Visit notes for documentation

### 📝 Prescriptions

- One prescription per visit
- Doctor-issued with finalization status
- Patient access to prescription history

### 🔬 Lab Reports

- Upload lab reports per visit
- File metadata tracking (type, size, mime type)
- Soft delete support for data retention
- Patient access to their lab history

### 💰 Billing & Usage Tracking

- Track billing per visit
- Usage type tracking (e.g., visit completion)
- Unit-based pricing support
- Clinic-level billing reports

---

## 🔐 User Roles & Permissions

### Clinic Roles

Users can have one role per clinic:

| Role       | Access Level                        |
| ---------- | ----------------------------------- |
| **ADMIN**  | Full clinic management access       |
| **DOCTOR** | Patient care, prescriptions, visits |
| **STAFF**  | Front-desk operations, appointments |

### Patient Access

- Patients have their own authentication flow
- Can view appointments, prescriptions, and lab reports
- Can be linked to multiple clinics

---

## 📊 Key Business Flows

### Patient Visit Flow

```
1. Patient registers/logs in
         ↓
2. Staff schedules appointment
         ↓
3. Appointment confirmed (SCHEDULED)
         ↓
4. Patient arrives → Doctor starts visit (IN_PROGRESS)
         ↓
5. Doctor examines, writes prescription
         ↓
6. Lab reports uploaded (if any)
         ↓
7. Visit completed → Billing recorded
```

### Multi-Clinic Scenario

```
┌─────────────────┐     ┌─────────────────┐
│   Clinic A      │     │   Clinic B      │
│   (ABC01)       │     │   (XYZ02)       │
├─────────────────┤     ├─────────────────┤
│ • Dr. Smith     │     │ • Dr. Smith     │  ← Same doctor, 2 clinics
│ • Dr. Jones     │     │ • Dr. Patel     │
│ • Staff: Alice  │     │ • Staff: Bob    │
└─────────────────┘     └─────────────────┘
        │                       │
        └───────┬───────────────┘
                ↓
        Patient John can visit
           both clinics
```

---

## 🏗️ Technical Overview

| Component          | Technology                     |
| ------------------ | ------------------------------ |
| **Backend**        | Node.js + TypeScript + Fastify |
| **Database**       | PostgreSQL                     |
| **Cache/Sessions** | Redis                          |
| **Authentication** | JWT + OTP-based                |
| **Migrations**     | Dbmate                         |
| **API Docs**       | OpenAPI/Swagger                |

---

## 📁 Data Structure Summary

| Entity          | Purpose                                |
| --------------- | -------------------------------------- |
| `clinics`       | Medical facility organizations         |
| `users`         | Login accounts (email/phone)           |
| `doctors`       | Medical practitioners                  |
| `patients`      | Patient records                        |
| `appointments`  | Scheduled doctor-patient meetings      |
| `visits`        | Actual clinic visits from appointments |
| `prescriptions` | Doctor-issued prescriptions per visit  |
| `lab_reports`   | Uploaded diagnostic reports            |
| `billing_usage` | Visit-based billing records            |

---

## 🔒 Security Features

- **OTP Authentication** – Phone-based one-time passwords
- **JWT Tokens** – Secure session management with refresh tokens
- **Role-Based Access** – Permissions tied to user roles per clinic
- **Data Isolation** – Each clinic's data is separated
- **Secure Password Hashing** – SHA-256 token hashing

---

## 📈 Future Capabilities

- [ ] Patient mobile app
- [ ] Prescription PDF generation
- [ ] Appointment reminders (SMS/Email)
- [ ] Telemedicine video consultations
- [ ] Insurance integration
- [ ] Analytics dashboard
