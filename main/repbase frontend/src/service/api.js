import axios from 'axios';

// The URL where your Python main.py is running
const API_BASE_URL = 'http://localhost:8000'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: (username, password) => api.post('/api/auth/login', { username, password }),
};

export const workoutService = {
  // Pass user_id as a query parameter
  getHistory: (userId) => api.get(`/history?user_id=${userId}`),
  
  getWeeklySummary: (userId) => api.get(`/summary?user_id=${userId}`),
  

  getDetail: (sessionId, userId) => 
    console.log(`Fetching details for session ${sessionId} and user ${userId}`) ||
    api.get(`/history/${sessionId}/${userId}`) ,

  saveWorkout: (workoutData) => api.post('/workouts', workoutData),

};

export const adminService = {
  getDashboardMetrics: (userId) => api.get(`/metrics/${userId}`), // Pass userId to fetch gym-specific metrics
  getMembers: (userId) => api.get(`/getmembers/${userId}`),
  addMember: (memberData) => api.post('/addmember', memberData),
  deleteMember: (memberId) => api.delete(`/member/${memberId}`),
  getTrainers: (userId) => api.get(`/trainers/${userId}`),
  addTrainer: (trainerData) => api.post('/addtrainer', trainerData),
  addPlan: (data) => api.post("/addplan", data),
  updatePlan: (planId, data) => api.put(`/plan/${planId}`, data),
  deleteTrainer: (trainerId) => api.delete(`/trainer/${trainerId}`),
  
  
  getAdmins: () => api.get('/admins'),
  addAdmin: (adminData) => api.post('/admins', adminData),
  updateAdmin: (adminId, adminData) => api.put(`/admins/${adminId}`, adminData),
  deleteAdmin: (adminId) => api.delete(`/admins/${adminId}`),
  
};


export const membershipService = {
  // Fetch current membership for a specific user
  getStatus: (userId) => api.get(`/membership/${userId}`),
  updatePlan: (data) => api.post("/changemembership", data),
  
  // Fetch available plans (in case they differ by user)
  getPlans: (userId) => api.get(`/plans/${userId}`),
};

export const devService = {
  getDashboardStats: () => api.get('/dev/stats'),
  getGyms: () => api.get('/gyms'),
  addGym: (gymData) => api.post('/gyms', gymData),
  updateGym: (gymId, gymData) => api.put(`/gyms/${gymId}`, gymData),
  deleteGym: (gymId) => api.delete(`/gyms/${gymId}`),
};