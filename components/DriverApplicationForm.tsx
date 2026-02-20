"use client";

// ST·SURFERS — DRIVER APPLICATION FORM
// 5-step multi-step form. react-hook-form + Zod validation.
// Submits to Google Apps Script → "Drivers" sheet tab.
// File binaries (licence, PDP, photos) are NOT uploaded — user is prompted to WhatsApp docs.

const DRIVER_FORM_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbykAd2MvxAD1DPCT3nXahrvrtmy7A1o4UCCoQ-EpLeygJ1zXTfY9vfbsUpYqJa3zVE/exec";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { COVERAGE_AREAS, CONTACT } from "@/lib/constants";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LABELS = ["Personal", "Vehicle", "Licences", "Consent", "Availability"];
const DAYS        = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const GENDERS     = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;
const VEHICLE_TYPES = ["Sedan", "SUV", "Van", "Minibus", "Bakkie"] as const;
const LICENSE_CODES = ["Code EB", "Code 10", "Code 14"] as const;

const VEHICLE_PHOTO_LABELS = [
  "Front",
  "Rear",
  "Interior (Driver side)",
  "Interior (Passenger side)",
] as const;

// ─── Zod schema (full — step-by-step validation via trigger()) ────────────────

const schema = z.object({
  // Step 1 — Personal
  name:     z.string().min(2, "Full name required"),
  idNumber: z.string().regex(/^\d{13}$/, "Must be exactly 13 digits"),
  dob:      z.string().min(1, "Date of birth required"),
  gender:   z.string().min(1, "Please select"),
  suburb:   z.string().min(2, "Home suburb required"),
  phone:    z.string().regex(/^(\+27|0)[6-8]\d{8}$/, "Valid SA number (+27 or 0XX)"),
  email:    z.string().email("Valid email required"),

  // Step 2 — Vehicle
  make:        z.string().min(1, "Required"),
  model:       z.string().min(1, "Required"),
  year:        z.number().refine((n) => !isNaN(n) && Number.isInteger(n) && n >= 2000 && n <= new Date().getFullYear(), "Enter a valid year (2000–present)"),
  plate:       z.string().min(1, "Required"),
  colour:      z.string().min(1, "Required"),
  vehicleType: z.string().min(1, "Please select vehicle type"),
  seats:       z.number().refine((n) => !isNaN(n) && Number.isInteger(n) && n >= 2 && n <= 8, "Enter seats between 2 and 8"),

  // Step 3 — Licences
  licenseNumber: z.string().min(1, "Required"),
  licenseCode:   z.string().min(1, "Select code"),
  licenseExpiry: z.string().refine((d) => d && new Date(d) > new Date(), "Must not be expired"),
  pdpNumber:     z.string().min(1, "Required"),
  pdpExpiry:     z.string().refine((d) => d && new Date(d) > new Date(), "Must not be expired"),

  // Step 4 — Consent
  consentCriminal: z.boolean().refine((v) => v, "This consent is required"),
  consentDriving:  z.boolean().refine((v) => v, "This consent is required"),
  consentAccurate: z.boolean().refine((v) => v, "Please confirm accuracy"),

  // Step 5 — Availability
  days:          z.array(z.string()).min(1, "Select at least one day"),
  morningShift:  z.boolean(),
  afternoonShift:z.boolean(),
  areas:         z.array(z.string()).min(1, "Select at least one area"),
});

type FormData = z.infer<typeof schema>;

// Fields that belong to each step — used for per-step trigger()
const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ["name", "idNumber", "dob", "gender", "suburb", "phone", "email"],
  2: ["make", "model", "year", "plate", "colour", "vehicleType", "seats"],
  3: ["licenseNumber", "licenseCode", "licenseExpiry", "pdpNumber", "pdpExpiry"],
  4: ["consentCriminal", "consentDriving", "consentAccurate"],
  5: ["days", "morningShift", "afternoonShift", "areas"],
};

// ─── FileUploadZone ───────────────────────────────────────────────────────────

