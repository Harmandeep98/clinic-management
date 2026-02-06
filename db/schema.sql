\restrict dbmate

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    appointment_status character varying NOT NULL,
    appointment_ref character varying NOT NULL,
    created_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT appointment_status_check CHECK (((appointment_status)::text = ANY ((ARRAY['SCHEDULED'::character varying, 'CANCELLED'::character varying, 'NO_SHOW'::character varying, 'COMPLETED'::character varying])::text[])))
);


--
-- Name: billing_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_usage (
    id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    visit_id uuid NOT NULL,
    usage_type character varying NOT NULL,
    units integer NOT NULL,
    unit_price integer NOT NULL,
    occurred_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_unit_price_check CHECK ((unit_price >= 0)),
    CONSTRAINT billing_usage_check CHECK ((units > 0)),
    CONSTRAINT billing_usage_type_check CHECK (((usage_type)::text = 'VISIT_COMPLETION'::text))
);


--
-- Name: clinic_admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinic_admins (
    id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying(20) NOT NULL,
    is_primary boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    CONSTRAINT clinic_admins_role_check CHECK (((role)::text = ANY ((ARRAY['DOCTOR'::character varying, 'STAFF'::character varying])::text[])))
);


--
-- Name: clinic_counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinic_counters (
    clinic_id uuid NOT NULL,
    visit_seq bigint DEFAULT 0 NOT NULL,
    appointment_seq bigint DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: clinics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinics (
    id uuid NOT NULL,
    name character varying NOT NULL,
    display_name character varying NOT NULL,
    phone_number character varying NOT NULL,
    country character varying NOT NULL,
    state character varying NOT NULL,
    city character varying NOT NULL,
    address_line text NOT NULL,
    postcode character varying NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    timezone character varying NOT NULL,
    clinic_status character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    short_code character varying(5) NOT NULL,
    slug character varying(50) DEFAULT ''::character varying NOT NULL,
    email character varying(255),
    CONSTRAINT clinics_status_check CHECK (((clinic_status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'SUSPENDED'::character varying])::text[])))
);


