// ===============================
// Healio - Professional Healthcare Platform
// ===============================

const defaultHospitals = [
  {
    name: "Apollo Health Institute",
    services: ["fever", "cold", "diabetes", "lab test", "scan", "emergency", "cardiology"],
    distance: 2.5,
    rating: 4.9,
    address: "Main Road, City Center",
    phone: "+1-555-0101"
  },
  {
    name: "Skin Future Clinic",
    services: ["skin", "skin rash", "allergy", "acne", "dermatology"],
    distance: 4.2,
    rating: 4.8,
    address: "City Center Mall",
    phone: "+1-555-0102"
  },
  {
    name: "Dental Excellence",
    services: ["dental", "tooth pain", "root canal", "orthodontics", "implants"],
    distance: 3.1,
    rating: 4.7,
    address: "Market Street",
    phone: "+1-555-0103"
  },
  {
    name: "Mother Care Center",
    services: ["pregnancy", "gynecology", "delivery", "obstetrics", "fertility"],
    distance: 5.0,
    rating: 4.9,
    address: "Lake Road, Health District",
    phone: "+1-555-0104"
  }
];

function getStoredHospitals() {
  return JSON.parse(localStorage.getItem('hospitals')) || [];
}

function saveStoredHospitals(list) {
  localStorage.setItem('hospitals', JSON.stringify(list));
}

function setStoredCurrentHospital(hospital) {
  localStorage.setItem('currentHospital', JSON.stringify(hospital));
}

function getStoredCurrentHospital() {
  return JSON.parse(localStorage.getItem('currentHospital')) || null;
}

function getAllHospitals() {
  const stored = getStoredHospitals();
  const merged = [...defaultHospitals];
  stored.forEach(storedHospital => {
    const existing = merged.find(h => h.name.toLowerCase() === storedHospital.name.toLowerCase());
    if(existing) {
      Object.assign(existing, storedHospital);
    } else {
      merged.push(storedHospital);
    }
  });
  return merged;
}

function openModal(id) {
  document.getElementById(id).classList.add('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

function patientLogin() {
  const name = document.getElementById("pname").value.trim();
  const email = document.getElementById("pemail").value.trim();
  const password = document.getElementById("ppassword").value.trim();

  if(!name || !email || !password) {
    alert("All fields are required");
    return;
  }

  localStorage.setItem("patient", name);
  localStorage.setItem("patientEmail", email);

  document.getElementById("publicArea").style.display = "none";
  document.getElementById("patientDashboard").classList.remove("hidden");
  document.getElementById("hospitalDashboard").classList.add("hidden");

  document.getElementById("welcomePatient").innerText = `Welcome, ${name}`;
  loadPatientData();
  closeModal("patientModal");
}

function hospitalLogin() {
  const name = document.getElementById("hname").value.trim();
  const email = document.getElementById("hemail").value.trim();
  const password = document.getElementById("hpassword").value.trim();
  let services = (document.getElementById("hservices").value || "").split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const address = document.getElementById("haddress").value.trim();
  const distance = parseFloat(document.getElementById("hdistance").value);

  if(!name || !email || !password) {
    alert("Hospital name, email, and password are required");
    return;
  }

  if(!services.length) {
    services = ["general"];
  }

  const hospital = {
    name,
    email,
    services,
    address: address || "Not specified",
    distance: Number.isFinite(distance) ? distance : 0,
    rating: 4.6,
    phone: ""
  };

  const stored = getStoredHospitals();
  const existingIndex = stored.findIndex(h => h.name.toLowerCase() === name.toLowerCase());
  if(existingIndex >= 0) {
    stored[existingIndex] = hospital;
  } else {
    stored.push(hospital);
  }
  saveStoredHospitals(stored);
  setStoredCurrentHospital(hospital);
  localStorage.setItem("hospital", name);
  localStorage.setItem("hospitalEmail", email);

  document.getElementById("publicArea").style.display = "none";
  document.getElementById("hospitalDashboard").classList.remove("hidden");
  document.getElementById("patientDashboard").classList.add("hidden");

  loadHospitalData();
  closeModal("hospitalModal");
}

function logout() {
  localStorage.removeItem('patient');
  localStorage.removeItem('hospital');
  localStorage.removeItem('patientEmail');
  localStorage.removeItem('hospitalEmail');
  localStorage.removeItem('currentHospital');
  location.reload();
}

function loadPatientData() {
  const name = localStorage.getItem('patient');
  loadPatientAppointments(name);
  loadMedicalRecords(name);
}

function loadPatientAppointments(patientName) {
  const allAppointments = JSON.parse(localStorage.getItem("appointments")) || [];
  const patientAppointments = allAppointments.filter(a => a.patient.toLowerCase() === patientName.toLowerCase());

  let html = '<h3><i class="fas fa-calendar-check"></i> My Appointments</h3>';
  
  if(patientAppointments.length === 0) {
    html += '<p class="empty-state">No appointments scheduled</p>';
  } else {
    patientAppointments.forEach(a => {
      html += `
        <div class="appointment-item">
          <p><b>Hospital:</b> ${a.hospital}</p>
          <p><b>Date:</b> ${a.date} at ${a.time}</p>
          <p><b>Problem:</b> ${a.problem}</p>
          <p><b>Status:</b> <span style="color: #1e90ff;">${a.status || 'Confirmed'}</span></p>
          <p><b>Appointment Code:</b> ${a.code}</p>
        </div>
      `;
    });
  }

  document.getElementById("meetingBox").innerHTML = html;
}

function loadMedicalRecords(patientName) {
  const allRecords = JSON.parse(localStorage.getItem("medicalRecords")) || [];
  const patientRecords = allRecords.filter(r => r.patient.toLowerCase() === patientName.toLowerCase());

  let html = '';
  if(patientRecords.length === 0) {
    html = '<p class="empty-state">No medical records available</p>';
  } else {
    patientRecords.forEach(r => {
      html += `
        <div class="appointment-item">
          <p><b>Hospital:</b> ${r.hospital}</p>
          <p><b>Date:</b> ${r.date}</p>
          <p><b>Type:</b> ${r.type}</p>
          <p><b>Details:</b> ${r.details}</p>
        </div>
      `;
    });
  }

  document.getElementById("medicalRecords").innerHTML = html;
}

function searchHospital() {
  const searchText = document.getElementById("searchInput").value.toLowerCase().trim();
  const allHospitals = getAllHospitals();

  let filtered = allHospitals.filter(h =>
    h.services.some(s => s.includes(searchText)) || searchText === ""
  );

  filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));

  let html = '';
  filtered.forEach(h => {
    html += `
      <div class="result">
        <h3>${h.name}</h3>
        <p><i class="fas fa-map-marker-alt"></i> <b>Location:</b> ${h.address}</p>
        <p><i class="fas fa-road"></i> <b>Distance:</b> ${h.distance} km</p>
        <p><i class="fas fa-star"></i> <b>Rating:</b> ${h.rating}/5.0</p>
        <p><i class="fas fa-phone"></i> <b>Phone:</b> ${h.phone}</p>
        <p><i class="fas fa-heartbeat"></i> <b>Services:</b> ${h.services.join(", ")}</p>
        <button class="btn btn-primary" onclick="bookAppointmentModal('${h.name}')">
          <i class="fas fa-calendar-plus"></i> Book Appointment
        </button>
      </div>
    `;
  });

  document.getElementById("results").innerHTML = html || '<div class="result"><p class="empty-state">No hospitals found</p></div>';
}

