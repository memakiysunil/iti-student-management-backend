// ============================================================
// Mahila ITI Surendranagar - Frontend Auth JS
// Backend: Node.js + Express | Routes: /user/*
// ============================================================

// Backend API base — Hosted on Render (production)
const API_BASE = "https://iti-student-management-backend.onrender.com/user";

// ---- HELPER: Show alert ----
function showAlert(id, msg, type = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove("show"), 6000);
}

// ---- HELPER: Button loading state ----
function setLoading(btnId, isLoading, defaultText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = isLoading;
  btn.innerHTML = isLoading
    ? `<span class="spinner"></span> Please wait...`
    : defaultText;
}

// ---- HELPER: Field error highlight ----
function setFieldError(id, hasError) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("field-error", hasError);
}

// ---- HELPER: Get saved token ----
function getToken() {
  return localStorage.getItem("iti_token");
}

// ---- HELPER: Fetch user profile from backend ----
async function fetchProfile(token) {
  const res = await fetch(`${API_BASE}/getprofile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
  return data.user; // { _id, fullName, email, trade, enrollmentNo, role, ... }
}

// ============================================================
// LOGIN FUNCTION
// Backend: POST /user/login
// Response: { success: true, token }
// NOTE: Login does NOT return user data — must call getprofile
// ============================================================
async function loginUser() {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  setFieldError("loginEmail", false);
  setFieldError("loginPassword", false);

  if (!email || !password) {
    showAlert("loginAlert", "⚠️ Please enter both email and password.", "error");
    if (!email)    setFieldError("loginEmail", true);
    if (!password) setFieldError("loginPassword", true);
    return;
  }

  setLoading("loginBtn", true, "Login to Portal");

  try {
    // Step 1: Login — get token
    const loginRes = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      showAlert("loginAlert", `❌ ${loginData.message}`, "error");
      return;
    }

    const token = loginData.token;

    // Step 2: Get profile using the token (backend login doesn't return user data)
    const user = await fetchProfile(token);

    // Step 3: Save to localStorage
    localStorage.setItem("iti_token", token);
    localStorage.setItem("iti_user", JSON.stringify({
      id:           user._id,
      fullName:     user.fullName,
      email:        user.email,
      trade:        user.trade,
      enrollmentNo: user.enrollmentNo || null,
      role:         user.role || "student",
    }));

    showAlert("loginSuccess", "✅ Login successful! Redirecting...", "success");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 1200);

  } catch (error) {
    showAlert("loginAlert", "❌ Cannot connect to server. Please try again after some time.", "error");
  } finally {
    setLoading("loginBtn", false, "Login to Portal");
  }
}

// ============================================================
// REGISTER FUNCTION
// Backend: POST /user/register
// Response: { success: true, newuser: {...}, token }
// ============================================================
async function registerUser() {
  const fullName      = document.getElementById("signupName").value.trim();
  const email         = document.getElementById("signupEmail").value.trim();
  const trade         = document.getElementById("signupTrade").value;
  const enrollmentNo  = document.getElementById("signupEnroll").value.trim();
  const password      = document.getElementById("signupPassword").value.trim();
  const confirmPass   = document.getElementById("signupConfirm").value.trim();

  // Clear old errors
  ["signupName","signupEmail","signupTrade","signupEnroll","signupPassword","signupConfirm"]
    .forEach(id => setFieldError(id, false));

  // Validate
  if (!fullName || !email || !trade || !password) {
    showAlert("signupAlert", "⚠️ Please fill all required fields (marked with *).", "error");
    if (!fullName)  setFieldError("signupName", true);
    if (!email)     setFieldError("signupEmail", true);
    if (!trade)     setFieldError("signupTrade", true);
    if (!password)  setFieldError("signupPassword", true);
    return;
  }

  if (password.length < 6) {
    showAlert("signupAlert", "⚠️ Password must be at least 6 characters.", "error");
    setFieldError("signupPassword", true);
    return;
  }

  if (password !== confirmPass) {
    showAlert("signupAlert", "⚠️ Passwords do not match!", "error");
    setFieldError("signupConfirm", true);
    return;
  }

  setLoading("signupBtn", true, "Create Account");

  try {
    // Build body — only include enrollmentNo if it's not empty
    const body = { fullName, email, password, trade };
    if (enrollmentNo) body.enrollmentNo = enrollmentNo;

    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      // Backend returns { success: false, message: "..." }
      showAlert("signupAlert", `❌ ${data.message}`, "error");

      // Highlight specific field based on error message
      const msg = (data.message || "").toLowerCase();
      if (msg.includes("email"))      setFieldError("signupEmail", true);
      if (msg.includes("enrollment")) setFieldError("signupEnroll", true);
      return;
    }

    // data.newuser contains the registered user object
    const user = data.newuser;
    const token = data.token;

    localStorage.setItem("iti_token", token);
    localStorage.setItem("iti_user", JSON.stringify({
      id:           user._id,
      fullName:     user.fullName,
      email:        user.email,
      trade:        user.trade,
      enrollmentNo: user.enrollmentNo || null,
      role:         user.role || "student",
    }));

    showAlert("signupSuccess", "✅ Registration successful! Redirecting to dashboard...", "success");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);

  } catch (error) {
    showAlert("signupAlert", "❌ Cannot connect to server. Please try again after some time.", "error");
  } finally {
    setLoading("signupBtn", false, "Create Account");
  }
}

// ============================================================
// LOGOUT
// ============================================================
function logoutUser() {
  if (window.confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("iti_token");
    localStorage.removeItem("iti_user");
    window.location.href = "login.html";
  }
}

// ============================================================
// UPDATE PASSWORD (Dashboard feature)
// Backend: PUT /user/updatePassword (Protected)
// ============================================================
async function updatePassword() {
  const currentPassword = document.getElementById("currentPassword")?.value.trim();
  const newPassword     = document.getElementById("newPassword")?.value.trim();
  const confirmNew      = document.getElementById("confirmNewPassword")?.value.trim();
  const alertEl   = document.getElementById("pwdAlert");
  const successEl = document.getElementById("pwdSuccess");

  if (!currentPassword || !newPassword) {
    if (alertEl) { alertEl.textContent = "⚠️ Please fill all password fields."; alertEl.style.display = "block"; }
    return;
  }
  if (newPassword.length < 6) {
    if (alertEl) { alertEl.textContent = "⚠️ New password must be at least 6 characters."; alertEl.style.display = "block"; }
    return;
  }
  if (newPassword !== confirmNew) {
    if (alertEl) { alertEl.textContent = "⚠️ New passwords do not match!"; alertEl.style.display = "block"; }
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/updatePassword`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (alertEl) { alertEl.textContent = `❌ ${data.message}`; alertEl.style.display = "block"; }
      if (successEl) successEl.style.display = "none";
      return;
    }

    if (alertEl) alertEl.style.display = "none";
    if (successEl) { successEl.textContent = "✅ Password updated successfully!"; successEl.style.display = "block"; }
    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmNewPassword").value = "";
    setTimeout(() => { if (successEl) successEl.style.display = "none"; }, 5000);

  } catch (err) {
    if (alertEl) { alertEl.textContent = "❌ Server error. Please try again."; alertEl.style.display = "block"; }
  }
}

