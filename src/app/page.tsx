'use client';

import React, { useState, useEffect } from 'react';
import { addDays, format } from 'date-fns';
import { DashboardHeader } from '@/components/dashboard/header';
import { ScheduleView } from '@/components/dashboard/schedule-view';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { FaPlus } from 'react-icons/fa';
import { Transport } from '@/lib/data';
import { AddTransportForm } from '@/components/admin/add-transport-form';
import { toast } from "sonner";
import { 
  deleteTransport, 
  fetchTransportsByDate 
} from '@/lib/db-service';

export default function Home() {
  // State for navigation and transport management
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [transportToEdit, setTransportToEdit] = useState<Transport | undefined>(undefined);
  
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // Get data based on selected date
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  
  // Initialize state from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch today's transports from Supabase
        const fetchedTransports = await fetchTransportsByDate(dateStr);
        if (fetchedTransports) {
          setTransports(fetchedTransports);
        }
      } catch (error) {
        console.error("Error fetching transports:", error);
        toast.error("Failed to fetch transport data");
      }
    };

    fetchData();
  }, [dateStr]);
  
  // Date navigation handlers
  const handlePreviousDate = () => {
    setCurrentDate(prev => addDays(prev, -1));
  };
  
  const handleNextDate = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };
  
  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };
  
  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
  };
  
  const handleLoginClick = () => {
    router.push('/login');
  };
  
  const handleDeleteTransport = async (id: string) => {
    try {
      console.log("Attempting to delete transport with ID:", id);
      console.log("Current transports before deletion:", transports);
      
      if (!id) {
        console.error("Cannot delete transport: Missing ID");
        toast.error("Failed to delete transport: Missing ID");
        return;
      }
      
      // Delete from Supabase
      const success = await deleteTransport(id);
      
      if (success) {
        console.log("Supabase delete operation was successful, updating UI");
        // Important: Only update UI after successful Supabase operation
        const updatedTransports = transports.filter(transport => transport.id !== id);
        console.log("Filtered transports after deletion:", updatedTransports);
        setTransports(updatedTransports);
        toast.success("Transport deleted successfully!");
        
        // Force a refresh of data from the database
        const refreshedTransports = await fetchTransportsByDate(dateStr);
        console.log("Refreshed transports from database:", refreshedTransports);
        setTransports(refreshedTransports);
      } else {
        console.error("Supabase delete operation failed");
        toast.error("Failed to delete transport. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting transport:", error);
      toast.error("Failed to delete transport. Please try again.");
    }
  };

  const handleEditTransport = (transport: Transport) => {
    try {
      console.log("Editing transport:", transport);
      
      if (!transport?.id) {
        console.error("Cannot edit transport: Missing ID");
        toast.error("Failed to edit transport: Missing ID");
        return;
      }
      
      setTransportToEdit(transport);
      setShowAddForm(true);
    } catch (error) {
      console.error("Error setting up transport edit:", error);
      toast.error("Failed to set up transport edit.");
    }
  };

  useEffect(() => {
    // This effect runs when the user navigates back to the dashboard
    // and can be used to trigger a refresh of components
  }, []);

  return (
    <div className="space-y-6">
      <DashboardHeader
        date={currentDate}
        onPreviousDate={handlePreviousDate}
        onNextDate={handleNextDate}
        onTodayClick={handleTodayClick}
        onLoginClick={handleLoginClick}
        onDateSelect={handleDateSelect}
      />
      
      {isAuthenticated && user?.isAdmin && (
        <div className="mb-6">
          {showAddForm ? (
            <AddTransportForm 
              onCancel={() => {
                setShowAddForm(false);
                setTransportToEdit(undefined);
              }}
              transportToEdit={transportToEdit}
              onSuccess={async () => {
                // Refresh data after successful operation
                const fetchedTransports = await fetchTransportsByDate(dateStr);
                setTransports(fetchedTransports);
              }}
            />
          ) : (
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-secondary hover:bg-secondary-hover text-secondary-foreground"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Add Transport Schedule
              </Button>
            </div>
          )}
        </div>
      )}

      <ScheduleView 
        date={currentDate} 
        transports={transports} 
        role={isAuthenticated && user?.isAdmin ? "admin" : "employee"}
        onDeleteTransport={isAuthenticated && user?.isAdmin ? handleDeleteTransport : undefined}
        onEditTransport={isAuthenticated && user?.isAdmin ? handleEditTransport : undefined}
      />
    </div>
  );
}