--
-- Name: clinics_mapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinics_mapping (
    id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    slug_hash uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: doctor_clinic_link; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_clinic_link (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    doctor_id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctors (
    id uuid NOT NULL,
    full_name character varying NOT NULL,
    specialization character varying NOT NULL,
    registration_number character varying,
    user_id uuid,
    is_public boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lab_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lab_reports (
    id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    visit_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    file_url text NOT NULL,
    file_type character varying NOT NULL,
    mime_type character varying NOT NULL,
    file_size integer NOT NULL,
    report_type character varying,
    uploaded_by_user_id uuid,
    uploaded_at timestamp with time zone NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lab_reports_file_size_check CHECK ((file_size > 0))
);


--
-- Name: patient_clinic_link; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_clinic_link (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients (
    id uuid NOT NULL,
    full_name character varying NOT NULL,
    dob date NOT NULL,
    gender character varying NOT NULL,
    phone_number character varying,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT patients_gender_check CHECK (((gender)::text = ANY ((ARRAY['MALE'::character varying, 'FEMALE'::character varying, 'OTHER'::character varying])::text[])))
);


--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prescriptions (
    id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    visit_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    content text NOT NULL,
    is_finalized boolean DEFAULT false NOT NULL,
    issued_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    id uuid NOT NULL,
    full_name character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_clinic_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_clinic_roles (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    user_role character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    staff_id uuid,
    doctor_id uuid,
    CONSTRAINT user_clinic_roles_role_check CHECK (((user_role)::text = ANY ((ARRAY['ADMIN'::character varying, 'DOCTOR'::character varying, 'STAFF'::character varying])::text[])))
);


--
-- Name: user_patient_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_patient_links (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_refresh_tokens (
    id uuid NOT NULL,
    token_hash text NOT NULL,
    user_id uuid NOT NULL,
    user_type character varying NOT NULL,
    is_revoked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying,
    phone_number character varying,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_email_or_phone_check CHECK (((email IS NOT NULL) OR (phone_number IS NOT NULL)))
);


--
-- Name: visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visits (
    id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    appointment_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    visit_status character varying NOT NULL,
    visit_ref character varying NOT NULL,
    started_at timestamp with time zone NOT NULL,
    completed_at timestamp with time zone,
    completed_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT visit_status_check CHECK (((visit_status)::text = ANY ((ARRAY['IN_PROGRESS'::character varying, 'COMPLETED'::character varying])::text[])))
);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: billing_usage billing_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_usage
    ADD CONSTRAINT billing_usage_pkey PRIMARY KEY (id);


--
-- Name: billing_usage billing_usage_unique_visit; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_usage
    ADD CONSTRAINT billing_usage_unique_visit UNIQUE (visit_id);


--
-- Name: clinic_admins clinic_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_admins
    ADD CONSTRAINT clinic_admins_pkey PRIMARY KEY (id);


--
-- Name: clinic_counters clinic_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_counters
    ADD CONSTRAINT clinic_counters_pkey PRIMARY KEY (clinic_id);


--
-- Name: clinics_mapping clinics_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinics_mapping
    ADD CONSTRAINT clinics_mapping_pkey PRIMARY KEY (id);


--
-- Name: clinics_mapping clinics_mapping_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinics_mapping
    ADD CONSTRAINT clinics_mapping_unique UNIQUE (slug_hash, clinic_id);


--
-- Name: clinics clinics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinics
    ADD CONSTRAINT clinics_pkey PRIMARY KEY (id);


--
-- Name: doctor_clinic_link doctor_clinic_link_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_clinic_link
    ADD CONSTRAINT doctor_clinic_link_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: lab_reports lab_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_reports
    ADD CONSTRAINT lab_reports_pkey PRIMARY KEY (id);


--
-- Name: patient_clinic_link patient_clinic_link_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_clinic_link
    ADD CONSTRAINT patient_clinic_link_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_unique_visit; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_unique_visit UNIQUE (visit_id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: clinic_admins unique_clinic_admin; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_admins
    ADD CONSTRAINT unique_clinic_admin UNIQUE (clinic_id, user_id);


--
-- Name: user_refresh_tokens unique_refresh_token; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_refresh_tokens
    ADD CONSTRAINT unique_refresh_token UNIQUE (token_hash);


--
-- Name: doctor_clinic_link uq_doctor_clinic; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_clinic_link
    ADD CONSTRAINT uq_doctor_clinic UNIQUE (doctor_id, clinic_id);


--
-- Name: patient_clinic_link uq_patient_clinic; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_clinic_link
    ADD CONSTRAINT uq_patient_clinic UNIQUE (patient_id, clinic_id);


--
-- Name: user_clinic_roles user_clinic_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_clinic_roles
    ADD CONSTRAINT user_clinic_roles_pkey PRIMARY KEY (id);


--
-- Name: user_clinic_roles user_clinic_roles_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_clinic_roles
    ADD CONSTRAINT user_clinic_roles_unique UNIQUE (user_id, clinic_id);


--
-- Name: user_patient_links user_patient_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_patient_links
    ADD CONSTRAINT user_patient_links_pkey PRIMARY KEY (id);


--
-- Name: user_patient_links user_patient_links_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_patient_links
    ADD CONSTRAINT user_patient_links_unique UNIQUE (user_id, patient_id);


--
-- Name: user_refresh_tokens user_refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_refresh_tokens
    ADD CONSTRAINT user_refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);


--
-- Name: visits visits_unique_appointment; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_unique_appointment UNIQUE (appointment_id);


--
-- Name: appointments_clinic_scheduled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_clinic_scheduled_idx ON public.appointments USING btree (clinic_id, scheduled_at);


--
-- Name: appointments_doctor_scheduled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_doctor_scheduled_idx ON public.appointments USING btree (doctor_id, scheduled_at);


--
-- Name: appointments_patient_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_patient_idx ON public.appointments USING btree (patient_id);


--
-- Name: billing_usage_clinic_occurred_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX billing_usage_clinic_occurred_idx ON public.billing_usage USING btree (clinic_id, occurred_at);


--
-- Name: billing_usage_visit_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX billing_usage_visit_id_idx ON public.billing_usage USING btree (visit_id);


--
-- Name: clinics_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clinics_location_idx ON public.clinics USING btree (country, state, city);


--
-- Name: clinics_mapping_search_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clinics_mapping_search_idx ON public.clinics_mapping USING btree (slug_hash, clinic_id);


--
-- Name: clinics_public_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clinics_public_idx ON public.clinics USING btree (is_public) WHERE (is_public = true);


--
-- Name: clinics_short_code_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX clinics_short_code_unique ON public.clinics USING btree (short_code);


--
-- Name: clinics_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clinics_status_idx ON public.clinics USING btree (clinic_status);


--
-- Name: idx_clinic_admins_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clinic_admins_active ON public.clinic_admins USING btree (clinic_id) WHERE (is_active = true);


--
-- Name: idx_clinic_admins_clinic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clinic_admins_clinic_id ON public.clinic_admins USING btree (clinic_id);


--
-- Name: idx_clinic_admins_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clinic_admins_primary ON public.clinic_admins USING btree (clinic_id, is_primary) WHERE (is_primary = true);


--
-- Name: idx_clinic_admins_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clinic_admins_user_id ON public.clinic_admins USING btree (user_id);


--
-- Name: idx_clinics_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_clinics_email ON public.clinics USING btree (lower((email)::text)) WHERE (email IS NOT NULL);


--
-- Name: idx_clinics_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_clinics_slug ON public.clinics USING btree (slug) WHERE ((slug)::text <> ''::text);


--
-- Name: idx_doctor_clinic_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doctor_clinic_active ON public.doctor_clinic_link USING btree (doctor_id, clinic_id) WHERE (is_active = true);


--
-- Name: idx_doctor_clinic_clinic_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doctor_clinic_clinic_active ON public.doctor_clinic_link USING btree (clinic_id) WHERE (is_active = true);


--
-- Name: idx_patient_clinic_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patient_clinic_active ON public.patient_clinic_link USING btree (patient_id, clinic_id) WHERE (is_active = true);


--
-- Name: idx_patient_clinic_clinic_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patient_clinic_clinic_active ON public.patient_clinic_link USING btree (clinic_id) WHERE (is_active = true);


--
-- Name: lab_reports_clinic_uploaded_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lab_reports_clinic_uploaded_idx ON public.lab_reports USING btree (clinic_id, uploaded_at);


--
-- Name: lab_reports_patient_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lab_reports_patient_active_idx ON public.lab_reports USING btree (patient_id) WHERE (is_deleted = false);


--
-- Name: lab_reports_visit_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lab_reports_visit_active_idx ON public.lab_reports USING btree (visit_id) WHERE (is_deleted = false);


--
-- Name: patients_phone_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX patients_phone_number_idx ON public.patients USING btree (phone_number);


--
-- Name: prescriptions_clinic_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX prescriptions_clinic_idx ON public.prescriptions USING btree (clinic_id);


--
-- Name: prescriptions_doctor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX prescriptions_doctor_idx ON public.prescriptions USING btree (doctor_id);


--
-- Name: prescriptions_patient_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX prescriptions_patient_idx ON public.prescriptions USING btree (patient_id);


--
-- Name: user_clinic_roles_doctor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_clinic_roles_doctor_idx ON public.user_clinic_roles USING btree (doctor_id) WHERE (doctor_id IS NOT NULL);


--
-- Name: user_clinic_roles_staff_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_clinic_roles_staff_idx ON public.user_clinic_roles USING btree (staff_id) WHERE (staff_id IS NOT NULL);


--
-- Name: user_hashed_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_hashed_token ON public.user_refresh_tokens USING btree (token_hash);


--
-- Name: user_patient_links_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_patient_links_active_idx ON public.user_patient_links USING btree (user_id, patient_id) WHERE (is_active = true);


--
-- Name: user_patient_links_patient_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_patient_links_patient_idx ON public.user_patient_links USING btree (patient_id);


--
-- Name: user_patient_links_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_patient_links_user_idx ON public.user_patient_links USING btree (user_id);


--
-- Name: users_email_lookup_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_lookup_idx ON public.users USING btree (lower((email)::text));


--
-- Name: users_email_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (lower((email)::text)) WHERE (email IS NOT NULL);


--
-- Name: users_phone_lookup_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_phone_lookup_idx ON public.users USING btree (phone_number);


--
-- Name: users_phone_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_phone_unique ON public.users USING btree (phone_number) WHERE (phone_number IS NOT NULL);


--
-- Name: visits_appointment_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_appointment_id_idx ON public.visits USING btree (appointment_id);


--
-- Name: visits_clinic_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_clinic_id_idx ON public.visits USING btree (clinic_id);


--
-- Name: visits_clinic_started_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_clinic_started_id_idx ON public.visits USING btree (clinic_id, started_at DESC, id DESC);


--
-- Name: visits_clinic_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_clinic_status_idx ON public.visits USING btree (clinic_id, visit_status);


--
-- Name: visits_doctor_started_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_doctor_started_id_idx ON public.visits USING btree (doctor_id, started_at DESC, id DESC);


--
-- Name: visits_patient_started_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visits_patient_started_id_idx ON public.visits USING btree (patient_id, started_at DESC, id DESC);


--
-- Name: appointments appointment_clinic_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointment_clinic_fk FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE RESTRICT;


--
-- Name: appointments appointment_created_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointment_created_by_fk FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: appointments appointment_doctor_fx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointment_doctor_fx FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE RESTRICT;


--
-- Name: appointments appointment_patient_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointment_patient_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;


--
-- Name: billing_usage billing_usage_clinic_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_usage
    ADD CONSTRAINT billing_usage_clinic_fk FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE RESTRICT;


--
-- Name: billing_usage billing_usage_visit_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_usage
    ADD CONSTRAINT billing_usage_visit_fk FOREIGN KEY (visit_id) REFERENCES public.visits(id) ON DELETE RESTRICT;


--
-- Name: clinic_admins clinic_admins_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_admins
    ADD CONSTRAINT clinic_admins_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: clinic_admins clinic_admins_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_admins
    ADD CONSTRAINT clinic_admins_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: clinic_admins clinic_admins_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_admins
    ADD CONSTRAINT clinic_admins_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: clinic_admins clinic_admins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_admins
    ADD CONSTRAINT clinic_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: clinic_counters clinic_counters_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_counters
    ADD CONSTRAINT clinic_counters_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: clinics_mapping clinics_mapping_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinics_mapping
    ADD CONSTRAINT clinics_mapping_fk FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE RESTRICT;


--
-- Name: doctor_clinic_link doctor_clinic_link_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_clinic_link
    ADD CONSTRAINT doctor_clinic_link_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: doctor_clinic_link doctor_clinic_link_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_clinic_link
    ADD CONSTRAINT doctor_clinic_link_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: doctors doctors_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: lab_reports lab_reports_clinic_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_reports
    ADD CONSTRAINT lab_reports_clinic_fk FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE RESTRICT;


--
-- Name: lab_reports lab_reports_patient_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_reports
    ADD CONSTRAINT lab_reports_patient_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;


--
-- Name: lab_reports lab_reports_uploaded_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_reports
    ADD CONSTRAINT lab_reports_uploaded_by_fk FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: lab_reports lab_reports_visit_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_reports
    ADD CONSTRAINT lab_reports_visit_fk FOREIGN KEY (visit_id) REFERENCES public.visits(id) ON DELETE RESTRICT;


--
-- Name: patient_clinic_link patient_clinic_link_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_clinic_link
    ADD CONSTRAINT patient_clinic_link_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: patient_clinic_link patient_clinic_link_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_clinic_link
    ADD CONSTRAINT patient_clinic_link_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: prescriptions prescriptions_clinic_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_clinic_fk FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE RESTRICT;


--
-- Name: prescriptions prescriptions_doctor_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_doctor_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE RESTRICT;


--
-- Name: prescriptions prescriptions_patients_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_patients_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;


--
-- Name: user_clinic_roles user_clinic_roles_clinic_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_clinic_roles
    ADD CONSTRAINT user_clinic_roles_clinic_fk FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: user_clinic_roles user_clinic_roles_doctor_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_clinic_roles
    ADD CONSTRAINT user_clinic_roles_doctor_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE SET NULL;


--
-- Name: user_clinic_roles user_clinic_roles_staff_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_clinic_roles
    ADD CONSTRAINT user_clinic_roles_staff_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- Name: user_clinic_roles user_clinic_roles_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_clinic_roles
    ADD CONSTRAINT user_clinic_roles_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_patient_links user_patient_links_patient_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_patient_links
    ADD CONSTRAINT user_patient_links_patient_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: user_patient_links user_patient_links_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_patient_links
    ADD CONSTRAINT user_patient_links_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_refresh_tokens user_refresh_tokens_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_refresh_tokens
    ADD CONSTRAINT user_refresh_tokens_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: visits visits_appointment_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_appointment_fk FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE RESTRICT;


--
-- Name: visits visits_clinic_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_clinic_fk FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE RESTRICT;


--
-- Name: visits visits_completed_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_completed_by_fk FOREIGN KEY (completed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: visits visits_doctor_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_doctor_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE RESTRICT;


--
-- Name: visits visits_patients_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_patients_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('001'),
    ('0010'),
    ('0011'),
    ('0012'),
    ('0013'),
    ('0014'),
    ('0015'),
    ('0016'),
    ('0017'),
    ('0018'),
    ('002'),
    ('003'),
    ('004'),
    ('005'),
    ('006'),
    ('007'),
    ('008'),
    ('009');