// ---- Enter key support ----
document.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  if (document.getElementById("loginBtn"))  loginUser();
  if (document.getElementById("signupBtn")) registerUser();
});

// ============================================================
// ADMIN PANEL - LOAD ALL USERS
// ============================================================

async function loadAdminUsers() {

  const tableBody = document.getElementById("adminUsersTable");

  if (!tableBody) return;

  try {

    const res = await fetch(`${API_BASE}/getalluser`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
    });

    const data = await res.json();

    console.log(data);

    if (!res.ok) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="padding:15px;text-align:center;color:red;">
            Failed to load users
          </td>
        </tr>
      `;
      return;
    }

    if (!data.users || data.users.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="padding:15px;text-align:center;">
            No users found
          </td>
        </tr>
      `;
      return;
    }

    window._adminUsers = data.users;
    const countEl = document.getElementById('adminUserCount');
    if(countEl) countEl.textContent = `Total: ${data.users.length} students`;

    tableBody.innerHTML = data.users.map((user, i) => `
      <tr>
        <td style="padding:12px;border:1px solid #ddd;">
          ${i + 1}
        </td>

        <td style="padding:12px;border:1px solid #ddd;">
          ${user.fullName}
        </td>

        <td style="padding:12px;border:1px solid #ddd;">
          ${user.email}
        </td>

        <td style="padding:12px;border:1px solid #ddd;">
          ${user.trade || "-"}
        </td>

        <td style="padding:12px;border:1px solid #ddd;">
          ${user.enrollmentNo || "-"}
        </td>
      </tr>
    `).join("");

  } catch (error) {

    console.log(error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="padding:15px;text-align:center;color:red;">
          Server Error
        </td>
      </tr>
    `;
  }
}

// ============================================================
// ADMIN PANEL - SEARCH / FILTER TABLE
// ============================================================
function filterAdminTable() {
  const query = (document.getElementById('adminSearchInput')?.value || '').toLowerCase();
  const users = window._adminUsers || [];
  const tbody = document.getElementById('adminUsersTable');
  if (!tbody) return;

  const filtered = users.filter(u =>
    (u.fullName || '').toLowerCase().includes(query) ||
    (u.email || '').toLowerCase().includes(query) ||
    (u.trade || '').toLowerCase().includes(query) ||
    (u.enrollmentNo || '').toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="padding:15px;text-align:center;">No matching students found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((u, i) => `
    <tr>
      <td style="padding:12px;border:1px solid #ddd;">${i + 1}</td>
      <td style="padding:12px;border:1px solid #ddd;">${u.fullName}</td>
      <td style="padding:12px;border:1px solid #ddd;">${u.email}</td>
      <td style="padding:12px;border:1px solid #ddd;">${u.trade || '-'}</td>
      <td style="padding:12px;border:1px solid #ddd;">${u.enrollmentNo || '-'}</td>
    </tr>
  `).join('');
}

// ============================================================
// ADMIN PANEL - EXPORT TO EXCEL
// ============================================================
function exportToExcel() {
  const users = window._adminUsers || [];
  if (users.length === 0) {
    alert('No student data to export!');
    return;
  }

  const rows = users.map((u, i) => ({
    'Sr No': i + 1,
    'Full Name': u.fullName || '',
    'Email': u.email || '',
    'Trade': u.trade || '-',
    'Enrollment No': u.enrollmentNo || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 30 },
    { wch: 25 },
    { wch: 18 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  XLSX.writeFile(wb, `ITI_Students_${new Date().toISOString().slice(0,10)}.xlsx`);
}