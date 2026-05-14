import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { 
  DashboardSquare02Icon, 
  PlusSignIcon, 
  Delete02Icon, 
  CheckmarkCircle01Icon,
  Task01Icon,
  UserGroupIcon,
  Calendar03Icon,
  MoreVerticalIcon
} from '@hugeicons/core-free-icons';
import { finalize, forkJoin } from 'rxjs';

interface ProjectTask {
  _id?: string;
  task: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
}

interface Project {
  _id: string;
  title: string;
  client?: string;
  description?: string;
  startDate: Date;
  deadline?: Date;
  managerId: string;
  teamMembers: any[];
  checklist: ProjectTask[];
  status: string;
  progress: number;
}

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HugeiconsIconComponent],
  templateUrl: './project-management.html',
  styleUrl: './project-management.css'
})
export class ProjectManagement implements OnInit {
  private apiService = inject(ApiService);

  readonly DashboardSquare02Icon = DashboardSquare02Icon;
  readonly PlusSignIcon = PlusSignIcon;
  readonly Delete02Icon = Delete02Icon;
  readonly CheckmarkCircle01Icon = CheckmarkCircle01Icon;
  readonly Task01Icon = Task01Icon;
  readonly UserGroupIcon = UserGroupIcon;
  readonly Calendar03Icon = Calendar03Icon;
  readonly MoreVerticalIcon = MoreVerticalIcon;

  userRole = signal<string | null>(localStorage.getItem('user_role'));
  currentUser = signal<any>(null);

  projects = signal<Project[]>([]);
  teamMembers = signal<any[]>([]); // Potential members (interns + employees)
  isLoading = signal(true);
  showAddModal = signal(false);
  isEditMode = signal(false);
  editingProjectId = signal<string | null>(null);
  activeMenuId = signal<string | null>(null);

  // Form State
  newProject = signal<any>({
    title: '',
    client: '',
    description: '',
    deadline: '',
    teamMembers: [],
    checklist: []
  });

  tempTask = signal<string>('');

  ngOnInit() {
    const data = localStorage.getItem('user_data');
    if (data) {
      this.currentUser.set(JSON.parse(data));
    }
    this.fetchData();
  }

  fetchData() {
    this.isLoading.set(true);
    const managerId = this.currentUser()?._id || this.currentUser()?.employeeId;
    
    forkJoin({
      projects: this.apiService.getManagerProjects(managerId),
      interns: this.apiService.getAllActiveInterns('all', 'approved'),
      employees: this.apiService.getAllEmployees('all', 'approved')
    }).subscribe({
      next: (res: any) => {
        this.projects.set(res.projects.projects || []);
        
        // Combine interns and employees for member selection
        const members = [
          ...res.interns.map((i: any) => ({ ...i, memberType: 'intern' })),
          ...res.employees.map((e: any) => ({ ...e, memberType: 'employee' }))
        ];
        this.teamMembers.set(members);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch project data', err);
        this.isLoading.set(false);
      }
    });
  }

  openModal() {
    this.isEditMode.set(false);
    this.editingProjectId.set(null);
    this.resetForm();
    this.showAddModal.set(true);
  }

  toggleMenu(event: Event, projectId: string) {
    event.stopPropagation();
    if (this.activeMenuId() === projectId) {
      this.activeMenuId.set(null);
    } else {
      this.activeMenuId.set(projectId);
    }
  }

  editProject(project: Project) {
    this.activeMenuId.set(null);
    this.isEditMode.set(true);
    this.editingProjectId.set(project._id);
    this.newProject.set({
      title: project.title,
      client: project.client || '',
      description: project.description || '',
      deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
      teamMembers: [...(project.teamMembers || [])],
      checklist: [...(project.checklist || [])]
    });
    this.showAddModal.set(true);
  }

  closeModal() {
    this.showAddModal.set(false);
  }

  resetForm() {
    this.newProject.set({
      title: '',
      client: '',
      description: '',
      deadline: '',
      teamMembers: [],
      checklist: []
    });
    this.tempTask.set('');
  }

  addMember(member: any) {
    const current = this.newProject();
    if (!current.teamMembers.find((m: any) => m.memberId === member._id)) {
      current.teamMembers.push({
        memberId: member._id,
        memberType: member.memberType,
        fullName: member.fullName
      });
      this.newProject.set({ ...current });
    }
  }

  removeMember(index: number) {
    const current = this.newProject();
    current.teamMembers.splice(index, 1);
    this.newProject.set({ ...current });
  }

  addTask() {
    if (!this.tempTask().trim()) return;
    const current = this.newProject();
    current.checklist.push({
      task: this.tempTask().trim(),
      isCompleted: false
    });
    this.newProject.set({ ...current });
    this.tempTask.set('');
  }

  removeTask(index: number) {
    const current = this.newProject();
    current.checklist.splice(index, 1);
    this.newProject.set({ ...current });
  }

  saveProject() {
    const projectData = this.newProject();
    if (!projectData.title) {
      alert('Project title is required');
      return;
    }

    this.isLoading.set(true);
    const apiCall = this.isEditMode() 
      ? this.apiService.updateProject(this.editingProjectId()!, projectData)
      : this.apiService.createProject({ ...projectData, managerId: this.currentUser()?._id });

    apiCall.subscribe({
      next: () => {
        this.fetchData();
        this.closeModal();
      },
      error: (err) => {
        alert('Failed to save project: ' + (err.error?.error || err.message));
        this.isLoading.set(false);
      }
    });
  }

  toggleTask(project: Project, task: ProjectTask) {
    if (!task._id) return;
    this.apiService.toggleProjectTask(project._id, task._id, this.currentUser()?._id).subscribe({
      next: (res: any) => {
        // Update local state
        const idx = this.projects().findIndex(p => p._id === project._id);
        if (idx !== -1) {
          const updatedProjects = [...this.projects()];
          updatedProjects[idx] = res.project;
          this.projects.set(updatedProjects);
        }
      }
    });
  }

  deleteProject(projectId: string) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    this.apiService.deleteProject(projectId).subscribe({
      next: () => this.fetchData(),
      error: (err) => alert('Failed to delete project')
    });
  }

  getProgressColor(progress: number): string {
    if (progress < 30) return '#ef4444';
    if (progress < 70) return '#f59e0b';
    return '#10b981';
  }
}
