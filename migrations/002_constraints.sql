-- CONSTRAINTS -> CLINICS TABLE
-- CLINIC STATUS MUST BE VALID
ALTER TABLE clinics
ADD CONSTRAINT clinics_status_check CHECK (
    clinic_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')
  );
-- CONSTRAINTS -> VISITS TABLE
-- ONE VISIT PER APPOINTMENT (HARD BUSSINESS RULE)
ALTER TABLE visits
ADD CONSTRAINT visits_unique_appointment UNIQUE (appointment_id);
-- VISIT STATUS CAN ONLY BE VALID STATES
ALTER TABLE visits
ADD CONSTRAINT visit_status_check CHECK (visit_status IN ('IN_PROGRESS', 'COMPLETED'));
-- FOREIGN KEY: VISIT -> CLINIC
ALTER TABLE visits
ADD CONSTRAINT visits_clinic_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT;
-- FOREIGN KEY: VISIT -> APPOINTMENT
ALTER TABLE visits
ADD CONSTRAINT visits_appointment_fk FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE RESTRICT;
-- FOREIGN KEY: VISIT -> PATIENT
ALTER TABLE visits
ADD CONSTRAINT visits_patients_fk FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT;
-- FOREIGN KEY: VISIT -> DOCTOR
ALTER TABLE visits
ADD CONSTRAINT visits_doctor_fk FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT;
-- FOREIGN KEY: VISIT -> WHO COMPLETED THE VISIT
ALTER TABLE visits
ADD CONSTRAINT visits_completed_by_fk FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE
SET NULL;
-- CONSTRAINTS -> APPOINTMENTS TABLE
-- APPOINTMENT STATUS MUST BE VALID
ALTER TABLE appointments
ADD CONSTRAINT appointment_status_check CHECK (
    appointment_status IN ('SCHEDULED', 'CANCELLED', 'NO_SHOW', 'COMPLETED')
  );
-- APPOINTMENT -> CLINIC
ALTER TABLE appointments
ADD CONSTRAINT appointment_clinic_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT;
-- APPOINTMENT -> PATIENT
ALTER TABLE appointments
ADD CONSTRAINT appointment_patient_fk FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT;
-- APPOINMENT -> DOCTOR
ALTER TABLE appointments
ADD CONSTRAINT appointment_doctor_fx FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT;
-- APPOINTMENT -> WHO CREATED THE APPOINTMENT
ALTER TABLE appointments
ADD CONSTRAINT appointment_created_by_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
SET NULL;
-- CONSTRAINTS -> BILLING USAGE TABLE
-- ONE BILLING PER VISIT (HARD GURANTEE)
ALTER TABLE billing_usage
ADD CONSTRAINT billing_usage_unique_visit UNIQUE (visit_id);
-- BILLING -> CLINIC 
ALTER TABLE billing_usage
ADD CONSTRAINT billing_usage_clinic_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT;
-- BILLING -> VISIT
ALTER TABLE billing_usage
ADD CONSTRAINT billing_usage_visit_fk FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE RESTRICT;
-- UNITS MUST BE POSITIVE
ALTER TABLE billing_usage
ADD CONSTRAINT billing_usage_check CHECK (units > 0);
-- UNIT PRICE MUST BE NON NEGATIVE
ALTER TABLE billing_usage
ADD CONSTRAINT billing_unit_price_check CHECK (unit_price >= 0);
-- ALLOWED USAGE TYPES (FUTURE PROOFED)
ALTER TABLE billing_usage
ADD CONSTRAINT billing_usage_type_check CHECK (usage_type IN ('VISIT_COMPLETION'));
-- CONSTRAINTS -> PRESCRIPTIONS TABLE
-- ONE PRESCRIPTION PER VISIT (HARD MEDICAL RULE)
ALTER TABLE prescriptions
ADD CONSTRAINT prescriptions_unique_visit UNIQUE (visit_id);
-- PRESCRIPTION -> CLINIC
ALTER TABLE prescriptions
ADD CONSTRAINT prescriptions_clinic_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT;
-- PRESCRIPTION -> DOCTOR
ALTER TABLE prescriptions
ADD CONSTRAINT prescriptions_doctor_fk FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT;
-- PRESCRIPTION -> PATIENTS
ALTER TABLE prescriptions
ADD CONSTRAINT prescriptions_patients_fk FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT;
-- CONSTRAINTS -> PATIENTS
-- PATIENTS -> CLINIC
ALTER TABLE patients
ADD CONSTRAINT patients_clinic_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT;
-- ALLOWED GENDER VALUES
ALTER TABLE patients
ADD CONSTRAINT patients_gender_check CHECK (gender IN ('MALE', 'FEMALE', 'OTHER'));
-- CONSTRAINTS DOCTORS
-- DOCTOR → CLINIC
ALTER TABLE doctors
ADD CONSTRAINT doctors_clinic_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT;
-- DOCTOR → USER ACCOUNT
ALTER TABLE doctors
ADD CONSTRAINT doctors_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE
SET NULL;
-- CONSTRAINTS USERS
-- AT LEAST ONE INDETIFIER MUST EXISTS
ALTER TABLE users
ADD CONSTRAINT users_email_or_phone_check CHECK (
    email IS NOT NULL
    OR phone_number IS NOT NULL
  );
