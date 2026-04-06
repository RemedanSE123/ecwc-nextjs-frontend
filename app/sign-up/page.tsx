"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectItem,
} from "@/components/ui/select"
import { SearchableCombobox } from "@/components/ui/searchable-combobox"
import Image from "next/image"
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Badge,
  Home,
  Fingerprint,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  fetchDepartments,
  fetchPositions,
  fetchProjectsForLocation,
  fetchSupervisors,
  fetchWorkLocations,
  registerAuth,
  uploadUserImage,
} from "@/lib/api/auth"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 },
}

const stepVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}

function needsSupervisorField(locationName: string | undefined): boolean {
  const n = (locationName || "").trim().toLowerCase()
  if (n === "head office") return false
  return n.includes("kality") || n.includes("project site")
}

/** Only actual project / site offices (e.g. Project Site) — not Kality Central Garage. */
function needsProjectLocationField(locationName: string | undefined): boolean {
  const n = (locationName || "").trim().toLowerCase()
  return n.includes("project site")
}

function normalizeTitleForCompare(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/\s+/g, " ")
}

/** Kality work sites (seed may be "Kality" or "Kality Central Garage"); not Project Site. */
function isKalitySiteExcludingProjectSite(locationName: string | undefined): boolean {
  const n = (locationName || "").trim().toLowerCase()
  if (n.includes("project site")) return false
  return n.includes("kality")
}

/** PEM and equivalent heads (maintenance, etc.) at Kality — no separate line manager on sign-up. */
function isPlantEquipmentManagerTitle(jobTitle: string | undefined): boolean {
  const n = normalizeTitleForCompare(jobTitle || "")
  if (!n) return false
  return n === "plant and equipment manager"
}

/** Line manager omitted for Plant & Equipment Manager at any Kality site (not Project Site). */
function supervisorRequiredForSignup(
  locationName: string | undefined,
  jobTitle: string | undefined,
): boolean {
  if (!needsSupervisorField(locationName)) return false
  if (isKalitySiteExcludingProjectSite(locationName) && isPlantEquipmentManagerTitle(jobTitle)) return false
  return true
}

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 6,
    letter: /[A-Za-z]/.test(password),
    number: /[0-9]/.test(password),
  }
}

function passwordMeetsRules(password: string): boolean {
  const c = getPasswordChecks(password)
  return c.length && c.letter && c.number
}

/** Sign-up is restricted to Gmail addresses (domain must be exactly gmail.com). */
function isValidGmailEmail(email: string): boolean {
  const t = email.trim().toLowerCase()
  if (!t) return false
  const parts = t.split("@")
  if (parts.length !== 2) return false
  const [local, domain] = parts
  return local.length > 0 && domain === "gmail.com"
}

interface Department {
  id: string
  name: string
  code: string
}

interface Position {
  id: string
  title: string
  department_id: string
  department_name: string
}

interface WorkLocation {
  id: string
  name: string
  city: string
}

interface ReferenceData {
  departments: Department[]
  positions: Position[]
  workLocations: WorkLocation[]
  projects: { id: string; name: string }[]
  supervisors: {
    id: string
    full_name: string
    job_title?: string | null
    department_name?: string | null
    work_location_name?: string | null
  }[]
}

const TOTAL_STEPS = 3

