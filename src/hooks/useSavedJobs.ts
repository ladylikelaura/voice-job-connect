
import { useState, useEffect } from 'react';

export interface SavedJob {
  id: number;
  title: string;
  company_name: string;
  url: string;
  job_type: string;
  candidate_required_location: string;
  salary: string;
  description: string;
  saved_at: string;
}

export function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);

  useEffect(() => {
    // Load saved jobs from localStorage on component mount
    const storedJobs = localStorage.getItem('savedJobs');
    if (storedJobs) {
      try {
        setSavedJobs(JSON.parse(storedJobs));
      } catch (error) {
        console.error('Error parsing saved jobs:', error);
        localStorage.removeItem('savedJobs');
      }
    }
  }, []);

  const saveJob = (job: Omit<SavedJob, 'saved_at'>) => {
    const jobWithTimestamp = {
      ...job,
      saved_at: new Date().toISOString()
    };
    
    setSavedJobs((prevSavedJobs) => {
      // Check if job is already saved
      const jobExists = prevSavedJobs.some(savedJob => savedJob.id === job.id);
      if (jobExists) {
        return prevSavedJobs;
      }
      
      // Add job to saved jobs
      const updatedJobs = [...prevSavedJobs, jobWithTimestamp];
      // Save to localStorage
      localStorage.setItem('savedJobs', JSON.stringify(updatedJobs));
      return updatedJobs;
    });
  };

  const removeJob = (jobId: number) => {
    setSavedJobs((prevSavedJobs) => {
      const updatedJobs = prevSavedJobs.filter(job => job.id !== jobId);
      // Update localStorage
      localStorage.setItem('savedJobs', JSON.stringify(updatedJobs));
      return updatedJobs;
    });
  };

  const isJobSaved = (jobId: number) => {
    return savedJobs.some(job => job.id === jobId);
  };

  return { savedJobs, saveJob, removeJob, isJobSaved };
}
