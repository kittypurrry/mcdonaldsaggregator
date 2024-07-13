type Job = {
  company: Company
  position: string
  type: "full-time" | "contract" | "part-time" | string,
  datePosted: Date
  department: string,
}