export default function SignUpPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "",
    position: "",
    workLocation: "",
    projectLocation: "",
    supervisorId: "",
    jobTitle: "",
    password: "",
    confirmPassword: "",
  })
  const [referenceData, setReferenceData] = useState<ReferenceData>({
    departments: [],
    positions: [],
    workLocations: [],
    projects: [],
    supervisors: [],
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [agreedToDevelopmentNotice, setAgreedToDevelopmentNotice] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [supervisorsLoading, setSupervisorsLoading] = useState(false)
  const [departmentsLoading, setDepartmentsLoading] = useState(false)
  const [positionsLoading, setPositionsLoading] = useState(false)

  useEffect(() => {
    document.documentElement.classList.remove("dark")
  }, [])

  useEffect(() => {
    Promise.allSettled([fetchWorkLocations(), fetchProjectsForLocation()]).then((results) => {
      const [wlRes, projRes] = results
      const workLocations = wlRes.status === "fulfilled" ? wlRes.value : []
      const projects = projRes.status === "fulfilled" ? projRes.value : []
      setReferenceData((prev) => ({
        ...prev,
        workLocations: workLocations.map((w) => ({
          id: w.id,
          name: w.name,
          city: "",
        })),
        projects: projects.map((p) => ({ id: p.id, name: p.project_name })),
      }))
    })
  }, [])

  useEffect(() => {
    if (!formData.workLocation) {
      setDepartmentsLoading(false)
      setReferenceData((prev) => ({ ...prev, departments: [], positions: [] }))
      return
    }
    let cancelled = false
    setDepartmentsLoading(true)
    fetchDepartments(formData.workLocation)
      .then((departments) => {
        if (cancelled) return
        setReferenceData((prev) => ({
          ...prev,
          departments: departments.map((d) => ({
            id: d.id,
            name: d.name,
            code: d.name.slice(0, 3).toUpperCase(),
          })),
        }))
        setDepartmentsLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setReferenceData((prev) => ({ ...prev, departments: [], positions: [] }))
        setDepartmentsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [formData.workLocation])

  useEffect(() => {
    if (!formData.department) {
      setPositionsLoading(false)
      setReferenceData((prev) => ({ ...prev, positions: [] }))
      return
    }
    let cancelled = false
    setPositionsLoading(true)
    fetchPositions(formData.department)
      .then((positions) => {
        if (cancelled) return
        setReferenceData((prev) => ({
          ...prev,
          positions: positions.map((p) => ({
            id: p.id,
            title: p.title,
            department_id: p.department_id,
            department_name: p.department_name,
          })),
        }))
        setPositionsLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setReferenceData((prev) => ({ ...prev, positions: [] }))
        setPositionsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [formData.department])

  const selectedWorkLocationName = referenceData.workLocations.find(
    (l) => l.id === formData.workLocation
  )?.name
  const supervisorFieldRequired = supervisorRequiredForSignup(
    selectedWorkLocationName,
    formData.jobTitle,
  )
  const projectFieldRequired = needsProjectLocationField(selectedWorkLocationName)
  const passwordChecks = useMemo(() => getPasswordChecks(formData.password), [formData.password])

  /** Line manager picker: show name + job title only (not department / location). */
  function supervisorRowLabel(s: ReferenceData["supervisors"][number]): string {
    const name = (s.full_name || "").trim()
    const job = (s.job_title || "").trim()
    if (job) return `${name} — ${job}`
    return name
  }

  const supervisorComboboxOptions = useMemo(
    () =>
      referenceData.supervisors.map((s) => ({
        value: s.id,
        label: supervisorRowLabel(s),
      })),
    [referenceData.supervisors],
  )

  const step1Complete = useMemo(
    () =>
      !!profileImageFile &&
      formData.fullName.trim().length > 0 &&
      isValidGmailEmail(formData.email) &&
      /^\d{9}$/.test(formData.phone),
    [profileImageFile, formData.fullName, formData.email, formData.phone],
  )

  const step2Complete = useMemo(() => {
    if (!formData.workLocation || !formData.department || !formData.employeeId.trim()) return false
    if (!formData.position || !formData.jobTitle.trim()) return false
    if (supervisorFieldRequired) {
      if (!formData.supervisorId) return false
    }
    if (projectFieldRequired && !formData.projectLocation) return false
    return true
  }, [
    formData.workLocation,
    formData.department,
    formData.employeeId,
    formData.position,
    formData.jobTitle,
    formData.supervisorId,
    formData.projectLocation,
    supervisorFieldRequired,
    projectFieldRequired,
  ])

  const step3Complete = useMemo(
    () =>
      passwordMeetsRules(formData.password) &&
      formData.confirmPassword.length > 0 &&
      formData.password === formData.confirmPassword &&
      agreedToDevelopmentNotice,
    [formData.password, formData.confirmPassword, agreedToDevelopmentNotice],
  )

  useEffect(() => {
    if (!supervisorFieldRequired) {
      setSupervisorsLoading(false)
      setReferenceData((prev) => ({ ...prev, supervisors: [] }))
      return
    }

    let cancelled = false
    setSupervisorsLoading(true)

    const load = async () => {
      try {
        const list = await fetchSupervisors(undefined, undefined, {
          includeAllRegistered: true,
        })
        const merged = new Map<string, ReferenceData["supervisors"][number]>()
        for (const s of list) {
          merged.set(s.id, {
            id: s.id,
            full_name: s.full_name,
            job_title: s.job_title,
            department_name: s.department_name ?? null,
            work_location_name: s.work_location_name ?? null,
          })
        }
        const supervisors = Array.from(merged.values()).sort((a, b) =>
          a.full_name.localeCompare(b.full_name),
        )
        if (!cancelled) {
          setReferenceData((prev) => ({ ...prev, supervisors }))
          setSupervisorsLoading(false)
        }
      } catch {
        if (!cancelled) {
          setReferenceData((prev) => ({ ...prev, supervisors: [] }))
          setSupervisorsLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [supervisorFieldRequired])

  useEffect(() => {
    if (!supervisorFieldRequired && formData.supervisorId) {
      setFormData((prev) => ({ ...prev, supervisorId: "" }))
    }
  }, [supervisorFieldRequired, formData.supervisorId])

  const getFilteredPositions = () => {
    if (!formData.department) return referenceData.positions
    return referenceData.positions.filter((p) => p.department_id === formData.department)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "phone") {
      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 9)
      setFormData((prev) => ({ ...prev, phone: digitsOnly }))
      return
    }
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      if (name === "department") {
        next.position = ""
        next.jobTitle = ""
        next.supervisorId = ""
      }
      if (name === "workLocation") {
        next.department = ""
        next.position = ""
        next.jobTitle = ""
        next.supervisorId = ""
        next.projectLocation = ""
      }
      return next
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setProfileImage(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateStep = (step: number): boolean => {
    setError("")
    switch (step) {
      case 1: {
        if (!profileImageFile) {
          setError("Please upload a profile picture.")
          return false
        }
        if (!formData.fullName.trim()) {
          setError("Full name is required.")
          return false
        }
        if (!formData.email.trim()) {
          setError("Email is required.")
          return false
        }
        if (!isValidGmailEmail(formData.email)) {
          setError("Please use a Gmail address (must end with @gmail.com).")
          return false
        }
        if (!/^\d{9}$/.test(formData.phone)) {
          setError("Phone number must be exactly 9 digits after +251.")
          return false
        }
        return true
      }
      case 2: {
        if (!formData.workLocation) {
          setError("Work location is required.")
          return false
        }
        if (!formData.department) {
          setError("Department is required.")
          return false
        }
        if (!formData.employeeId.trim()) {
          setError("Employee ID is required.")
          return false
        }
        if (!formData.position || !formData.jobTitle.trim()) {
          setError("Job title is required.")
          return false
        }
        if (supervisorFieldRequired) {
          if (!formData.supervisorId) {
            setError("Line manager / supervisor is required for this work location.")
            return false
          }
        }
        if (projectFieldRequired) {
          if (!formData.projectLocation) {
            setError("Project location is required for this work location.")
            return false
          }
        }
        return true
      }
      case 3: {
        if (!passwordMeetsRules(formData.password)) {
          setError("Password must be at least 6 characters and include at least one letter and one number.")
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.")
          return false
        }
        if (!agreedToDevelopmentNotice) {
          setError("Please acknowledge the development / hard copy evidence notice.")
          return false
        }
        return true
      }
      default:
        return true
    }
  }

  const nextStep = () => {
    if (!validateStep(currentStep)) return
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  }

  const prevStep = () => {
    setError("")
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (currentStep !== TOTAL_STEPS) return
    if (!validateStep(TOTAL_STEPS)) return

    setIsLoading(true)
    setError("")

    try {
      const selectedPosition = referenceData.positions.find((p) => p.id === formData.position)
      const backendPhone = formData.phone ? `0${formData.phone}` : ""
      let profileImagePath: string | undefined
      if (profileImageFile) {
        const uploaded = await uploadUserImage(profileImageFile)
        profileImagePath = uploaded.path
      }
      await registerAuth({
        full_name: formData.fullName,
        email: formData.email,
        phone: backendPhone,
        profile_image: profileImagePath,
        employee_id: formData.employeeId.trim(),
        department_id: selectedPosition?.department_id || formData.department,
        position_id: formData.position,
        work_location_id: formData.workLocation,
        site_location: projectFieldRequired
          ? referenceData.projects.find((p) => p.id === formData.projectLocation)?.name
          : undefined,
        supervisor_id: supervisorFieldRequired ? formData.supervisorId : undefined,
        job_title: formData.jobTitle || selectedPosition?.title || "",
        password: formData.password,
        agreed_to_terms: agreedToDevelopmentNotice,
      })
      setShowSuccessModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-4">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex items-center justify-center w-5 h-5 rounded-full border text-xs ${
              step === currentStep
                ? "bg-[#70c82a] border-[#70c82a] text-white"
                : step < currentStep
                  ? "bg-[#70c82a] border-[#70c82a] text-white"
                  : "border-muted-foreground text-muted-foreground"
            }`}
          >
            {step < currentStep ? <CheckCircle className="h-2.5 w-2.5" /> : step}
          </div>
          {step < 3 && (
            <div
              className={`w-6 h-0.5 mx-1 ${
                step < currentStep ? "bg-[#70c82a]" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-3"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 items-start">
              <div className="flex flex-col items-center lg:items-center w-full lg:max-w-xs lg:pl-8">
                <div className="relative mb-4">
                  <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-[#70c82a]/20 shadow-lg">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-muted-foreground" style={{ width: "4.5rem", height: "4.5rem" }} />
                    )}
                  </div>
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 bg-[#70c82a] text-white p-2.5 rounded-full cursor-pointer hover:bg-[#5aa022] transition-colors shadow-lg z-10"
                  >
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <ChevronRight className="h-5 w-5" />
                  </label>
                </div>
                <div className="text-center space-y-1 w-full">
                  <p className="text-lg font-semibold text-foreground">Upload Profile Picture *</p>
                </div>
              </div>

              <div className="space-y-2.5 w-full">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-[#70c82a]" />
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-background/50 h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-[#70c82a]" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-background/50 h-9 text-sm"
                  />
                 
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-[#70c82a]" />
                    Phone Number *
                  </Label>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center px-3 h-9 bg-muted border border-r-0 rounded-l-md text-sm font-medium text-foreground">
                      +251
                    </div>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="9XXXXXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      inputMode="numeric"
                      pattern="\d{9}"
                      maxLength={9}
                      disabled={isLoading}
                      className="bg-background/50 h-9 text-sm rounded-l-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-[#70c82a]" />
                  Work Location *
                </Label>
                <Select
                  value={formData.workLocation}
                  onValueChange={(value) => handleSelectChange("workLocation", value)}
                  disabled={isLoading}
                  className="bg-background/50 h-9 text-sm"
                >
                  {referenceData.workLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} {location.city && `- ${location.city}`}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-3.5 w-3.5 text-[#70c82a]" />
                  Department *
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange("department", value)}
                  disabled={isLoading || !formData.workLocation || departmentsLoading}
                  className="bg-background/50 h-9 text-sm"
                >
                  {referenceData.departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="employeeId" className="flex items-center gap-2 text-sm">
                  <Badge className="h-3.5 w-3.5 text-[#70c82a]" />
                  Employee ID *
                </Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  placeholder="ECWC-2024-001"
                  value={formData.employeeId}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-background/50 h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Job Title *</Label>
                <Select
                  value={formData.jobTitle}
                  onValueChange={(value) => {
                    const selected = referenceData.positions.find(
                      (p) =>
                        p.title === value &&
                        (!formData.department || p.department_id === formData.department)
                    )
                    setFormData((prev) => ({
                      ...prev,
                      jobTitle: value,
                      supervisorId: "",
                      position: selected?.id ?? "",
                    }))
                  }}
                  disabled={isLoading || !formData.department || positionsLoading}
                  className="bg-background/50 h-9 text-sm"
                >
                  {getFilteredPositions().map((position) => (
                    <SelectItem key={position.id} value={position.title}>
                      {position.title}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {(supervisorFieldRequired || projectFieldRequired) && (
              <div
                className={`grid gap-4 ${
                  supervisorFieldRequired && projectFieldRequired
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {supervisorFieldRequired && (
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-supervisor" className="text-sm">
                      Line Manager / Supervisor *
                    </Label>
                   
                    <SearchableCombobox
                      id="signup-supervisor"
                      value={formData.supervisorId}
                      onChange={(id) => handleSelectChange("supervisorId", id)}
                      options={supervisorComboboxOptions}
                      placeholder="Search name or job title…"
                      loading={supervisorsLoading}
                      disabled={isLoading || !formData.workLocation}
                      required
                    />
                  </div>
                )}

                {projectFieldRequired && (
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-[#70c82a]" />
                      Project Location *
                    </Label>
                    <Select
                      value={formData.projectLocation}
                      onValueChange={(value) => handleSelectChange("projectLocation", value)}
                      disabled={isLoading}
                      className="bg-background/50 h-9 text-sm"
                    >
                      {referenceData.projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="password" className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#70c82a]" />
                  Password *
                </span>
                <span className="text-xs font-normal text-muted-foreground">All three rules are required.</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters, letters and numbers"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-background/50 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <div className="mt-1.5 rounded-md border border-dashed border-[#70c82a]/25 bg-gradient-to-r from-muted/40 via-muted/20 to-transparent px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-3 w-3 shrink-0 text-[#70c82a]/80" aria-hidden />
                  <div className="flex h-1 min-w-0 flex-1 gap-px overflow-hidden rounded-full bg-muted/80">
                    {(
                      [
                        ["length", passwordChecks.length],
                        ["letter", passwordChecks.letter],
                        ["number", passwordChecks.number],
                      ] as const
                    ).map(([key, ok]) => (
                      <div key={key} className="h-full min-w-0 flex-1 bg-muted-foreground/10">
                        <div
                          className="h-full bg-[#70c82a] transition-[width] duration-500 ease-out"
                          style={{ width: ok ? "100%" : "0%" }}
                        />
                      </div>
                    ))}
                  </div>
                  <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {[passwordChecks.length, passwordChecks.letter, passwordChecks.number].filter(Boolean).length}
                    /3
                  </span>
                </div>
                <p className="mt-1 text-[9px] leading-tight text-muted-foreground sm:text-[10px]">
                  <span className={passwordChecks.length ? "font-medium text-[#70c82a]" : ""}>6+ chars</span>
                  <span className="mx-1 text-border/80">·</span>
                  <span className={passwordChecks.letter ? "font-medium text-[#70c82a]" : ""}>A–Z</span>
                  <span className="mx-1 text-border/80">·</span>
                  <span className={passwordChecks.number ? "font-medium text-[#70c82a]" : ""}>0–9</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-background/50 pr-10 h-9 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {formData.confirmPassword.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs flex items-center gap-1.5 font-medium ${
                    formData.password === formData.confirmPassword
                      ? "text-[#70c82a]"
                      : "text-destructive"
                  }`}
                >
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 shrink-0" />
                      Passwords do not match
                    </>
                  )}
                </motion.div>
              )}
            </div>

            <div className="flex items-start space-x-2 rounded-md border border-border/50 bg-muted/20 px-2 py-2 pt-1">
              <Checkbox
                id="devnotice"
                checked={agreedToDevelopmentNotice}
                onChange={(e) => setAgreedToDevelopmentNotice(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="devnotice" className="text-sm text-muted-foreground leading-snug">
                I understand this system is under development until it is fully finished. Anything I record here
                must be backed by{" "}
                <span className="font-medium text-foreground">hard-copy evidence</span> until the system is
                complete. *
              </label>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/#overview"
          scroll={true}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/80 border border-[#70c82a]/20 hover:border-[#70c82a] hover:bg-[#70c82a]/5 transition-all backdrop-blur-sm"
        >
          <Home className="h-4 w-4 text-[#70c82a]" />
          <span className="text-sm font-medium text-foreground">Back to Home</span>
        </Link>
      </div>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 18 }}
              className="w-full max-w-md rounded-2xl border border-[#70c82a]/30 bg-card p-8 shadow-2xl text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#70c82a]/15"
              >
                <CheckCircle className="h-10 w-10 text-[#70c82a]" />
              </motion.div>
              <h2 className="text-xl font-semibold text-foreground">Registration Submitted</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                  Your account has been successfully created. Access to the system will remain disabled until your request
                  is reviewed and approved by an administrator. You will receive an email notification once your access
                  has been activated. After approval, you may sign in using your registered email and password.
                  </p>
              <Button
                className="w-full bg-[#70c82a] hover:bg-[#5aa022] text-white"
                onClick={() => router.push("/sign-in")}
              >
                Go to sign in
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#70c82a]/5 via-background to-background overflow-y-auto">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className={`w-full transition-all duration-300 ${
            currentStep >= 3 ? "max-w-xl" : "max-w-3xl"
          }`}
        >
          <Card className="shadow-2xl bg-gradient-to-br from-background/95 via-background/90 to-muted/30 relative overflow-visible border border-[#70c82a]/20 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#70c82a]/10 via-[#70c82a]/5 to-[#5aa022]/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#70c82a]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#5aa022]/5 rounded-full blur-3xl" />
            <CardHeader className="space-y-2 relative z-10 pb-3 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex justify-center md:justify-start">
                  <Link href="/#overview" className="relative cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="absolute inset-0 bg-[#70c82a]/10 rounded-full blur-xl" />
                    <Image
                      src="/ecwc png logo.png"
                      alt="ECWC Logo"
                      width={70}
                      height={70}
                      className="h-14 w-auto object-contain relative z-10 drop-shadow-lg"
                      quality={100}
                      unoptimized
                      priority
                    />
                  </Link>
                </div>

                <div className="text-center md:text-left space-y-3 relative overflow-visible">
                  <div className="space-y-2 overflow-visible">
                    <CardTitle className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#70c82a] via-[#5aa022] to-[#70c82a] bg-clip-text text-transparent pb-2 leading-tight">
                      Sign Up
                    </CardTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                      Create your account to access the PEMS
                    </p>
                  </div>
                  <div className="relative mt-2">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#70c82a] via-[#5aa022] to-[#70c82a]" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 py-2 pb-3">
              {renderStepIndicator()}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4"
                  >
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

                <div className="flex justify-between mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isLoading}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {currentStep < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={
                        isLoading ||
                        (currentStep === 1 && !step1Complete) ||
                        (currentStep === 2 && !step2Complete)
                      }
                      className="bg-[#70c82a] hover:bg-[#5aa022] text-white flex items-center gap-2 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-[#70c82a] hover:bg-[#5aa022] text-white min-w-[8rem] disabled:opacity-50"
                      disabled={isLoading || !step3Complete}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 relative z-10 pt-4 pb-8 mb-2">
              <div className="text-sm text-muted-foreground text-center leading-normal">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-[#70c82a] hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