function bookAppointmentModal(hospitalName) {
  const date = prompt("Enter appointment date (YYYY-MM-DD):");
  if(!date) return;

  const time = prompt("Enter time (HH:MM):");
  if(!time) return;

  const problem = prompt("Describe your problem/reason for visit:");
  if(!problem) return;

  bookAppointment(hospitalName, date, time, problem);
}

function bookAppointment(hospital, date, time, problem) {
  const patientName = localStorage.getItem('patient');
  const code = "APT" + Math.floor(Math.random() * 9000 + 1000);

  const booking = {
    hospital,
    patient: patientName,
    date,
    time,
    problem,
    code,
    status: "Confirmed",
    createdAt: new Date().toISOString()
  };

  const all = JSON.parse(localStorage.getItem("appointments")) || [];
  all.push(booking);
  localStorage.setItem("appointments", JSON.stringify(all));

  alert(`Appointment Confirmed!\nCode: ${code}\nHospital: ${hospital}\nDate: ${date} at ${time}`);
  loadPatientAppointments(patientName);
}

function loadHospitalData() {
  const hospitalName = localStorage.getItem('hospital');
  loadHospitalAppointments(hospitalName);
  loadHospitalProfile();
}

function loadHospitalAppointments(hospitalName) {
  const allAppointments = JSON.parse(localStorage.getItem("appointments")) || [];
  const hospitalAppointments = allAppointments.filter(a => a.hospital.toLowerCase() === hospitalName.toLowerCase());

  let html = '';
  if(hospitalAppointments.length === 0) {
    html = '<p class="empty-state">No appointments</p>';
  } else {
    hospitalAppointments.forEach(a => {
      html += `
        <div class="appointment-item">
          <p><b>Patient:</b> ${a.patient}</p>
          <p><b>Date/Time:</b> ${a.date} at ${a.time}</p>
          <p><b>Problem:</b> ${a.problem}</p>
          <p><b>Code:</b> ${a.code}</p>
          <p><b>Status:</b> <span style="color: #1e90ff;">${a.status || 'Confirmed'}</span></p>
        </div>
      `;
    });
  }

  document.getElementById("hospitalAppointments").innerHTML = html;
}

