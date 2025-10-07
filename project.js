// ============================
// PROJECT DASHBOARD MANAGEMENT
// ============================

// Store projects data in memory
let projectsData = [];
let currentProjectId = null;
let currentPage = 1;
const projectsPerPage = 10;

// Sample data structure (replace with your actual data)
const sampleProjects = [
  {
    id: 1,
    name: "Hiring Platform",
    client: "Accenture",
    progress: 45,
    teamHead: { name: "Fisto", avatar: "https://via.placeholder.com/32" },
    startDate: "07/10/2025",
    deadline: "30/10/2025",
    description: "This project aims to streamline production workflows and reduce equipment downtime in the main manufacturing unit.",
    priority: "High",
    initiatedBy: { name: "Anisha", avatar: "https://via.placeholder.com/40" },
    allocatedTeam: "Software",
    employees: [],
    tasks: [
      {
        id: 1,
        title: "Assembling motors with different parts",
        assignedBy: { name: "Dinesh", avatar: "https://via.placeholder.com/32" },
        assignedTo: { name: "Avinash", avatar: "https://via.placeholder.com/32" },
        startDate: "12-08-2025",
        endDate: "24-07-2026",
        status: "working"
      },
      {
        id: 2,
        title: "Designing user interfaces for apps",
        assignedBy: { name: "Dinesh", avatar: "https://via.placeholder.com/32" },
        assignedTo: { name: "Meera", avatar: "https://via.placeholder.com/32" },
        startDate: "15-08-2025",
        endDate: "30-09-2026",
        status: "done"
      }
    ]
  }
];

// Initialize the dashboard
function initializeProjectDashboard() {
  // Load projects from storage or use sample data
  const storedProjects = getStoredProjects();
  projectsData = storedProjects.length > 0 ? storedProjects : sampleProjects;
  
  // Render the projects list
  renderProjectsList();
  
  // Setup event listeners
  setupEventListeners();
}

// Get projects from memory storage
function getStoredProjects() {
  // Since we can't use localStorage, return empty array
  // In a real app, this would fetch from your backend
  return [];
}

// Save projects to memory
function saveProjects() {
  // Store in memory only - no localStorage
  // In a real app, this would send to your backend
  console.log('Projects saved to memory:', projectsData);
}

// ============================
// PROJECTS LIST VIEW (Image 2)
// ============================

function renderProjectsList() {
  const tbody = document.getElementById('projectsListTableBody');
  const projectCount = document.getElementById('projectCount');
  
  if (!tbody) return;
  
  // Update count
  if (projectCount) {
    projectCount.textContent = projectsData.length;
  }
  
  // Clear existing rows
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
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const paginatedProjects = projectsData.slice(startIndex, endIndex);
  
  // Render each project
  paginatedProjects.forEach(project => {
    const row = createProjectRow(project);
    tbody.appendChild(row);
  });
  
  // Update pagination
  updatePagination();
}