function FileUploadZone({
  label,
  accept,
  shape = "square",
  file,
  onFile,
  error,
}: {
  label:    string;
  accept:   string;
  shape?:   "circle" | "square";
  file:     File | null;
  onFile:   (f: File | null) => void;
  error?:   string;
}) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sizeErr, setSizeErr] = useState<string | null>(null);

  // Revoke object URL on unmount or file change
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  function handleFile(f: File) {
    if (f.size > 5 * 1024 * 1024) { setSizeErr("Max 5 MB"); return; }
    setSizeErr(null);
    onFile(f);
    if (f.type.startsWith("image/")) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  const displayError = sizeErr || error;
  const isImage      = file?.type.startsWith("image/");
  const isPdf        = file?.type === "application/pdf" || file?.name.endsWith(".pdf");

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
          shape === "circle" ? "w-24 h-24 rounded-full" : "w-full h-28 rounded-xl"
        }`}
        style={{
          background:  preview ? "transparent" : "rgba(255,255,255,0.03)",
          border:      displayError
            ? "1.5px dashed rgba(208,28,0,0.6)"
            : preview
            ? "none"
            : "1.5px dashed rgba(255,255,255,0.15)",
        }}
      >
        {preview && isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={label}
            className={`object-cover ${shape === "circle" ? "w-24 h-24 rounded-full" : "w-full h-28 rounded-xl"}`}
          />
        ) : file && isPdf ? (
          <div className="flex flex-col items-center gap-1 px-3 text-center">
            <svg className="w-6 h-6" style={{ color: "#D01C00" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-body text-xs text-ss-white truncate max-w-full px-1">{file.name}</span>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center gap-1 px-3 text-center">
            <svg className="w-5 h-5" style={{ color: "#D01C00" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-body text-xs text-ss-white truncate max-w-full px-1">{file.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-3 text-center">
            <svg className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-body text-xs leading-snug" style={{ color: "rgba(255,255,255,0.35)" }}>
              {label}
            </span>
          </div>
        )}
      </button>
      {displayError && (
        <p className="font-body text-xs" style={{ color: "#D01C00" }}>{displayError}</p>
      )}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, error, required, tip, children }: {
  label:     string;
  error?:    string;
  required?: boolean;
  tip?:      string;
  children:  React.ReactNode;
}) {
  const [tipOpen, setTipOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="font-body text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
          {label}{required && <span style={{ color: "#D01C00" }}> *</span>}
        </label>
        {tip && (
          <button
            type="button"
            onClick={() => setTipOpen(!tipOpen)}
            className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
            aria-label="More info"
          >
            i
          </button>
        )}
      </div>
      {tip && tipOpen && (
        <p className="font-body text-xs p-3 rounded-lg leading-relaxed" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
          {tip}
        </p>
      )}
      {children}
      {error && <p className="font-body text-xs" style={{ color: "#D01C00" }}>{error}</p>}
    </div>
  );
}

// ─── Input style helper ────────────────────────────────────────────────────────

const inputCls = "w-full px-4 py-3 rounded-xl font-body text-sm text-ss-white bg-transparent outline-none transition-all";
const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
};

// ─── Slide animation variants ─────────────────────────────────────────────────

const slideVariants = {
  enter:  (dir: number) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir * -60, opacity: 0 }),
};

// ─── T&C content ──────────────────────────────────────────────────────────────

const TC_TEXT = `DRIVER PARTNER AGREEMENT — KEY TERMS

SERVICE STANDARDS
Driver partners agree to: arrive on time for all scheduled routes; keep vehicles clean, roadworthy, and fully fuelled; treat all riders with courtesy and professionalism; wear appropriate attire at all times; and follow all St·Surfers operational guidelines.

CODE OF CONDUCT
Driver partners must not: use a mobile phone while driving (hands-free only); smoke in or around the vehicle; drive under the influence of any substance; carry unauthorised passengers on St·Surfers routes; share rider personal information with any third party.

VEHICLE COMPLIANCE
All driver partners must ensure their vehicle remains roadworthy, fully insured, and in good mechanical condition throughout the duration of their partnership. St·Surfers reserves the right to conduct spot inspections. Any vehicle deemed unsafe will be immediately removed from service.

LICENSING & PERMITS
Driver partners must maintain a valid South African driver's licence (Code EB or higher) and a valid Professional Driver's Permit (PDP) at all times. Lapses in either will result in immediate suspension from operations until compliance is restored.

PAYMENTS
Monthly earnings are calculated based on confirmed completed trips. Payments are processed at the end of each calendar month. Rate queries or disputes must be raised in writing within 7 days of the monthly statement date.

PRIVACY & DATA
All personal information collected during the application process is handled in accordance with the Protection of Personal Information Act (POPIA). Your data will not be shared with third parties without your consent.

TERMINATION
St·Surfers reserves the right to terminate a driver partnership with 7 days written notice, or immediately in cases of serious misconduct, safety violations, licence/permit invalidity, or repeated failure to meet service standards.