function loadHospitalProfile() {
  const current = getStoredCurrentHospital() || JSON.parse(localStorage.getItem('currentHospital'));
  if(!current) {
    document.getElementById("profileHospitalName").value = localStorage.getItem('hospital') || '';
    return;
  }

  document.getElementById("welcomeHospital").innerText = `Welcome, ${current.name}`;
  document.getElementById("profileHospitalName").value = current.name;
  document.getElementById("profileHospitalEmail").value = current.email || '';
  document.getElementById("profileHospitalServices").value = (current.services || []).join(", ");
  document.getElementById("profileHospitalAddress").value = current.address || '';
  document.getElementById("profileHospitalDistance").value = current.distance || '';
  document.getElementById("profileHospitalPhone").value = current.phone || '';
}

function saveHospitalProfile() {
  const name = document.getElementById("profileHospitalName").value.trim();
  const email = document.getElementById("profileHospitalEmail").value.trim();
  const services = document.getElementById("profileHospitalServices").value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const address = document.getElementById("profileHospitalAddress").value.trim();
  const distance = parseFloat(document.getElementById("profileHospitalDistance").value);
  const phone = document.getElementById("profileHospitalPhone").value.trim();

  if(!name || services.length === 0) {
    alert('Hospital name and services are required.');
    return;
  }

  const hospital = {
    name,
    email,
    services,
    address: address || 'Not specified',
    distance: Number.isFinite(distance) ? distance : 0,
    rating: 4.6,
    phone
  };

  const stored = getStoredHospitals();
  const existingIndex = stored.findIndex(h => h.name.toLowerCase() === name.toLowerCase());
  if(existingIndex >= 0) {
    stored[existingIndex] = hospital;
  } else {
    stored.push(hospital);
  }
  saveStoredHospitals(stored);
  setStoredCurrentHospital(hospital);

  alert('Hospital profile saved successfully.');
}

function issuePrescription() {
  const patientName = document.getElementById("prescPatientName").value.trim();
  const diagnosis = document.getElementById("prescDiagnosis").value.trim();
  const medications = document.getElementById("prescMedications").value.trim();

  if(!patientName || !diagnosis || !medications) {
    alert('All fields are required.');
    return;
  }

  const hospitalName = localStorage.getItem('hospital');
  const prescription = {
    patient: patientName,
    hospital: hospitalName,
    diagnosis,
    medications,
    date: new Date().toISOString().split('T')[0],
    id: "RX" + Math.floor(Math.random() * 9000 + 1000)
  };

  const all = JSON.parse(localStorage.getItem("prescriptions")) || [];
  all.push(prescription);
  localStorage.setItem("prescriptions", JSON.stringify(all));

  document.getElementById("prescPatientName").value = '';
  document.getElementById("prescDiagnosis").value = '';
  document.getElementById("prescMedications").value = '';

  alert(`Prescription issued successfully!\nID: ${prescription.id}\nPatient: ${patientName}`);
  loadIssuedPrescriptions(hospitalName);
}

function loadIssuedPrescriptions(hospitalName) {
  const all = JSON.parse(localStorage.getItem("prescriptions")) || [];
  const hospitalPrescriptions = all.filter(p => p.hospital.toLowerCase() === hospitalName.toLowerCase());

  let html = '';
  if(hospitalPrescriptions.length === 0) {
    html = '<p class="empty-state">No prescriptions issued</p>';
  } else {
    hospitalPrescriptions.forEach(p => {
      html += `
        <div class="appointment-item">
          <p><b>Patient:</b> ${p.patient}</p>
          <p><b>Diagnosis:</b> ${p.diagnosis}</p>
          <p><b>Date:</b> ${p.date}</p>
          <p><b>ID:</b> ${p.id}</p>
        </div>
      `;
    });
  }

  document.getElementById("issuedPrescriptions").innerHTML = html;
}

function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab-btn');

  tabs.forEach(tab => tab.classList.remove('active'));
  buttons.forEach(btn => btn.classList.remove('active'));

  document.getElementById(`${tabName}-tab`).classList.add('active');
  event.target.classList.add('active');

  if(tabName === 'appointments') {
    const hospitalName = localStorage.getItem('hospital');
    loadHospitalAppointments(hospitalName);
  } else if(tabName === 'prescriptions') {
    const hospitalName = localStorage.getItem('hospital');
    loadIssuedPrescriptions(hospitalName);
  }
}

function toggleMenu() {
  const menu = document.getElementById('menu');
  if(menu.style.display === 'flex') {
    menu.style.display = 'none';
  } else {
    menu.style.display = 'flex';
  }
}

window.onload = function() {
  const patient = localStorage.getItem("patient");
  const hospital = localStorage.getItem("hospital");

  if(patient) {
    document.getElementById("publicArea").style.display = "none";
    document.getElementById("patientDashboard").classList.remove("hidden");
    document.getElementById("hospitalDashboard").classList.add("hidden");
    document.getElementById("welcomePatient").innerText = `Welcome, ${patient}`;
    loadPatientData();
  }

  if(hospital) {
    document.getElementById("publicArea").style.display = "none";
    document.getElementById("hospitalDashboard").classList.remove("hidden");
    document.getElementById("patientDashboard").classList.add("hidden");
    loadHospitalData();
  }
};