function createProjectRow(project) {
  const tr = document.createElement('tr');
  
  // Generate random color for project indicator
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
      <div class="progress-container">
        <div class="progress-bar-wrapper">
          <div class="progress-bar-fill" style="width: ${project.progress || 0}%"></div>
        </div>
        <span class="progress-percentage">${project.progress || 0}%</span>
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
    </td>
  `;
  
  return tr;
}

function updatePagination() {
  const totalPages = Math.ceil(projectsData.length / projectsPerPage);
  const paginationNumbers = document.getElementById('paginationNumbers');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  
  if (!paginationNumbers) return;
  
  // Clear existing page numbers
  paginationNumbers.innerHTML = '';
  
  // Create page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-number' + (i === currentPage ? ' active' : '');
    btn.textContent = i.toString().padStart(2, '0');
    btn.onclick = () => goToPage(i);
    paginationNumbers.appendChild(btn);
  }
  
  // Update prev/next buttons
  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
  }
  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages;
  }
}

function goToPage(page) {
  currentPage = page;
  renderProjectsList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================
// PROJECT DETAIL VIEW (Image 1)
// ============================

function viewProjectDetail(projectId) {
  currentProjectId = projectId;
  const project = projectsData.find(p => p.id === projectId);
  
  if (!project) {
    console.error('Project not found:', projectId);
    return;
  }
  
  // Hide projects list, show detail view
  document.getElementById('projects-list-view').style.display = 'none';
  document.getElementById('project-detail-view').style.display = 'block';
  
  // Update breadcrumb
  document.getElementById('breadcrumbProjectName').textContent = project.name;
  
  // Render project details
  renderProjectDetail(project);
}

function renderProjectDetail(project) {
  // Update stats cards
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
  
  // Update project info
  document.getElementById('projectNameTitle').textContent = project.name;
  document.getElementById('projectDescription').textContent = project.description || 'No description available.';
  document.getElementById('projectPriority').textContent = project.priority || 'Medium';
  
  // Update initiator info
  if (project.initiatedBy) {
    document.getElementById('initiatorName').textContent = project.initiatedBy.name;
    document.getElementById('initiatorAvatar').src = project.initiatedBy.avatar;
  }
  
  // Update team head info
  if (project.teamHead) {
    document.getElementById('teamHeadName').textContent = project.teamHead.name;
    document.getElementById('teamHeadAvatar').src = project.teamHead.avatar;
  }
  
  // Update dates
  document.getElementById('projectStartDate').textContent = project.startDate || 'N/A';
  document.getElementById('projectDeadlineDate').textContent = project.deadline || 'N/A';
  
  // Render tasks table
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
// TAB SWITCHING
// ============================

function setupEventListeners() {
  // Detail view tabs
  const detailTabs = document.querySelectorAll('.detail-tab');
  detailTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      switchDetailTab(tabName);
    });
  });
  
  // View toggles (Timeline/List)
  const viewToggles = document.querySelectorAll('.view-toggle-btn');
  viewToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      viewToggles.forEach(t => t.classList.remove('active'));
      toggle.classList.add('active');
    });
  });
  
  // Search functionality
  const projectSearch = document.getElementById('projectSearchInput');
  if (projectSearch) {
    projectSearch.addEventListener('input', (e) => {
      filterProjects(e.target.value);
    });
  }
  
  // Pagination buttons
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        goToPage(currentPage - 1);
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(projectsData.length / projectsPerPage);
      if (currentPage < totalPages) {
        goToPage(currentPage + 1);
      }
    });
  }
}

function switchDetailTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.detail-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    }
  });
  
  // Update tab panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  const activePanel = document.getElementById(`${tabName}-panel`);
  if (activePanel) {
    activePanel.classList.add('active');
  }
}

// ============================
// SEARCH AND FILTER
// ============================

function filterProjects(searchTerm) {
  const filtered = projectsData.filter(project => {
    return project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (project.client && project.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (project.teamHead?.name && project.teamHead.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });
  
  // Temporarily replace projectsData for rendering
  const originalData = [...projectsData];
  projectsData = filtered;
  currentPage = 1;
  renderProjectsList();
  projectsData = originalData;
}


// ============================
// ADD NEW PROJECT
// ============================

function openProjectForm() {
  const modal = document.getElementById('addProjectModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

function closeProjectForm() {
  const modal = document.getElementById('addProjectModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Handle project form submission
function handleProjectFormSubmit(formData) {
  const newProject = {
    id: projectsData.length + 1,
    name: formData.projectName,
    client: formData.customerId,
    progress: 0,
    teamHead: { name: formData.reportingPerson, avatar: 'https://via.placeholder.com/32' },
    startDate: formatDate(formData.date),
    deadline: formatDate(formData.deadline),
    description: formData.specification,
    priority: 'Medium',
    initiatedBy: { name: 'Current User', avatar: 'https://via.placeholder.com/40' },
    allocatedTeam: formData.allocatedTeam,
    employees: [],
    tasks: []
  };
  
  projectsData.push(newProject);
  saveProjects();
  renderProjectsList();
  closeProjectForm();
  
  showToast('Project created successfully!', 'success');
}

// ============================
// TASK ALLOCATION MODAL FUNCTIONS
// ============================

// Function to open Task Allocation Modal
function openTaskAllocationForm() {
  const modal = document.getElementById('addTaskAllocationModal');
  const form = document.getElementById('TaskAllocationForm');
  
  if (modal) {
    modal.style.display = 'block';
    
    // Reset form if it exists
    if (form) {
      form.reset();
    }
    
    // If we're in a project detail view, pre-fill project info
    if (currentProjectId) {
      const project = projectsData.find(p => p.id === currentProjectId);
      if (project) {
        // You can pre-fill any project-specific information here
        console.log('Adding task to project:', project.name);
      }
    }
  }
}

// Function to close Task Allocation Modal
function closeTaskAllocationForm() {
  console.log('closeTaskAllocationForm called');
  const modal = document.getElementById('addTaskAllocationModal');
  if (modal) {
    modal.style.display = 'none';
    console.log('Modal hidden');
    
    // Reset the form
    const form = document.getElementById('TaskAllocationForm');
    if (form) {
      form.reset();
    }
  } else {
    console.error('Modal element not found');
  }
}

// ============================
// FORM SUBMISSION HANDLERS
// ============================

document.addEventListener('DOMContentLoaded', function() {
  
  // Handle Task Allocation Form Submission
  
  if (taskForm) {
    taskForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate form
      if (!taskForm.checkValidity()) {
        taskForm.reportValidity();
        return;
      }
      
      // Collect form data
      const formData = {
        id: Date.now(), // Generate unique ID
        title: document.getElementById('taskTitle').value.trim(),
        assignedBy: {
          name: document.getElementById('taskAssignedBy').value.trim(),
          avatar: 'https://via.placeholder.com/32'
        },
        assignedTo: {
          name: document.getElementById('taskAssignedTo').value,
          avatar: 'https://via.placeholder.com/32'
        },
        startDate: formatDate(document.getElementById('taskStartDate').value),
        endDate: formatDate(document.getElementById('taskEndDate').value),
        status: document.getElementById('taskStatus').value,
        description: document.getElementById('taskDescription').value.trim()
      };
      
      console.log('Task Allocation Data:', formData);
      
      // If we're in a project detail view, add task to that project
      if (currentProjectId) {
        const project = projectsData.find(p => p.id === currentProjectId);
        if (project) {
          if (!project.tasks) {
            project.tasks = [];
          }
          project.tasks.push(formData);
          
          // Save and re-render
          saveProjects();
          renderProjectDetail(project);
          
          showToast('Task added successfully!', 'success');
        }
      } else {
        showToast('Task created successfully!', 'success');
      }
      
      // Close modal and reset form
      closeTaskAllocationForm();
    });
  }
});

// ============================
// PROJECT ALLOCATION MODAL FUNCTIONS
// ============================

// Function to open Project Allocation Modal
function openProjectAllocationForm() {
  const modal = document.getElementById('addProjectAllocationModal');
  
  if (!modal) {
    console.error('Project Allocation Modal not found');
    showToast('Modal not found. Please check the HTML structure.', 'error');
    return;
  }
  
  if (!currentProjectId) {
    showToast('No project selected', 'error');
    return;
  }
  
  const project = projectsData.find(p => p.id === currentProjectId);
  if (!project) {
    showToast('Project not found', 'error');
    return;
  }
  
  // Show the modal
  modal.style.display = 'block';
  
  // Pre-fill project information
  const allocProjectName = document.getElementById('allocProjectName');
  const allocStartDate = document.getElementById('allocStartDate');
  const allocDeadline = document.getElementById('allocDeadline');
  const allocProjectDescription = document.getElementById('allocProjectDescription');
  
  if (allocProjectName) allocProjectName.value = project.name;
  if (allocStartDate) allocStartDate.value = project.startDate ? convertDateFormat(project.startDate) : '';
  if (allocDeadline) allocDeadline.value = project.deadline ? convertDateFormat(project.deadline) : '';
  if (allocProjectDescription) allocProjectDescription.value = project.description || '';
}

// Function to close Project Allocation Modal
function closeProjectAllocationForm() {
  const modal = document.getElementById('addProjectAllocationModal');
  if (modal) {
    modal.style.display = 'none';
    
    // Reset the form
    const form = document.getElementById('allocationForm');
    if (form) {
      form.reset();
    }
  }
}

// Handle Project Allocation Form Submission
function handleProjectAllocationSubmit(e) {
  e.preventDefault();
  
  if (!currentProjectId) {
    showToast('No project selected', 'error');
    return;
  }
  
  const project = projectsData.find(p => p.id === currentProjectId);
  if (!project) {
    showToast('Project not found', 'error');
    return;
  }
  
  // Collect form data
  const employeeName = document.getElementById('allocAssignedTo')?.value;
  const startDate = document.getElementById('allocStartDate')?.value;
  const deadline = document.getElementById('allocDeadline')?.value;
  const remarks = document.getElementById('allocRemarks')?.value;
  
  if (!employeeName) {
    showToast('Please select an employee', 'error');
    return;
  }
  
  // Add employee to project
  if (!project.employees) {
    project.employees = [];
  }
  
  const newEmployee = {
    name: employeeName,
    avatar: 'https://via.placeholder.com/40',
    startDate: startDate ? formatDate(startDate) : project.startDate,
    deadline: deadline ? formatDate(deadline) : project.deadline,
    remarks: remarks || ''
  };
  
  project.employees.push(newEmployee);
  
  // Save and refresh
  saveProjects();
  renderProjectDetail(project);
  closeProjectAllocationForm();
  
  showToast('Employee allocated successfully!', 'success');
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

function showToast(message, type = 'success') {
  const container = document.getElementById('projectToastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================
// INITIALIZE ON PAGE LOAD
// ============================

document.addEventListener('DOMContentLoaded', () => {
  initializeProjectDashboard();
});

// Export functions for use in other files
window.viewProjectDetail = viewProjectDetail;
window.showProjectsList = showProjectsList;
window.openProjectForm = openProjectForm;
window.closeProjectForm = closeProjectForm;