By submitting this application and checking the boxes below, you confirm that you have read, understood, and agree to abide by the St·Surfers Driver Partner Standards described above.`;

// ─── Main component ───────────────────────────────────────────────────────────

export default function DriverApplicationForm() {
  const [step,      setStep]      = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [shiftError,  setShiftError]  = useState<string | null>(null);

  // File state — managed outside react-hook-form
  const [profilePhoto,    setProfilePhoto]    = useState<File | null>(null);
  const [regDoc,          setRegDoc]          = useState<File | null>(null);
  const [vehiclePhotos,   setVehiclePhotos]   = useState<(File | null)[]>([null, null, null, null]);
  const [licenseCopy,     setLicenseCopy]     = useState<File | null>(null);
  const [pdpCopy,         setPdpCopy]         = useState<File | null>(null);
  const [fileErrors,      setFileErrors]      = useState<Record<string, string>>({});

  const { register, handleSubmit, trigger, watch, setValue, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", idNumber: "", dob: "", gender: "", suburb: "", phone: "", email: "",
      make: "", model: "", year: new Date().getFullYear(), plate: "", colour: "", vehicleType: "", seats: 4,
      licenseNumber: "", licenseCode: "", licenseExpiry: "", pdpNumber: "", pdpExpiry: "",
      consentCriminal: false, consentDriving: false, consentAccurate: false,
      days: [], morningShift: false, afternoonShift: false, areas: [],
    },
    mode: "onTouched",
  });

  const watchDays          = watch("days") ?? [];
  const watchAreas         = watch("areas") ?? [];
  const watchMorning       = watch("morningShift");
  const watchAfternoon     = watch("afternoonShift");
  const watchConsentAll    = watch(["consentCriminal", "consentDriving", "consentAccurate"]);

  function toggleArray(field: "days" | "areas", value: string) {
    const current = field === "days" ? watchDays : watchAreas;
    setValue(
      field,
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      { shouldValidate: true }
    );
  }

  // ── File validation per step ─────────────────────────────────────────────
  function validateStepFiles(s: number): boolean {
    const errs: Record<string, string> = {};
    if (s === 2) {
      if (!regDoc) errs.regDoc = "Registration document required";
      if (vehiclePhotos.every((f) => f === null)) errs.vehiclePhotos = "At least one vehicle photo required";
    }
    if (s === 3) {
      if (!licenseCopy) errs.licenseCopy = "Driver's licence copy required";
      if (!pdpCopy)     errs.pdpCopy     = "PDP copy required";
    }
    setFileErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  async function handleNext() {
    const fields = STEP_FIELDS[step] as (keyof FormData)[];
    const valid  = await trigger(fields);
    if (!valid) return;

    // File checks
    if (!validateStepFiles(step)) return;

    // Step 5: at least one shift
    if (step === 5) {
      const { morningShift, afternoonShift } = getValues();
      if (!morningShift && !afternoonShift) {
        setShiftError("Select at least one shift");
        return;
      }
      setShiftError(null);
      // If on step 5 and valid → submit
      handleSubmit(onSubmit)();
      return;
    }

    setDirection(1);
    setStep((prev) => prev + 1);
  }

  function handleBack() {
    setDirection(-1);
    setStep((prev) => prev - 1);
    setFileErrors({});
    setShiftError(null);
  }

  // ── Form submit ───────────────────────────────────────────────────────────
  async function onSubmit(data: FormData) {
    setSubmitState("loading");

    const payload = {
      ...data,
      sheetName:       "Drivers",
      timestamp:       new Date().toISOString(),
      hasProfilePhoto: !!profilePhoto,
      hasRegDoc:       !!regDoc,
      vehiclePhotoCount: vehiclePhotos.filter(Boolean).length,
      hasLicenseCopy:  !!licenseCopy,
      hasPdpCopy:      !!pdpCopy,
    };

    try {
      // mode: "no-cors" is required for Google Apps Script web apps called from
      // the browser — the response is opaque (status 0) but the script still runs.
      await fetch(DRIVER_FORM_ENDPOINT, {
        method: "POST",
        mode:   "no-cors",
        body:   JSON.stringify(payload),
      });
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  }

  // ── Progress bar ──────────────────────────────────────────────────────────
  function ProgressBar() {
    return (
      <div className="flex items-center gap-0 mb-8">
        {STEP_LABELS.map((label, i) => {
          const n     = i + 1;
          const done  = n < step;
          const active = n === step;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs flex-shrink-0 transition-all duration-300"
                  style={{
                    background: done || active ? "#D01C00" : "rgba(255,255,255,0.06)",
                    color:      done || active ? "#fff"    : "rgba(255,255,255,0.3)",
                    border:     active ? "2px solid #D01C00" : "none",
                    boxShadow:  active ? "0 0 10px rgba(208,28,0,0.4)" : "none",
                  }}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : n}
                </div>
                <span
                  className="font-body text-xs hidden sm:block"
                  style={{ color: done || active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)" }}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className="flex-1 h-px mx-1 transition-all duration-500"
                  style={{ background: done ? "#D01C00" : "rgba(255,255,255,0.08)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Step renders ──────────────────────────────────────────────────────────

  function renderStep1() {
    return (
      <div className="space-y-5">
        <h3 className="font-display font-bold text-ss-white text-xl mb-6">Tell us about yourself</h3>

        <div className="flex justify-center mb-2">
          <div className="flex flex-col items-center gap-2">
            <FileUploadZone
              label="Upload profile photo"
              accept="image/*"
              shape="circle"
              file={profilePhoto}
              onFile={setProfilePhoto}
            />
            <span className="font-body text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Profile photo (optional)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Full Name" required error={errors.name?.message}>
            <input {...register("name")} placeholder="e.g. Thabo Ndlovu" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="SA ID Number" required error={errors.idNumber?.message}>
            <input {...register("idNumber")} placeholder="13-digit ID number" maxLength={13} className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Date of Birth" required error={errors.dob?.message}>
            <input type="date" {...register("dob")} className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Gender" required error={errors.gender?.message}>
            <select {...register("gender")} className={inputCls} style={inputStyle}>
              <option value="">Select</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Home Suburb" required error={errors.suburb?.message}>
            <input {...register("suburb")} placeholder="e.g. Soweto" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Phone Number" required error={errors.phone?.message}>
            <input {...register("phone")} placeholder="+27 6X XXX XXXX" className={inputCls} style={inputStyle} />
          </Field>
        </div>
        <Field label="Email Address" required error={errors.email?.message}>
          <input type="email" {...register("email")} placeholder="you@example.com" className={inputCls} style={inputStyle} />
        </Field>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="space-y-5">
        <h3 className="font-display font-bold text-ss-white text-xl mb-6">Tell us about your vehicle</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Vehicle Make" required error={errors.make?.message}>
            <input {...register("make")} placeholder="e.g. Toyota" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Vehicle Model" required error={errors.model?.message}>
            <input {...register("model")} placeholder="e.g. Corolla" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Year of Manufacture" required error={errors.year?.message}>
            <input type="number" {...register("year", { valueAsNumber: true })} min={2000} max={new Date().getFullYear()} className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Registration Plate" required error={errors.plate?.message}>
            <input {...register("plate")} placeholder="e.g. GP 123456" className={`${inputCls} uppercase`} style={inputStyle} />
          </Field>
          <Field label="Vehicle Colour" required error={errors.colour?.message}>
            <input {...register("colour")} placeholder="e.g. White" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Vehicle Type" required error={errors.vehicleType?.message}>
            <select {...register("vehicleType")} className={inputCls} style={inputStyle}>
              <option value="">Select</option>
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Number of Seats" required error={errors.seats?.message}>
            <input type="number" {...register("seats", { valueAsNumber: true })} min={2} max={8} className={inputCls} style={inputStyle} />
          </Field>
        </div>

        {/* Registration document */}
        <Field label="Vehicle Registration Document" required error={fileErrors.regDoc}>
          <FileUploadZone
            label="Upload registration doc (PDF or image)"
            accept=".pdf,image/*"
            file={regDoc}
            onFile={setRegDoc}
            error={fileErrors.regDoc}
          />
        </Field>

        {/* Vehicle photos — 4 slots */}
        <div>
          <p className="font-body text-xs uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            Vehicle Photos <span style={{ color: "#D01C00" }}>*</span>
            <span className="ml-2 normal-case tracking-normal" style={{ color: "rgba(255,255,255,0.3)" }}>(at least one required)</span>
          </p>
          {fileErrors.vehiclePhotos && (
            <p className="font-body text-xs mb-2" style={{ color: "#D01C00" }}>{fileErrors.vehiclePhotos}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {VEHICLE_PHOTO_LABELS.map((label, i) => (
              <div key={label} className="flex flex-col gap-1">
                <FileUploadZone
                  label={label}
                  accept="image/*"
                  file={vehiclePhotos[i]}
                  onFile={(f) => {
                    const next = [...vehiclePhotos];
                    next[i] = f;
                    setVehiclePhotos(next);
                  }}
                />
                <span className="font-body text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderStep3() {
    const pdpTip = "A Professional Driver's Permit (PDP) is required by South African law for anyone who transports passengers for reward. It is issued by your local traffic department and must be renewed every two years.";
    return (
      <div className="space-y-5">
        <h3 className="font-display font-bold text-ss-white text-xl mb-6">Your licences &amp; permits</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Driver's Licence Number" required error={errors.licenseNumber?.message}>
            <input {...register("licenseNumber")} placeholder="Licence number" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Licence Code" required error={errors.licenseCode?.message}>
            <select {...register("licenseCode")} className={inputCls} style={inputStyle}>
              <option value="">Select code</option>
              {LICENSE_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Licence Expiry Date" required error={errors.licenseExpiry?.message}>
            <input type="date" {...register("licenseExpiry")} className={inputCls} style={inputStyle} />
          </Field>
          <div /> {/* spacer */}
          <Field label="PDP Number" required error={errors.pdpNumber?.message} tip={pdpTip}>
            <input {...register("pdpNumber")} placeholder="PDP number" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="PDP Expiry Date" required error={errors.pdpExpiry?.message}>
            <input type="date" {...register("pdpExpiry")} className={inputCls} style={inputStyle} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Driver's Licence Copy" required error={fileErrors.licenseCopy}>
            <FileUploadZone
              label="Upload licence copy (PDF or image)"
              accept=".pdf,image/*"
              file={licenseCopy}
              onFile={setLicenseCopy}
              error={fileErrors.licenseCopy}
            />
          </Field>
          <Field label="PDP Copy" required error={fileErrors.pdpCopy}>
            <FileUploadZone
              label="Upload PDP copy (PDF or image)"
              accept=".pdf,image/*"
              file={pdpCopy}
              onFile={setPdpCopy}
              error={fileErrors.pdpCopy}
            />
          </Field>
        </div>
      </div>
    );
  }

  function renderStep4() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-ss-white text-xl mb-2">Background check consent</h3>
          <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            To protect our riders, all St·Surfers driver partners undergo comprehensive screening
            before activation. Please read the terms below and tick all three boxes.
          </p>
        </div>

        {/* Scrollable T&C */}
        <div
          className="rounded-xl p-4 font-body text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap"
          style={{
            maxHeight: "200px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {TC_TEXT}
        </div>

        {/* Consent checkboxes */}
        <div className="space-y-4">
          {(
            [
              { field: "consentCriminal", label: "I consent to a criminal background check being conducted" },
              { field: "consentDriving",  label: "I consent to a driving record check being conducted" },
              { field: "consentAccurate", label: "I confirm that all information provided is accurate and truthful" },
            ] as const
          ).map(({ field, label }) => (
            <div key={field}>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    {...register(field)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center transition-all peer-checked:bg-[#D01C00] peer-checked:border-[#D01C00]"
                    style={{
                      background: watchConsentAll[["consentCriminal","consentDriving","consentAccurate"].indexOf(field) as 0|1|2]
                        ? "#D01C00" : "rgba(255,255,255,0.04)",
                      border: "1.5px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {watchConsentAll[["consentCriminal","consentDriving","consentAccurate"].indexOf(field) as 0|1|2] && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {label}
                </span>
              </label>
              {errors[field] && (
                <p className="font-body text-xs mt-1 ml-8" style={{ color: "#D01C00" }}>{errors[field]?.message}</p>
              )}
            </div>
          ))}
        </div>

        {/* POPIA notice */}
        <p className="font-body text-xs leading-relaxed p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
          🔒 Your personal information is collected and processed in accordance with the
          Protection of Personal Information Act (POPIA). We do not share your data with
          third parties without your consent.
        </p>
      </div>
    );
  }

  function renderStep5() {
    const areaList = COVERAGE_AREAS.filter((a) => a !== "Other");
    return (
      <div className="space-y-6">
        <h3 className="font-display font-bold text-ss-white text-xl mb-6">When are you available?</h3>

        {/* Days */}
        <div>
          <p className="font-body text-xs uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            Available days <span style={{ color: "#D01C00" }}>*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const selected = watchDays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleArray("days", d)}
                  className="px-4 py-2 rounded-full font-body text-sm font-semibold transition-all"
                  style={{
                    background: selected ? "#D01C00" : "rgba(255,255,255,0.05)",
                    color:      selected ? "#fff"    : "rgba(255,255,255,0.5)",
                    border:     selected ? "none"    : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
          {errors.days && <p className="font-body text-xs mt-2" style={{ color: "#D01C00" }}>{errors.days.message}</p>}
        </div>

        {/* Shifts */}
        <div>
          <p className="font-body text-xs uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            Shift availability <span style={{ color: "#D01C00" }}>*</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {(
              [
                { field: "morningShift"  as const, label: "Morning shift", sub: "4:00am – 12:00pm", val: watchMorning },
                { field: "afternoonShift" as const, label: "Afternoon shift", sub: "12:00pm – 11:00pm", val: watchAfternoon },
              ]
            ).map(({ field, label, sub, val }) => (
              <button
                key={field}
                type="button"
                onClick={() => setValue(field, !val, { shouldValidate: true })}
                className="flex-1 flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                style={{
                  background: val ? "rgba(208,28,0,0.12)" : "rgba(255,255,255,0.03)",
                  border:     val ? "1.5px solid rgba(208,28,0,0.4)" : "1.5px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: val ? "#D01C00" : "rgba(255,255,255,0.06)", border: val ? "none" : "1px solid rgba(255,255,255,0.15)" }}
                >
                  {val && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <p className="font-display font-bold text-ss-white text-sm">{label}</p>
                  <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{sub}</p>
                </div>
              </button>
            ))}
          </div>
          {shiftError && <p className="font-body text-xs mt-2" style={{ color: "#D01C00" }}>{shiftError}</p>}
        </div>

        {/* Coverage areas */}
        <div>
          <p className="font-body text-xs uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            Coverage areas <span style={{ color: "#D01C00" }}>*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {areaList.map((area) => {
              const selected = watchAreas.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArray("areas", area)}
                  className="px-3 py-1.5 rounded-full font-body text-sm transition-all"
                  style={{
                    background: selected ? "#D01C00" : "rgba(255,255,255,0.05)",
                    color:      selected ? "#fff"    : "rgba(255,255,255,0.5)",
                    border:     selected ? "none"    : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {area}
                </button>
              );
            })}
          </div>
          {errors.areas && <p className="font-body text-xs mt-2" style={{ color: "#D01C00" }}>{errors.areas.message}</p>}
        </div>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (submitState === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center py-10 px-6"
      >
        <div className="flex justify-center mb-6">
          <svg
            className="w-16 h-16"
            style={{ color: "#D01C00" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            />
          </svg>
        </div>
        <h3 className="font-display font-extrabold text-ss-white text-2xl mb-3">
          Application received! 🎉
        </h3>
        <p className="font-body text-ss-white-muted text-base mb-6 max-w-sm mx-auto" style={{ maxWidth: "none" }}>
          Our team will review your details and be in touch within 3–5 business days.
        </p>
        <div
          className="rounded-xl p-4 mb-6 text-left"
          style={{ background: "rgba(208,28,0,0.08)", border: "1px solid rgba(208,28,0,0.2)" }}
        >
          <p className="font-body text-sm mb-1 font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
            📎 One more thing — please send your documents
          </p>
          <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            WhatsApp your licence copy, PDP, and vehicle photos to us so we can fast-track your application.
          </p>
        </div>
        <a
          href={`https://wa.me/${CONTACT.whatsapp.replace(/\s/g, "")}?text=Hi!+I+just+submitted+my+driver+application+on+the+St·Surfers+site.+Here+are+my+documents:`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold text-sm text-white uppercase tracking-widest"
          style={{ background: "#25D366" }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Send docs on WhatsApp
        </a>
      </motion.div>
    );
  }

  // ── Main form render ──────────────────────────────────────────────────────
  return (
    <div id="apply-form" className="rounded-2xl overflow-hidden" style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="p-6 sm:p-8">
        <ProgressBar />

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 font-body text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"; }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={submitState === "loading"}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold text-sm text-white uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{ background: "#D01C00" }}
          >
            {submitState === "loading" ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </>
            ) : step < 5 ? (
              <>
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              <>
                Submit Application
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Error state */}
        {submitState === "error" && (
          <p className="font-body text-sm mt-4 text-center" style={{ color: "#D01C00" }}>
            Something went wrong. Please try again or WhatsApp us at{" "}
            <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\s/g, "")}`} className="underline">{CONTACT.whatsapp}</a>
          </p>
        )}
      </div>
    </div>
  );
}
