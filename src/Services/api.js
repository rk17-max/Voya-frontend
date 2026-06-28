// src/lib/api.js
import axios from 'axios';

export const api = axios.create({
  // In development, talk to Port 5000. 
  // Later, when you deploy to Render/AWS, we just change this ONE string.
  baseURL: 'https://voya-backend-cmoy.onrender.com/api/v1',
  
  headers: {
    'Content-Type': 'application/json',
  },
  
  // If the backend takes longer than 10 seconds to reply, give up and throw an error
  timeout: 10000, 
});