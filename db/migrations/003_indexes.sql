-- migrate:up
-- INDEXES -> CLINICS TABLE
-- Public clinic discovery
CREATE INDEX clinics_public_idx ON clinics (is_public)
WHERE is_public = true;
-- Location-based searches
CREATE INDEX clinics_location_idx ON clinics (country, state, city);
-- Operational lookups
CREATE INDEX clinics_status_idx ON clinics (clinic_status);
-- INDEXES -> VISITS TABLE
-- IDEMPOTENCY & LOOKUP BY APPOINTMENT
CREATE INDEX visits_appointment_id_idx ON visits (appointment_id);
-- CLINIC DASHBOARD & FILTRING
CREATE INDEX visits_clinic_id_idx ON visits (clinic_id);
-- ACTIVE VISITS PER CLINIC
CREATE INDEX visits_clinic_status_idx ON visits (clinic_id, visit_status);
-- INDEXES -> APPOINTMENTS TABLE
-- CLINIC SCHEDULED VIEW
CREATE INDEX appointments_clinic_scheduled_idx ON appointments (clinic_id, scheduled_at);
-- DOCTOR'S DAILY APPOINTMENTS
CREATE INDEX appointments_doctor_scheduled_idx ON appointments (doctor_id, scheduled_at);
-- PATIENT APPOINTMENT HISTORY
CREATE INDEX appointments_patient_idx ON appointments (patient_id);
-- INDEXES -> BILLING USAGE TABLE
-- CLINIC LEVEL BILLING REPORTS
CREATE INDEX billing_usage_clinic_occurred_idx ON billing_usage (clinic_id, occurred_at);
-- VISIT LEVEL LOOKUP (ALREADY UNIQUE, BUT HELPS JOIN)
CREATE INDEX billing_usage_visit_id_idx ON billing_usage (visit_id);
-- INDEXES -> PRESCRIPTIONS
-- PATIENT PRESCRIPTION HISTORY
CREATE INDEX prescriptions_patient_idx ON prescriptions (patient_id);
-- DOCTOR PRESCRIPTION HISTORY
CREATE INDEX prescriptions_doctor_idx ON prescriptions (doctor_id);
-- CLINIC LELVEL MEDICAL REPORT
CREATE INDEX prescriptions_clinic_idx ON prescriptions (clinic_id);
-- INDEXES -> PATIENT TABLE
-- Lookup patients by clinic
CREATE INDEX patients_clinic_idx ON patients (clinic_id);
-- Search by phone number (if used)
CREATE INDEX patients_phone_number_idx ON patients (phone_number);
-- External system references (optional integrations)
CREATE INDEX patients_external_ref_idx ON patients (external_ref);
-- INDEXES -> USER TABLE
-- FAST LOOKUP BY EMAIL (LOGIN)
CREATE INDEX users_email_lookup_idx ON users (LOWER(email));
-- FAST LOOKUP BY PHONE NUMBER (OTP LOGIN)
CREATE INDEX users_phone_lookup_idx ON users (phone_number);
-- INDEXES USER PATIENTS LINKS TABLE
-- FIND PATIENTS ACCESSEBLE BY USER
CREATE INDEX user_patient_links_user_idx ON user_patient_links (user_id);
-- FIND USER LINKED TO A PATIENT (AUDIT / CARE TEAMS)
CREATE INDEX user_patient_links_patient_idx ON user_patient_links (patient_id);
-- FAST ACCESS CHECKS (HOT PATH)
CREATE INDEX user_patient_links_active_idx ON user_patient_links (user_id, patient_id)
WHERE is_active = true;
-- INDEXES LAB REPORRS
-- VISIT LEVEL ACCESS (ACTIVE ONLY)
CREATE INDEX lab_reports_visit_active_idx ON lab_reports (visit_id)
WHERE is_deleted = false;
-- PATIENT MEDICAL HISTORY (ACTIVE ONLY)
CREATE INDEX lab_reports_patient_active_idx ON lab_reports (patient_id)
WHERE is_deleted = false;
-- CLINIC AUDITS (INCLUDES DELETED)
CREATE INDEX lab_reports_clinic_uploaded_idx ON lab_reports (clinic_id, uploaded_at);
-- ===========================================================================================
-- ============================ ROLLBACK MIGRATION ===========================================
-- ===========================================================================================
-- migrate:down
DROP INDEX IF EXISTS clinics_public_idx;
DROP INDEX IF EXISTS clinics_location_idx;
DROP INDEX IF EXISTS clinics_status_idx;
DROP INDEX IF EXISTS visits_appointment_id_idx;
DROP INDEX IF EXISTS visits_clinic_id_idx;
DROP INDEX IF EXISTS visits_clinic_status_idx;
DROP INDEX IF EXISTS appointments_clinic_scheduled_idx;
DROP INDEX IF EXISTS appointments_doctor_scheduled_idx;
DROP INDEX IF EXISTS appointments_patient_idx;
DROP INDEX IF EXISTS billing_usage_clinic_occurred_idx;
DROP INDEX IF EXISTS billing_usage_visit_id_idx;
DROP INDEX IF EXISTS prescriptions_patient_idx;
DROP INDEX IF EXISTS prescriptions_doctor_idx;
DROP INDEX IF EXISTS prescriptions_clinic_idx;
DROP INDEX IF EXISTS patients_clinic_idx;
DROP INDEX IF EXISTS patients_phone_number_idx;
DROP INDEX IF EXISTS patients_external_ref_idx;
DROP INDEX IF EXISTS users_email_lookup_idx;
DROP INDEX IF EXISTS users_phone_lookup_idx;
DROP INDEX IF EXISTS user_patient_links_user_idx;
DROP INDEX IF EXISTS user_patient_links_patient_idx;
DROP INDEX IF EXISTS user_patient_links_active_idx;
DROP INDEX IF EXISTS lab_reports_visit_active_idx;
DROP INDEX IF EXISTS lab_reports_patient_active_idx;
DROP INDEX IF EXISTS lab_reports_clinic_uploaded_idx;