-- EMAIL UNIQUENESS (IF PROVIDED)
CREATE UNIQUE INDEX users_email_unique ON users (LOWER(email))
WHERE email IS NOT NULL;
-- PHONE NUMBER UNIQUENESS (IF PROVIDED)
CREATE UNIQUE INDEX users_phone_unique ON users (phone_number)
WHERE phone_number IS NOT NULL;
-- CONSTRAINTS USER CLINIC ROLES
-- USER → CLINIC USER OWNERSHIP
ALTER TABLE user_clinic_roles
ADD CONSTRAINT user_clinic_roles_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- CLINIC → ROLE OWNERSHIP
ALTER TABLE user_clinic_roles
ADD CONSTRAINT user_clinic_roles_clinic_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
-- ONE ROLE PER USER PER CLINIC
ALTER TABLE user_clinic_roles
ADD CONSTRAINT user_clinic_roles_unique UNIQUE (user_id, clinic_id);
-- ALLOWED ROLES ONLY
ALTER TABLE user_clinic_roles
ADD CONSTRAINT user_clinic_roles_role_check CHECK (
    user_role IN ('ADMIN', 'DOCTOR', 'STAFF', 'RECEPTIONIST')
  );
-- CONSTRAINTS USE PATIENTS LINKS TABLE
-- User → patient link ownership
ALTER TABLE user_patient_links
ADD CONSTRAINT user_patient_links_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- Patient → user link ownership
ALTER TABLE user_patient_links
ADD CONSTRAINT user_patient_links_patient_fk FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
-- One active link per user per patient
ALTER TABLE user_patient_links
ADD CONSTRAINT user_patient_links_unique UNIQUE (user_id, patient_id);
-- CONSTRAINTS LAB REPORTS TABLE
-- LAB REPORT -> CLINIC
ALTER TABLE lab_reports
ADD CONSTRAINT lab_reports_clinic_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT;
-- LAB REPORT -> VISIT
ALTER TABLE lab_reports
ADD CONSTRAINT lab_reports_visit_fk FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE RESTRICT;
-- LAB REPORT -> PATIENT
ALTER TABLE lab_reports
ADD CONSTRAINT lab_reports_patient_fk FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT;
-- LAB REPORT -> UPLOADED BY (STAFF / DOCTOR)
ALTER TABLE lab_reports
ADD CONSTRAINT lab_reports_uploaded_by_fk FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE
SET NULL;
-- FILE SIZE MUST BE POSITIVE INTEGER
ALTER TABLE lab_reports
ADD CONSTRAINT lab_reports_file_size_check CHECK (file_size > 0);