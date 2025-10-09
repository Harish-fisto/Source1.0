// ============================
// ENHANCED PROJECT DASHBOARD WITH CLIENT INTEGRATION
// ============================

let projectsData = [];
let clientsData = []; // Store onboarded clients
let currentProjectId = null;
let currentPage = 1;
const projectsPerPage = 10;

// ============================
// INITIALIZATION
// ============================

function initializeProjectDashboard() {
  console.log('🚀 Initializing Project Dashboard...');
  
  // Load clients first, then projects
  loadOnboardedClients()
    .then(() => {
      console.log('✅ Clients loaded, now loading projects...');
      return loadProjects();
    })
    .then(() => {
      renderProjectsList();
      setupEventListeners();
      console.log('✅ Project Dashboard initialized successfully');
    })
    .catch(err => {
      console.error('❌ Error initializing dashboard:', err);
    });
}

// ============================
// FETCH ONBOARDED CLIENTS
// ============================

async function loadOnboardedClients() {
  try {
    console.log('📡 Fetching clients from API...');
    
    const response = await fetch('https://www.fist-o.com/web_crm/fetch_clients.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📦 API Response:', result);

    if (result.status === 'success') {
      // Filter only onboarded clients
      clientsData = result.data
        .filter(client => {
          const status = client.status ? client.status.toLowerCase() : '';
          return status === 'onboard';
        })
        .map(client => ({
          id: client.id,
          customerId: client.customer_id,
          companyName: client.company_name,
          customerName: client.customer_name,
          phoneNo: client.phone_number || 'N/A',
          mailId: client.mail_id || 'N/A',
          address: client.address || 'N/A',
          industryType: client.industry_type || 'N/A',
          website: client.website || 'N/A',
          contactPerson: client.contact_person || 'N/A',
          designation: client.designation || 'N/A'
        }));
      
      console.log(`✅ Loaded ${clientsData.length} onboarded clients:`, clientsData);
      populateClientDropdown();
      return clientsData;
    } else {
      console.warn('⚠️ No clients returned or status not success');
      return [];
    }
  } catch (err) {
    console.error('❌ Error loading clients:', err);
    showToast('Failed to load clients: ' + err.message, 'error');
    return [];
  }
}

// ============================
// POPULATE CLIENT DROPDOWN
// ============================

function populateClientDropdown() {
  const clientSelect = document.getElementById('customerId'); // Changed from 'customerId'
  
  if (!clientSelect) {
    console.error('❌ Project Customer ID dropdown not found!');
    return;
  }

  console.log('🔄 Populating dropdown with', clientsData.length, 'clients');

  // Clear existing options except the first placeholder
  clientSelect.innerHTML = '<option value="">-- Select Customer --</option>';
  
  if (clientsData.length === 0) {
    const noDataOption = document.createElement('option');
    noDataOption.value = '';
    noDataOption.textContent = '-- No onboarded clients available --';
    noDataOption.disabled = true;
    clientSelect.appendChild(noDataOption);
    console.warn('⚠️ No clients to populate in dropdown');
    return;
  }

  clientsData.forEach((client, index) => {
    const option = document.createElement('option');
    option.value = client.customerId;
    option.textContent = `${client.customerId} - ${client.customerName}`;
    
    // Store all client data in dataset for auto-fill
    option.dataset.companyName = client.companyName;
    option.dataset.customerName = client.customerName;
    option.dataset.phone = client.phoneNo;
    option.dataset.email = client.mailId;
    option.dataset.contactPerson = client.contactPerson;
    option.dataset.designation = client.designation;
    option.dataset.industry = client.industryType;
    option.dataset.website = client.website;
    option.dataset.address = client.address;
    
    clientSelect.appendChild(option);
    
    if (index === 0) {
      console.log('📝 Sample option data:', {
        value: option.value,
        text: option.textContent,
        dataset: option.dataset
      });
    }
  });
  
  console.log(`✅ Dropdown populated with ${clientsData.length} clients`);
}

// ============================
// AUTO-FILL CONTACT DETAILS ON CLIENT SELECTION
// ============================

