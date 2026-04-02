"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select,
  SelectItem,
} from "@/components/ui/select"
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
  Building,
  Briefcase,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Badge,
  Home
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { fetchDepartments, fetchPositions, fetchProjectsForLocation, fetchSupervisors, fetchWorkLocations, registerAuth, uploadUserImage } from "@/lib/api/auth"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 }
}

const stepVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
}

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  
  const strength = Object.values(checks).filter(Boolean).length
  return { checks, strength }
}

// Types for our data
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
  supervisors: { id: string; full_name: string; job_title?: string | null }[]
}

export default function SignUpPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: "",
    email: "",
    phone: "",
    employeeId: "",
    
    // Step 2: Company & Position
    department: "",
    position: "",
    workLocation: "",
    projectLocation: "",
    supervisor: "",
    jobTitle: "",
    
    // Step 3: Account Security
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
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loadErrors, setLoadErrors] = useState<string[]>([])
  const [loadStatus, setLoadStatus] = useState<{ departments: number; positions: number; projects: number; workLocations: number; supervisors: number } | null>(null)

  // Always light mode on sign-up (ignore landing page theme)
  useEffect(() => {
    document.documentElement.classList.remove("dark")
  }, [])

  // Reference data
  useEffect(() => {
    Promise.allSettled([
      fetchDepartments(),
      fetchPositions(),
      fetchWorkLocations(),
      fetchProjectsForLocation(),
      fetchSupervisors(),
    ]).then((results) => {
      const [depsRes, posRes, wlRes, projRes, supRes] = results

      const errors: string[] = []
      const departments = depsRes.status === "fulfilled" ? depsRes.value : []
      const positions = posRes.status === "fulfilled" ? posRes.value : []
      const workLocations = wlRes.status === "fulfilled" ? wlRes.value : []
      const projects = projRes.status === "fulfilled" ? projRes.value : []
      const supervisors = supRes.status === "fulfilled" ? supRes.value : []
      setLoadStatus({
        departments: departments.length,
        positions: positions.length,
        projects: projects.length,
        workLocations: workLocations.length,
        supervisors: supervisors.length,
      })

      if (depsRes.status === "rejected") errors.push(`Departments: ${depsRes.reason instanceof Error ? depsRes.reason.message : "Unknown error"}`)
      if (posRes.status === "rejected") errors.push(`Positions: ${posRes.reason instanceof Error ? posRes.reason.message : "Unknown error"}`)
      if (wlRes.status === "rejected") errors.push(`Work Locations: ${wlRes.reason instanceof Error ? wlRes.reason.message : "Unknown error"}`)
      if (projRes.status === "rejected") errors.push(`Projects: ${projRes.reason instanceof Error ? projRes.reason.message : "Unknown error"}`)
      if (supRes.status === "rejected") errors.push(`Supervisors: ${supRes.reason instanceof Error ? supRes.reason.message : "Unknown error"}`)

      setLoadErrors(errors)
      setReferenceData({
        departments: departments.map((d) => ({ id: d.id, name: d.name, code: d.name.slice(0, 3).toUpperCase() })),
        positions: positions.map((p) => ({ id: p.id, title: p.title, department_id: p.department_id, department_name: p.department_name })),
        workLocations: workLocations.map((w) => ({ id: w.id, name: w.name, city: "" })),
        projects: projects.map((p) => ({ id: p.id, name: p.project_name })),
        supervisors: supervisors.map((s) => ({ id: s.id, full_name: s.full_name, job_title: s.job_title })),
      })
    })
  }, [])

  // Filter positions by selected department
  const getFilteredPositions = () => {
    if (!formData.department) return referenceData.positions
    return referenceData.positions.filter((p) => p.department_id === formData.department)
  }

  // Check if Site Office is selected
  const isSiteSelected = () => {
    const selectedLocation = referenceData.workLocations.find(loc => loc.id === formData.workLocation)
    return selectedLocation?.name === 'Site Office' || selectedLocation?.name?.toLowerCase().includes('site')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "phone") {
      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 9)
      setFormData((prev) => ({
        ...prev,
        phone: digitsOnly,
      }))
      return
    }
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset position when department changes
      ...(name === 'department' && { position: '', jobTitle: '' })
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const nextStep = () => {
    // Validation removed - no backend connection
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const validateStep = (step: number): boolean => {
    // Validation removed - no backend connection
    return true
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Only submit if we're on step 3
    if (currentStep !== 3) {
      return
    }

    setError("")

    // Validate that passwords are filled
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in both password fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!/^\d{9}$/.test(formData.phone)) {
      setError("Phone number must be exactly 9 digits after +251")
      return
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    setIsLoading(true)

    try {
      const selectedPosition = referenceData.positions.find((p) => p.id === formData.position)
      const backendPhone = formData.phone ? `0${formData.phone}` : ''
      let profileImagePath: string | undefined
      if (profileImageFile) {
        const uploaded = await uploadUserImage(profileImageFile)
        profileImagePath = uploaded.path
      }
      const resp = await registerAuth({
        full_name: formData.fullName,
        email: formData.email,
        phone: backendPhone,
        profile_image: profileImagePath,
        employee_id: formData.employeeId || undefined,
        department_id: selectedPosition?.department_id || undefined,
        position_id: formData.position || undefined,
        // Work location comes from work_locations table.
        work_location_id: formData.workLocation || undefined,
        // Project location comes from projects table and is saved as text.
        site_location: referenceData.projects.find((p) => p.id === formData.projectLocation)?.name || undefined,
        supervisor_name: formData.supervisor || undefined,
        job_title: formData.jobTitle || selectedPosition?.title || undefined,
        password: formData.password,
        agreed_to_terms: agreedToTerms,
      })
      setError(resp.message)
      setTimeout(() => router.push('/sign-in'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const { checks, strength } = checkPasswordStrength(formData.password)
  const passwordStrengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500"
  ]

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-4">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center w-5 h-5 rounded-full border text-xs ${
            step === currentStep 
              ? "bg-[#70c82a] border-[#70c82a] text-white" 
              : step < currentStep 
                ? "bg-[#70c82a] border-[#70c82a] text-white"
                : "border-muted-foreground text-muted-foreground"
          }`}>
            {step < currentStep ? <CheckCircle className="h-2.5 w-2.5" /> : step}
          </div>
          {step < 3 && (
            <div className={`w-6 h-0.5 mx-1 ${
              step < currentStep ? "bg-[#70c82a]" : "bg-muted"
            }`} />
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
              {/* Left Section - Profile Picture Upload */}
              <div className="flex flex-col items-center lg:items-center w-full lg:max-w-xs lg:pl-8">
                <div className="relative mb-4">
                  <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-[#70c82a]/20 dark:border-[#70c82a]/30 shadow-lg">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-muted-foreground" style={{ width: '4.5rem', height: '4.5rem' }} />
                    )}
                  </div>
                  <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-[#70c82a] text-white p-2.5 rounded-full cursor-pointer hover:bg-[#5aa022] transition-colors shadow-lg z-10">
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
                  <p className="text-lg font-semibold text-foreground">Upload Profile Picture</p>
                </div>
              </div>

              {/* Right Section - Form Fields */}
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
                    required
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
                    placeholder="john.doe@ecwc.gov.et"
                    value={formData.email}
                    onChange={handleChange}
                    required
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
                      required
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
            {/* Row 1: Work Location and Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="workLocation" className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-[#70c82a]" />
                  Work Location *
                </Label>
                <Select
                  value={formData.workLocation}
                  onValueChange={(value) => handleSelectChange('workLocation', value)}
                  disabled={isLoading}
                  className="bg-background/50 h-9 text-sm"
                >
                  {referenceData.workLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} {location.city && `- ${location.city}`}
                    </SelectItem>
                  ))}
                </Select>
                {referenceData.workLocations.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">No work locations found in `work_locations` table.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department" className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-3.5 w-3.5 text-[#70c82a]" />
                  Department *
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange('department', value)}
                  disabled={isLoading}
                  className="bg-background/50 h-9 text-sm"
                >
                  {referenceData.departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </Select>
                {referenceData.departments.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">No departments found in `departments` table.</p>
                )}
              </div>
            </div>

            {/* Row 2: Employee ID and Job Title/Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="employeeId" className="flex items-center gap-2 text-sm">
                  <Badge className="h-3.5 w-3.5 text-[#70c82a]" />
                  Employee ID
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
                <Label htmlFor="jobTitle" className="text-sm">Job Title</Label>
                <Select
                  value={formData.jobTitle}
                  onValueChange={(value) => {
                    handleSelectChange('jobTitle', value)
                    const selected = referenceData.positions.find((p) => p.title === value && (!formData.department || p.department_id === formData.department))
                    if (selected) handleSelectChange('position', selected.id)
                  }}
                  disabled={isLoading}
                  className="bg-background/50 h-9 text-sm"
                >
                  {getFilteredPositions().map((position) => (
                    <SelectItem key={position.id} value={position.title}>
                      {position.title}
                    </SelectItem>
                  ))}
                </Select>
                {getFilteredPositions().length === 0 && (
                  <p className="text-xs text-red-600 mt-1">No positions found for selected department.</p>
                )}
              </div>

            </div>

            {/* Row 3: Line Manager and conditional Project Location (same row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="supervisor" className="text-sm">Line Manager /Supervisor</Label>
                <Select
                  value={formData.supervisor}
                  onValueChange={(value) => handleSelectChange('supervisor', value)}
                  disabled={isLoading}
                  className="bg-background/50 h-9 text-sm"
                >
                  {referenceData.supervisors.map((s) => (
                    <SelectItem key={s.id} value={s.full_name}>
                      {s.full_name}{s.job_title ? ` - ${s.job_title}` : ""}
                    </SelectItem>
                  ))}
                </Select>
                {referenceData.supervisors.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">No supervisors found in `employees` table.</p>
                )}
              </div>

              {isSiteSelected() && (
                <div className="space-y-1.5">
                  <Label htmlFor="projectLocation" className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-[#70c82a]" />
                    Project Location *
                  </Label>
                  <Select
                    value={formData.projectLocation}
                    onValueChange={(value) => handleSelectChange('projectLocation', value)}
                    disabled={isLoading}
                    className="bg-background/50 h-9 text-sm"
                  >
                    {referenceData.projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </Select>
                  {referenceData.projects.length === 0 && (
                    <p className="text-xs text-red-600 mt-1">No projects found in `projects` table.</p>
                  )}
                </div>
              )}
            </div>
            {loadErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <div className="text-xs">
                    <div className="font-semibold mb-1">Dropdown fetch errors:</div>
                    {loadErrors.map((e, idx) => (
                      <div key={idx}>- {e}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <Alert>
              <AlertDescription>
                <div className="text-[11px] leading-5 text-muted-foreground">
                  <div><span className="font-semibold">API:</span> {process.env.NEXT_PUBLIC_API_BASE_URL || "(same origin)"}</div>
                  <div><span className="font-semibold">Rows:</span> departments={loadStatus?.departments ?? 0}, positions={loadStatus?.positions ?? 0}, workLocations={loadStatus?.workLocations ?? 0}, projects={loadStatus?.projects ?? 0}, supervisors={loadStatus?.supervisors ?? 0}</div>
                </div>
              </AlertDescription>
            </Alert>
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
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#70c82a]" />
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2 mt-3"
                >
                  <div className="flex gap-1 h-2">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          index < strength ? passwordStrengthColors[strength - 1] : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(checks).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {value ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={value ? "text-green-600" : "text-muted-foreground"}>
                          {key === "length" && "8+ characters"}
                          {key === "uppercase" && "Uppercase letter"}
                          {key === "lowercase" && "Lowercase letter"}
                          {key === "number" && "Number"}
                          {key === "special" && "Special character"}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
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
                  required
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !agreedToTerms) {
                      e.preventDefault()
                    }
                  }}
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
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-600 text-xs flex items-center gap-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  Passwords match
                </motion.p>
              )}
            </div>

            <div className="flex items-start space-x-2 pt-4">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isLoading}
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-[#70c82a] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#70c82a] hover:underline">
                  Privacy Policy
                </Link>
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
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link 
          href="/#overview" 
          scroll={true}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/80 dark:bg-zinc-900/80 border border-[#70c82a]/20 hover:border-[#70c82a] hover:bg-[#70c82a]/5 transition-all backdrop-blur-sm"
        >
          <Home className="h-4 w-4 text-[#70c82a]" />
          <span className="text-sm font-medium text-foreground">Back to Home</span>
        </Link>
      </div>

      {/* Sign Up Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#70c82a]/5 via-background to-background dark:from-[#70c82a]/10 overflow-y-auto">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className={`w-full transition-all duration-300 ${
            currentStep === 3 ? 'max-w-xl' : 'max-w-3xl'
          }`}
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-background/95 via-background/90 to-muted/30 dark:from-zinc-950/95 dark:via-zinc-950/90 dark:to-zinc-900/30 relative overflow-visible border border-[#70c82a]/20 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#70c82a]/10 via-[#70c82a]/5 to-[#5aa022]/10 dark:from-[#70c82a]/15 dark:via-[#70c82a]/10 dark:to-[#5aa022]/15" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#70c82a]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#5aa022]/5 rounded-full blur-3xl"></div>
            <CardHeader className="space-y-2 relative z-10 pb-3 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Left Section - Logo */}
                <div className="flex justify-center md:justify-start">
                  <Link href="/#overview" className="relative cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="absolute inset-0 bg-[#70c82a]/10 rounded-full blur-xl"></div>
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
                
                {/* Right Section - Title and Description */}
                <div className="text-center md:text-left space-y-3 relative overflow-visible">
                  <div className="space-y-2 overflow-visible">
                    <CardTitle className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#70c82a] via-[#5aa022] to-[#70c82a] bg-clip-text text-transparent pb-2 leading-tight overflow-visible">
                      Sign Up
                    </CardTitle>
                    {currentStep !== 3 && (
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                        Create your account to access the PEMS
                      </p>
                    )}
                  </div>
                  {/* Decorative horizontal line - left to right */}
                  <div className="relative mt-2">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#70c82a] via-[#5aa022] to-[#70c82a]"></div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 py-2 pb-3">
              {renderStepIndicator()}
              
              <form onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }} onKeyDown={(e) => {
                // Prevent form submission on Enter key
                if (e.key === 'Enter') {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}>
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

                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>

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

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-[#70c82a] hover:bg-[#5aa022] text-white flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={handleSubmit}
                      className="bg-[#70c82a] hover:bg-[#5aa022] text-white w-32" 
                      disabled={isLoading}
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