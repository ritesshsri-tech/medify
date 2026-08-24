export function getEnquiries() {
  return JSON.parse(localStorage.getItem('medicalTourismEnquiries') || '[]');
}

function saveEnquiries(list) {
  localStorage.setItem('medicalTourismEnquiries', JSON.stringify(list));
}

export function addEnquiry({ name, phone, email, country, treatment, preferredDates, message, submittedBy }) {
  const list = getEnquiries();
  const entry = {
    id: 'MT' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 900 + 100),
    name,
    phone,
    email,
    country,
    treatment,
    preferredDates: preferredDates || null,
    message: message || null,
    status: 'new',
    submittedBy: submittedBy || null,
    submittedAt: new Date().toISOString(),
  };
  list.unshift(entry);
  saveEnquiries(list);
  return entry;
}

export function getEnquiriesForUser(phone) {
  return getEnquiries().filter((e) => e.submittedBy === phone);
}

export function setEnquiryStatus(id, status) {
  const list = getEnquiries();
  const entry = list.find((e) => e.id === id);
  if (!entry) return;
  entry.status = status;
  saveEnquiries(list);
}