function handleClientSelection() {
  const clientSelect = document.getElementById('customerId'); // Changed from 'customerId'
  
  if (!clientSelect) {
    console.error('❌ Project Customer ID dropdown not found');
    return;
  }

  const selectedValue = clientSelect.value;
  
  if (!selectedValue) {
    console.log('🔄 No client selected, clearing fields');
    clearContactFields();
    return;
  }

  const selectedOption = clientSelect.options[clientSelect.selectedIndex];
  console.log('👤 Client selected:', {
    customerId: selectedValue,
    customerName: selectedOption.dataset.customerName,
    contactPerson: selectedOption.dataset.contactPerson,
    phone: selectedOption.dataset.phone,
    email: selectedOption.dataset.email,
    designation: selectedOption.dataset.designation
  });
  
  // Auto-fill contact details
  const fields = {
    contactPerson: selectedOption.dataset.contactPerson || '',
    contactNumber: selectedOption.dataset.phone || '',
    contactEmail: selectedOption.dataset.email || '',
    contactDesignation: selectedOption.dataset.designation || ''
  };

  Object.keys(fields).forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.value = fields[fieldId];
      element.style.backgroundColor = '#f0f0f0'; // Visual feedback
      element.readOnly = true;
      console.log(`✅ Set ${fieldId} = ${fields[fieldId]}`);
    } else {
      console.warn(`⚠️ Field ${fieldId} not found in DOM`);
    }
  });
  
  showToast(`Contact details loaded for ${selectedOption.dataset.customerName}`, 'success');
}

function clearContactFields() {
  const fields = ['contactPerson', 'contactNumber', 'contactEmail', 'contactDesignation'];
  
  fields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.value = '';
      element.style.backgroundColor = '';
      element.readOnly = false;
    }
  });
  
  console.log('🧹 Contact fields cleared');
}

// ============================
// LOAD PROJECTS
// ============================

async function loadProjects() {
  try {
    const response = await fetch('https://www.fist-o.com/web_crm/fetch_projects.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      projectsData = result.data.map(proj => ({
        id: proj.id,
        name: proj.project_name,
        client: proj.company_name,
        customerId: proj.customer_id,
        customerName: proj.customer_name,
        teamHead: { 
          name: proj.team_head || 'N/A', 
          avatar: 'https://via.placeholder.com/32' 
        },
        startDate: formatDate(proj.start_date),
        deadline: formatDate(proj.deadline),
        description: proj.project_description || 'N/A',
        priority: proj.priority || 'Medium',
        allocatedTeam: proj.allocated_team || 'N/A',
        initiatedBy: { 
          name: proj.initiated_by || 'N/A', 
          avatar: 'https://via.placeholder.com/40' 
        },
        employees: proj.employees || [],
        tasks: proj.tasks || []
      }));
      
      console.log(`✅ Loaded ${projectsData.length} projects`);
      renderProjectsList();
    }
  } catch (err) {
    console.error('❌ Error loading projects:', err);
    projectsData = [];
  }
}

// ============================
// PROJECTS LIST VIEW
// ============================

