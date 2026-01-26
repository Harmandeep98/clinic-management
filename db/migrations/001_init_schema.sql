-- migrate:up
-- CLINICS TABLE
CREATE TABLE clinics (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  display_name VARCHAR NOT NULL,
  phone_number VARCHAR NOT NULL,
  country VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  address_line TEXT NOT NULL,
  postcode VARCHAR NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  timezone VARCHAR NOT NULL,
  clinic_status VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- VISITS TABLE
CREATE TABLE visits (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  appointment_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  visit_status VARCHAR NOT NULL,
  visit_ref VARCHAR NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  completed_by UUID NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- APOINTMENTS TABLE
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  appointment_status VARCHAR NOT NULL,
  appointment_ref VARCHAR NOT NULL,
  created_by UUID NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- BILLING USAGE TABLE
CREATE TABLE billing_usage (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  visit_id UUID NOT NULL,
  usage_type VARCHAR NOT NULL,
  units INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- PRESCRIPTION TABLE
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  visit_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_finalized BOOLEAN NOT NULL DEFAULT false,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
--PATIENTS TABLE
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  full_name VARCHAR NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR NOT NULL,
  phone_number VARCHAR NULL,
  external_ref VARCHAR NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- DOCTORS TABLE
CREATE TABLE doctors (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  full_name VARCHAR NOT NULL,
  specialization VARCHAR NOT NULL,
  registration_number VARCHAR NULL,
  user_id UUID NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR NULL,
  phone_number VARCHAR NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- USER CLINIC ROLE TABLE
CREATE TABLE user_clinic_roles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  user_role VARCHAR NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- USER PATIENTS LINKS TABLE
CREATE TABLE user_patient_links (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- LAB REPORTS TABLE
CREATE TABLE lab_reports (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  visit_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR NOT NULL,
  mime_type VARCHAR NOT NULL,
  file_size INTEGER NOT NULL,
  report_type VARCHAR NULL,
  uploaded_by_user_id UUID NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);


-- migrate:down
DROP TABLE IF EXISTS lab_reports;
DROP TABLE IF EXISTS user_patient_links;
DROP TABLE IF EXISTS user_clinic_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS billing_usage;
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS clinics;