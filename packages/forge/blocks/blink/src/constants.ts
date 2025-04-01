export const usersFilterTypes = ["User ID", "Employee ID"] as const;

export const responseDataLabels = {
  email: "Emails",
  company_name: "Company Names",
  first_name: "First Names",
  second_name: "Second Names",
  display_name: "Display Names",
  initials: "Initials",
  job_title: "Job Titles",
  profile_photo_id: "Profile Photo IDs",
  timezone: "Timezones",
  manager_id: "Manager IDs",
  department_name: "Department Names",
  account_status: "Account Statuses",
  id: "User IDs",
  employee_id: "Employee IDs",
} as const;

export const baseUrl = "https://api.joinblink.com/v2";