function renderProjectsList() {
  const tbody = document.getElementById('projectsListTableBody');
  const projectCount = document.getElementById('projectCount');
  
  if (!tbody) return;
  
  if (projectCount) {
    projectCount.textContent = projectsData.length;
  }
  
  tbody.innerHTML = '';
  
  if (projectsData.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="6">
          <div class="empty-content">
            <i class="fas fa-project-diagram"></i>
            <p>No projects found</p>
            <small>Click "New Project" to get started</small>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const paginatedProjects = projectsData.slice(startIndex, endIndex);
  
  paginatedProjects.forEach(project => {
    const row = createProjectRow(project);
    tbody.appendChild(row);
  });
  
  updatePagination();
}

function createProjectRow(project) {
  const tr = document.createElement('tr');
  const colors = ['#4169E1', '#DC143C', '#9ACD32', '#FF6347', '#8B4513'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  tr.innerHTML = `
    <td>
      <div class="project-name-cell">
        <div class="project-color-indicator" style="background: ${randomColor};"></div>
        <div class="project-info-cell">
          <span class="project-title">${project.name}</span>
          <span class="project-client">${project.client || 'N/A'}</span>
        </div>
      </div>
    </td>
    <td>
      <div class="team-head-cell">
        <img src="${project.teamHead?.avatar || 'https://via.placeholder.com/32'}" 
             alt="${project.teamHead?.name || 'N/A'}" 
             class="team-head-avatar">
        <span class="team-head-name">${project.teamHead?.name || 'N/A'}</span>
      </div>
    </td>
    <td class="date-cell">${project.startDate || 'N/A'}</td>
    <td class="date-cell">${project.deadline || 'N/A'}</td>
    <td>
      <button class="view-btn" onclick="viewProjectDetail(${project.id})">View</button>
      <button class="delete-btn" onclick="deleteProject(${project.id})">Delete</button>
    </td>
  `;
  
  return tr;
}

// ============================
// PROJECT DETAIL VIEW
// ============================

function viewProjectDetail(projectId) {
  currentProjectId = projectId;
  const project = projectsData.find(p => p.id === projectId);
  
  if (!project) {
    console.error('Project not found:', projectId);
    return;
  }
  
  document.getElementById('projects-list-view').style.display = 'none';
  document.getElementById('project-detail-view').style.display = 'block';
  
  document.getElementById('breadcrumbProjectName').textContent = project.name;
  renderProjectDetail(project);
}

function renderProjectDetail(project) {
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'done').length || 0;
  const ongoingTasks = project.tasks?.filter(t => t.status === 'working').length || 0;
  const assignedEmployees = new Set(project.tasks?.map(t => t.assignedTo?.name)).size || 0;
  
  document.getElementById('assignedEmployeesCount').textContent = assignedEmployees;
  document.getElementById('totalTasksCount').textContent = totalTasks;
  document.getElementById('completedTasksCount').textContent = completedTasks;
  document.getElementById('ongoingTasksCount').textContent = ongoingTasks;
  document.getElementById('delayedTasksCount').textContent = '0';
  document.getElementById('overdueTasksCount').textContent = '0';
  
  document.getElementById('projectNameTitle').textContent = project.name;
  document.getElementById('projectDescription').textContent = project.description || 'No description available.';
  document.getElementById('projectPriority').textContent = project.priority || 'Medium';
  
  if (project.initiatedBy) {
    document.getElementById('initiatorName').textContent = project.initiatedBy.name;
    document.getElementById('initiatorAvatar').src = project.initiatedBy.avatar;
  }
  
  if (project.teamHead) {
    document.getElementById('teamHeadName').textContent = project.teamHead.name;
    document.getElementById('teamHeadAvatar').src = project.teamHead.avatar;
  }
  
  document.getElementById('projectStartDate').textContent = project.startDate || 'N/A';
  document.getElementById('projectDeadlineDate').textContent = project.deadline || 'N/A';
  
  renderProjectTasks(project.tasks || []);
}

function renderProjectTasks(tasks) {
  const tbody = document.getElementById('projectTasksTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (tasks.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="7">
          <div class="empty-content">
            <i class="fas fa-tasks"></i>
            <p>No tasks found</p>
            <small>Click "Add Task" to get started</small>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tasks.forEach((task, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${task.title}</td>
      <td>
        <div class="task-assignee">
          <img src="${task.assignedBy?.avatar || 'https://via.placeholder.com/32'}" 
               alt="${task.assignedBy?.name || 'N/A'}" 
               class="task-assignee-avatar">
          <span class="task-assignee-name">${task.assignedBy?.name || 'N/A'}</span>
        </div>
      </td>
      <td>
        <div class="task-assignee">
          <img src="${task.assignedTo?.avatar || 'https://via.placeholder.com/32'}" 
               alt="${task.assignedTo?.name || 'N/A'}" 
               class="task-assignee-avatar">
          <span class="task-assignee-name">${task.assignedTo?.name || 'N/A'}</span>
        </div>
      </td>
      <td>${task.startDate || 'N/A'}</td>
      <td>${task.endDate || 'N/A'}</td>
      <td>
        <span class="status-badge ${task.status || 'pending'}">
          ${getStatusText(task.status)}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function getStatusText(status) {
  const statusMap = {
    'done': 'Done',
    'working': 'Working on it',
    'stuck': 'Stuck',
    'pending': 'Pending'
  };
  return statusMap[status] || 'Pending';
}

function showProjectsList() {
  document.getElementById('project-detail-view').style.display = 'none';
  document.getElementById('projects-list-view').style.display = 'block';
  currentProjectId = null;
}

// ============================
// ADD NEW PROJECT
// ============================

function openProjectForm() {
  console.log('📝 Opening project form...');
  
  const modal = document.getElementById('addProjectModal');
  if (modal) {
    modal.style.display = 'block';
    
    const form = document.getElementById('projectForm');
    if (form) form.reset();
    
    clearContactFields();
    
    // Re-populate dropdown in case it was cleared
    if (clientsData.length > 0) {
      populateClientDropdown();
    } else {
      console.warn('⚠️ No clients data available, attempting to reload...');
      loadOnboardedClients();
    }
  }
}

function closeProjectForm() {
  const modal = document.getElementById('addProjectModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function handleProjectFormSubmit(e) {
  e.preventDefault();
  
  const customerId = document.getElementById('customerId')?.value; // Changed from 'customerId'
  if (!customerId) {
    showToast('Please select a client', 'error');
    return;
  }
  
  const client = clientsData.find(c => c.customerId === customerId);
  
  const projectData = {
    customer_id: customerId,
    company_name: client?.companyName || '',
    customer_name: client?.customerName || '',
    project_name: document.getElementById('projectName')?.value,
    project_description: document.getElementById('specification')?.value,
    contact_person: document.getElementById('contactPerson')?.value,
    contact_number: document.getElementById('contactNumber')?.value,
    contact_email: document.getElementById('contactEmail')?.value,
    contact_designation: document.getElementById('contactDesignation')?.value,
    start_date: document.getElementById('date')?.value,
    deadline: document.getElementById('deadline')?.value,
    team_head: document.getElementById('reportingPerson')?.value,
    allocated_team: document.getElementById('allocatedTeam')?.value,
    remarks: document.getElementById('projectremarks')?.value
  };
  
  console.log('📤 Submitting project data:', projectData);
  
  try {
    const response = await fetch('https://www.fist-o.com/web_crm/create_project.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      await loadProjects();
      closeProjectForm();
      showToast('Project created successfully!', 'success');
    } else {
      showToast(result.message || 'Failed to create project', 'error');
    }
  } catch (err) {
    showToast('Network error while creating project', 'error');
    console.error('Error:', err);
  }
}

// ============================
// EVENT LISTENERS
// ============================

function setupEventListeners() {
  console.log('🔗 Setting up event listeners...');
  
  // Client selection change - AUTO-FILL TRIGGER
  const clientSelect = document.getElementById('customerId'); // Changed from 'customerId'
  if (clientSelect) {
    // Remove any existing listeners
    clientSelect.removeEventListener('change', handleClientSelection);
    // Add new listener
    clientSelect.addEventListener('change', handleClientSelection);
    console.log('✅ Client selection listener attached');
  } else {
    console.warn('⚠️ Project Customer ID dropdown not found during setup');
  }
  
  // Project form submission
  const projectForm = document.getElementById('projectForm');
  if (projectForm) {
    projectForm.removeEventListener('submit', handleProjectFormSubmit);
    projectForm.addEventListener('submit', handleProjectFormSubmit);
    console.log('✅ Project form submission listener attached');
  }
  
  // Detail view tabs
  const detailTabs = document.querySelectorAll('.detail-tab');
  detailTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      switchDetailTab(tabName);
    });
  });
  
  // Search functionality
  const projectSearch = document.getElementById('projectSearchInput');
  if (projectSearch) {
    projectSearch.addEventListener('input', (e) => {
      filterProjects(e.target.value);
    });
  }
  
  // Pagination
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) goToPage(currentPage - 1);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(projectsData.length / projectsPerPage);
      if (currentPage < totalPages) goToPage(currentPage + 1);
    });
  }
  
  console.log('✅ Event listeners setup complete');
}

