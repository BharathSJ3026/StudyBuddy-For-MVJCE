import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, X, Edit, Trash } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSupabase } from '../contexts/SupabaseContext';

interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'class' | 'exam' | 'assignment' | 'study';
}

const SchedulePage: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<ScheduleEvent, 'id'>>({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'class'
  });
  
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // Simulate data loading since Supabase isn't connected yet
        setTimeout(() => {
          // Mock schedule data
          setEvents([
            {
              id: '1',
              title: 'Database Systems Lecture',
              description: 'Indexing and query optimization topics',
              date: '2025-08-10',
              time: '10:00',
              type: 'class'
            },
            {
              id: '2',
              title: 'Data Structures Assignment Due',
              description: 'Implementation of AVL trees',
              date: '2025-08-12',
              time: '23:59',
              type: 'assignment'
            },
            {
              id: '3',
              title: 'Machine Learning Mid-term Exam',
              description: 'Covers classification, regression, and neural networks',
              date: '2025-08-15',
              time: '14:00',
              type: 'exam'
            },
            {
              id: '4',
              title: 'Study Group Meeting',
              description: 'Prepare for the networking exam',
              date: '2025-08-11',
              time: '16:00',
              type: 'study'
            },
          ]);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [supabase]);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;
    
    // In a real implementation, this would be a Supabase call
    const event: ScheduleEvent = {
      id: Date.now().toString(),
      ...newEvent
    };
    
    setEvents([...events, event]);
    setIsAddingEvent(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'class'
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
      case 'exam':
        return 'bg-red-500/10 border-red-500/30 text-red-500';
      case 'assignment':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
      case 'study':
        return 'bg-green-500/10 border-green-500/30 text-green-500';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center h-screen">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex h-[calc(100vh-64px)]">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-primary" />
                Schedule Planner
              </h1>
              
              <button
                onClick={() => setIsAddingEvent(!isAddingEvent)}
                className="button-primary flex items-center"
              >
                {isAddingEvent ? (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Event
                  </>
                )}
              </button>
            </div>

            {isAddingEvent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-card rounded-lg shadow-md p-5"
              >
                <h2 className="text-lg font-medium mb-4">Add New Event</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-title" className="block text-sm font-medium text-text-secondary mb-1">
                      Title
                    </label>
                    <input
                      id="event-title"
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="Event title"
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="event-type" className="block text-sm font-medium text-text-secondary mb-1">
                      Type
                    </label>
                    <select
                      id="event-type"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                      className="input-field w-full"
                    >
                      <option value="class">Class</option>
                      <option value="exam">Exam</option>
                      <option value="assignment">Assignment</option>
                      <option value="study">Study</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="event-date" className="block text-sm font-medium text-text-secondary mb-1">
                      Date
                    </label>
                    <input
                      id="event-date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="event-time" className="block text-sm font-medium text-text-secondary mb-1">
                      Time
                    </label>
                    <input
                      id="event-time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="event-description" className="block text-sm font-medium text-text-secondary mb-1">
                      Description
                    </label>
                    <textarea
                      id="event-description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      placeholder="Event details"
                      rows={3}
                      className="input-field w-full resize-none"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <button
                      onClick={handleAddEvent}
                      disabled={!newEvent.title || !newEvent.date || !newEvent.time}
                      className="button-primary w-full"
                    >
                      Add to Schedule
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  className={`rounded-lg border p-4 ${getEventColor(event.type)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-text-secondary mt-1">{event.description}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="p-1 rounded-full hover:bg-card-hover transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1 rounded-full hover:bg-card-hover transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-3 text-sm">
                    <div className="flex items-center mr-4">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {event.time}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default SchedulePage;