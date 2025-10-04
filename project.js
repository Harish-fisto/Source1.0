class ProjectManager {
    constructor() {
        this.projects = this.loadProjects();
        this.uploadedDocuments = [];
        this.initializeEventListeners();
        this.setDefaultDate();
        this.updateTable();
    }

    loadProjects() {
        const saved = localStorage.getItem('projects');
        return saved ? JSON.parse(saved) : [];
    }

    saveProjects() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    initializeEventListeners() {
        // Form submission
        const form = document.getElementById('projectForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Document upload handler
        const docUpload = document.getElementById('projectDocUpload');
        if (docUpload) {
            docUpload.addEventListener('change', (e) => this.handleDocumentUpload(e));
        }

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeForm();
                this.closeViewModal();
            }
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    openForm() {
        document.getElementById('addProjectModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeForm() {
        document.getElementById('addProjectModal').classList.remove('show');
        document.body.style.overflow = 'auto';
        this.resetForm();
    }

    closeViewModal() {
        const viewModal = document.getElementById('viewProjectModal');
        if (viewModal) {
            viewModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }

    resetForm() {
        const form = document.getElementById('projectForm');
        if (form) {
            form.reset();
            this.setDefaultDate();
        }
        
        // Reset custom project type field
        const customInput = document.getElementById('customProjectType');
        if (customInput) {
            customInput.style.display = 'none';
        }
        
        // Clear uploaded documents
        this.uploadedDocuments = [];
        this.clearDocumentPreviews();
    }

    handleDocumentUpload(event) {
        const files = event.target.files;
        const previewContainer = document.getElementById('projectDocPreview');
        
        if (!previewContainer) return;
        
        for (let file of files) {
            // Store file reference
            this.uploadedDocuments.push({
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            });
            
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            // Create preview based on file type
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
                previewItem.appendChild(img);
            } else {
                // For non-image files, show file icon
                const fileIcon = document.createElement('i');
                fileIcon.className = 'fas fa-file-alt';
                fileIcon.style.fontSize = '48px';
                fileIcon.style.color = '#6b7280';
                fileIcon.style.display = 'flex';
                fileIcon.style.alignItems = 'center';
                fileIcon.style.justifyContent = 'center';
                fileIcon.style.height = '70%';
                previewItem.appendChild(fileIcon);
            }
            
            // Add file name
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            previewItem.appendChild(fileName);
            
            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-preview';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => {
                const index = this.uploadedDocuments.findIndex(d => d.name === file.name);
                if (index > -1) {
                    this.uploadedDocuments.splice(index, 1);
                }
                previewItem.remove();
            };
            previewItem.appendChild(removeBtn);
            
            previewContainer.appendChild(previewItem);
        }
        
        // Reset input to allow re-uploading same file
        event.target.value = '';
    }

    clearDocumentPreviews() {
        const previewContainer = document.getElementById('projectDocPreview');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
    }

    handleFormSubmit() {
        const formData = new FormData(document.getElementById('projectForm'));
        
        // Get project type value
        let projectType = formData.get('typeOfProject');
        if (projectType === 'other') {
            projectType = formData.get('customProjectType') || 'Other';
        }

        const projectData = {
            id: Date.now().toString(),
            projectName: formData.get('projectName'),
            customerId: formData.get('customerId'),
            specification: formData.get('specification') || 'N/A',
            contactPerson: formData.get('contactPerson'),
            contactNumber: formData.get('contactNumber'),
            contactEmail: formData.get('contactEmail'),
            contactDesignation: formData.get('contactDesignation'),
            documents: this.uploadedDocuments,
            documentLink: formData.get('projectDocLink') || '',
            typeOfProject: projectType,
            allocatedTeam: formData.get('allocatedTeam'),
            reportingPerson: formData.get('reportingPerson'),
            date: formData.get('date'),
            deadline: formData.get('deadline'),
            remarks: formData.get('remarks') || '',
            createdAt: new Date().toISOString()
        };

        this.addProject(projectData);
        this.closeForm();
        this.showToast('Project Added Successfully', `${projectData.projectName} has been added to the project list.`);
        
        // Also save to clients if not exists
        this.saveClientData(projectData);
    }

    saveClientData(projectData) {
        let clients = JSON.parse(localStorage.getItem('clients') || '[]');
        
        // Check if client already exists
        const existingClient = clients.find(c => c.customerId === projectData.customerId);
        
        if (!existingClient) {
            clients.push({
                customerId: projectData.customerId,
                customerName: projectData.contactPerson,
                phoneNo: projectData.contactNumber,
                mailId: projectData.contactEmail,
                designation: projectData.contactDesignation,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('clients', JSON.stringify(clients));
        }
    }

    addProject(projectData) {
        this.projects.push(projectData);
        this.saveProjects();
        this.updateTable();
    }

    updateTable() {
        const tbody = document.getElementById('projectTableBody');
        
        if (!tbody) return;
        
        if (this.projects.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="8">
                        <div class="empty-content">
                            <i class="fas fa-project-diagram"></i>
                            <p>No projects found</p>
                            <small>Click "Add Project" to get started</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.projects.map((project, index) => `
            <tr>
                <td>${this.formatDate(project.date)}</td>
                <td>${project.projectName}</td>
                <td>${project.customerId}</td>
                <td>${project.contactNumber}</td>
                <td>
                    <span class="status-badge">${project.typeOfProject}</span>
                </td>
                <td>${this.truncateText(project.specification, 50)}</td>
                <td>
                    <button class="view-btn" onclick="projectManager.viewProject(${index})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
                <td>
                    <button class="delete-btn" onclick="projectManager.deleteProject(${index})" 
                      style="background: #ef4444; color: white; border: none; padding: 8px 12px; 
                             border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    viewProject(index) {
        const project = this.projects[index];
        if (!project) {
            console.error('Project not found at index:', index);
            return;
        }
        
        const viewContent = document.getElementById('projectViewContent');
        if (!viewContent) return;
        
        viewContent.innerHTML = `
            <div class="view-grid">
                <div class="view-item">
                    <h4>Project Name</h4>
                    <p>${project.projectName}</p>
                </div>
                <div class="view-item">
                    <h4>Customer ID</h4>
                    <p>${project.customerId}</p>
                </div>
                <div class="view-item">
                    <h4>Contact Person</h4>
                    <p>${project.contactPerson}</p>
                </div>
                <div class="view-item">
                    <h4>Contact Number</h4>
                    <p>${project.contactNumber}</p>
                </div>
                <div class="view-item">
                    <h4>Email</h4>
                    <p>${project.contactEmail}</p>
                </div>
                <div class="view-item">
                    <h4>Designation</h4>
                    <p>${project.contactDesignation}</p>
                </div>
                <div class="view-item">
                    <h4>Type of Project</h4>
                    <p>${project.typeOfProject}</p>
                </div>
                <div class="view-item">
                    <h4>Allocated Team</h4>
                    <p>${project.allocatedTeam}</p>
                </div>
                <div class="view-item">
                    <h4>Reporting Person</h4>
                    <p>${project.reportingPerson}</p>
                </div>
                <div class="view-item">
                    <h4>Start Date</h4>
                    <p>${this.formatDate(project.date)}</p>
                </div>
                <div class="view-item">
                    <h4>Completion Date</h4>
                    <p>${this.formatDate(project.deadline)}</p>
                </div>
                <div class="view-item">
                    <h4>Documents</h4>
                    <p>${project.documents && project.documents.length > 0 ? 
                        project.documents.map(d => d.name).join(', ') : 'No documents'}</p>
                </div>
                <div class="view-item" style="grid-column: 1 / -1;">
                    <h4>Project Description</h4>
                    <p>${project.specification}</p>
                </div>
                <div class="view-item" style="grid-column: 1 / -1;">
                    <h4>Remarks</h4>
                    <p>${project.remarks || 'No remarks'}</p>
                </div>
            </div>
        `;
        
        document.getElementById('viewProjectModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    deleteProject(index) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.projects.splice(index, 1);
            this.saveProjects();
            this.updateTable();
            this.showToast('Project Deleted', 'Project has been removed successfully.');
        }
    }

    truncateText(text, maxLength) {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showToast(title, description) {
        const toastContainer = document.getElementById('projectToastContainer') || 
                              document.getElementById('toast-container');
        
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <h4>${title}</h4>
            <p>${description}</p>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Handle project type change
function handleProjectTypeChange() {
    const typeSelect = document.getElementById('typeOfProject');
    const customInput = document.getElementById('customProjectType');
    
    if (!typeSelect || !customInput) return;
    
    if (typeSelect.value === 'other') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Global function for document upload
function handleProjectDocUpload(event) {
    if (window.projectManager) {
        window.projectManager.handleDocumentUpload(event);
    }
}

// Initialize the project manager
const projectManager = new ProjectManager();
window.projectManager = projectManager;

// Global functions for HTML onclick handlers
function openProjectForm() {
    projectManager.openForm();
}

function closeProjectForm() {
    projectManager.closeForm();
}

function closeProjectViewModal() {
    projectManager.closeViewModal();
}