// ============================
// UTILITY FUNCTIONS
// ============================

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function updatePagination() {
  const totalPages = Math.ceil(projectsData.length / projectsPerPage);
  const paginationNumbers = document.getElementById('paginationNumbers');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  
  if (!paginationNumbers) return;
  
  paginationNumbers.innerHTML = '';
  
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-number' + (i === currentPage ? ' active' : '');
    btn.textContent = i.toString().padStart(2, '0');
    btn.onclick = () => goToPage(i);
    paginationNumbers.appendChild(btn);
  }
  
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

function goToPage(page) {
  currentPage = page;
  renderProjectsList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchDetailTab(tabName) {
  document.querySelectorAll('.detail-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    }
  });
  
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  const activePanel = document.getElementById(`${tabName}-panel`);
  if (activePanel) activePanel.classList.add('active');
}

function filterProjects(searchTerm) {
  const filtered = projectsData.filter(project => {
    return project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (project.client && project.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (project.teamHead?.name && project.teamHead.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });
  
  const originalData = [...projectsData];
  projectsData = filtered;
  currentPage = 1;
  renderProjectsList();
  projectsData = originalData;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('projectToastContainer') || document.getElementById('toastContainer');
  if (!container) {
    console.log('📢 Toast:', message);
    return;
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function openTaskAllocationForm() {
  const modal = document.getElementById('addTaskAllocationModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

function closeTaskAllocationForm() {
  const modal = document.getElementById('addTaskAllocationModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// ============================
// INITIALIZE ON PAGE LOAD
// ============================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎬 DOM Content Loaded - Starting initialization');
  initializeProjectDashboard();
});

// ============================
// EXPORT FUNCTIONS FOR GLOBAL ACCESS
// ============================

window.viewProjectDetail = viewProjectDetail;
window.showProjectsList = showProjectsList;
window.openProjectForm = openProjectForm;
window.closeProjectForm = closeProjectForm;
window.openTaskAllocationForm = openTaskAllocationForm;
window.closeTaskAllocationForm = closeTaskAllocationForm;
window.handleClientSelection = handleClientSelection;
window.loadOnboardedClients = loadOnboardedClients;