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
  ArrowLeft, 
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
  ChevronLeft
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
}

export default function SignUpPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeId: "",
    
    // Step 2: Company & Position
    department: "",
    position: "",
    workLocation: "",
    supervisor: "",
    
    // Step 3: Account Security
    password: "",
    confirmPassword: "",
  })
  const [referenceData, setReferenceData] = useState<ReferenceData>({
    departments: [],
    positions: [],
    workLocations: []
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Mock reference data for frontend template
  useEffect(() => {
    // Frontend-only template - using mock data
    setReferenceData({
      departments: [
        { id: '1', name: 'Equipment Department', code: 'EQP' },
        { id: '2', name: 'Maintenance Department', code: 'MNT' },
        { id: '3', name: 'Operations Department', code: 'OPS' },
      ],
      positions: [
        { id: '1', title: 'Equipment Manager', department_id: '1', department_name: 'Equipment Department' },
        { id: '2', title: 'Maintenance Technician', department_id: '2', department_name: 'Maintenance Department' },
        { id: '3', title: 'Operations Coordinator', department_id: '3', department_name: 'Operations Department' },
      ],
      workLocations: [
        { id: '1', name: 'Head Office', city: 'Addis Ababa' },
        { id: '2', name: 'Branch Office', city: 'Dire Dawa' },
        { id: '3', name: 'Site Office', city: 'Hawassa' },
      ],
    })
  }, [])

  // Get positions filtered by selected department
  const getFilteredPositions = () => {
    if (!formData.department) return []
    return referenceData.positions.filter(position => 
      position.department_id === formData.department
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      ...(name === 'department' && { position: '' })
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const validateStep = (step: number): boolean => {
    setError("")
    
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          setError("Please fill in all required personal information")
          return false
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError("Please enter a valid email address")
          return false
        }
        return true
        
      case 2:
        if (!formData.department || !formData.position || !formData.workLocation) {
          setError("Please fill in all required company information")
          return false
        }
        return true
        
      case 3:
        const { strength } = checkPasswordStrength(formData.password)
        if (strength < 3) {
          setError("Please choose a stronger password")
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          return false
        }
        if (!agreedToTerms) {
          setError("Please agree to the terms and conditions")
          return false
        }
        return true
        
      default:
        return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateStep(3)) return

    setIsLoading(true)

    // Simulate API call for demo purposes
    setTimeout(() => {
      // Frontend-only template - no actual registration
      console.log('Registration attempt:', { ...formData, profileImage, agreedToTerms })
      setIsLoading(false)
      // For demo: show success message
      alert('This is a frontend template. No actual registration is performed.')
      // Uncomment below to simulate redirect
      // router.push('/sign-up/success')
    }, 1000)
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
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            step === currentStep 
              ? "bg-cyan-600 border-cyan-600 text-white" 
              : step < currentStep 
                ? "bg-green-500 border-green-500 text-white"
                : "border-muted-foreground text-muted-foreground"
          }`}>
            {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-0.5 mx-2 ${
              step < currentStep ? "bg-green-500" : "bg-muted"
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
            className="space-y-4"
          >
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-cyan-100 dark:border-cyan-900">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-cyan-600 text-white p-1 rounded-full cursor-pointer hover:bg-cyan-700 transition-colors">
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <ChevronRight className="h-4 w-4" />
                </label>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Upload profile picture</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-cyan-600" />
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-600" />
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@eec.gov.et"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="bg-background/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-cyan-600" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+251 91 234 5678"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  placeholder="EEC-2024-001"
                  value={formData.employeeId}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-background/50"
                />
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
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center gap-2">
                <Building className="h-4 w-4 text-cyan-600" />
                Department *
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleSelectChange('department', value)}
                disabled={isLoading}
                className="bg-background/50"
              >
                {referenceData.departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-cyan-600" />
                Position/Role *
              </Label>
              <Select
                value={formData.position}
                onValueChange={(value) => handleSelectChange('position', value)}
                disabled={isLoading || !formData.department}
                className="bg-background/50"
              >
                {getFilteredPositions().map((position) => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.title}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workLocation" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-600" />
                Work Location *
              </Label>
              <Select
                value={formData.workLocation}
                onValueChange={(value) => handleSelectChange('workLocation', value)}
                disabled={isLoading}
                className="bg-background/50"
              >
                {referenceData.workLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name} {location.city && `- ${location.city}`}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor/Manager</Label>
              <Input
                id="supervisor"
                name="supervisor"
                placeholder="Manager Name"
                value={formData.supervisor}
                onChange={handleChange}
                disabled={isLoading}
                className="bg-background/50"
              />
            </div>
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
                <Lock className="h-4 w-4 text-cyan-600" />
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
                  className="bg-background/50 pr-10"
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
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-cyan-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-cyan-600 hover:underline">
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
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80"
      >
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
            <ArrowLeft className="h-5 w-5" />
            <div className="flex items-center gap-3">
              <Image
                src="/ecwc png logo.png"
                alt="ECWC"
                width={64}
                height={64}
                className="h-16 w-auto object-contain"
                quality={100}
                unoptimized
                priority
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">
                  ECWC
                </span>
                <span className="text-xs text-muted-foreground font-medium">Internal Management System</span>
              </div>
            </div>
          </Link>
        </div>
      </motion.header>

      {/* Sign Up Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-br from-cyan-50/50 via-background to-background dark:from-cyan-950/20">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="w-full max-w-2xl"
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-muted/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5" />
            <CardHeader className="space-y-1 relative z-10">
              <CardTitle className="text-2xl font-bold text-center">Join EEC Management System</CardTitle>
              <CardDescription className="text-center">
                Create your account to access the internal management platform
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {renderStepIndicator()}
              
              <form onSubmit={handleSubmit}>
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

                <div className="flex justify-between mt-8">
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
                      className="bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="bg-cyan-600 hover:bg-cyan-700 w-32" 
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
            <CardFooter className="flex flex-col space-y-4 relative z-10">
              <div className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-cyan-600 hover:underline font-medium">
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