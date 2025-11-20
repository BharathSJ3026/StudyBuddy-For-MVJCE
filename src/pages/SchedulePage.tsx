import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, X, Edit, Trash, ChevronLeft, ChevronRight, LayoutList, Grid } from 'lucide-react';
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

const CalendarView: React.FC<{ events: ScheduleEvent[], onSelectDate: (date: string | null) => void, selectedDate: string | null }> = ({ events, onSelectDate, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDayEvents = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const renderDays = () => {
    const days = [];
    // Empty cells for days before start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-slate-900/30 border border-slate-800/50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getDayEvents(day);
      const isSelected = selectedDate === dateStr;
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <div 
          key={day} 
          onClick={() => onSelectDate(isSelected ? null : dateStr)}
          className={`h-24 border border-slate-800 p-2 relative cursor-pointer transition-all hover:bg-slate-900/80 ${isSelected ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-slate-900/50'} ${isToday ? 'ring-1 ring-cyan-500 inset-0' : ''}`}
        >
          <span className={`text-sm font-bold ${isToday ? 'text-cyan-400' : 'text-slate-400'}`}>{day}</span>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-24px)] scrollbar-hide">
            {dayEvents.map((event, idx) => (
              <div 
                key={idx} 
                className={`text-[10px] px-1 py-0.5 rounded-sm truncate ${
                  event.type === 'class' ? 'bg-blue-500/20 text-blue-300' :
                  event.type === 'exam' ? 'bg-red-500/20 text-red-300' :
                  event.type === 'assignment' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
                }`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-sm p-6 mb-8 shadow-lg relative overflow-hidden">
       <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center">
           <Calendar className="w-5 h-5 mr-2 text-cyan-500" />
           {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
         </h2>
         <div className="flex space-x-2">
           <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-800 rounded-sm text-slate-400 hover:text-cyan-400 transition-colors">
             <ChevronLeft className="w-5 h-5" />
           </button>
           <button onClick={handleNextMonth} className="p-2 hover:bg-slate-800 rounded-sm text-slate-400 hover:text-cyan-400 transition-colors">
             <ChevronRight className="w-5 h-5" />
           </button>
         </div>
       </div>
       
       <div className="grid grid-cols-7 gap-px bg-slate-800 border border-slate-800 mb-px">
         {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
           <div key={day} className="bg-slate-950 py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
             {day}
           </div>
         ))}
       </div>
       <div className="grid grid-cols-7 gap-px bg-slate-800 border border-slate-800">
         {renderDays()}
       </div>
    </div>
  );
};

const SchedulePage: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
    setShowAddEventModal(false);
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

  const handleDateSelect = (date: string | null) => {
    if (date) {
      setSelectedDate(date);
      setShowDayDetailsModal(true);
    }
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

  const renderEventList = (filteredEvents: ScheduleEvent[]) => (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {filteredEvents.length === 0 ? (
        <div className="text-center py-8 text-slate-500 border border-slate-800 border-dashed rounded-sm">
          No events scheduled for this period.
        </div>
      ) : (
        filteredEvents.map((event) => (
          <motion.div
            key={event.id}
            variants={itemVariants}
            className={`rounded-sm border p-4 relative overflow-hidden group transition-all hover:translate-x-1 ${
              event.type === 'class' ? 'bg-blue-900/10 border-blue-500/30 hover:border-blue-500/60' :
              event.type === 'exam' ? 'bg-red-900/10 border-red-500/30 hover:border-red-500/60' :
              event.type === 'assignment' ? 'bg-yellow-900/10 border-yellow-500/30 hover:border-yellow-500/60' :
              'bg-green-900/10 border-green-500/30 hover:border-green-500/60'
            }`}
          >
            {/* Type Indicator Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              event.type === 'class' ? 'bg-blue-500' :
              event.type === 'exam' ? 'bg-red-500' :
              event.type === 'assignment' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}></div>

            <div className="flex justify-between items-start pl-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                    event.type === 'class' ? 'bg-blue-500/20 text-blue-400' :
                    event.type === 'exam' ? 'bg-red-500/20 text-red-400' :
                    event.type === 'assignment' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {event.type.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-200 tracking-wide">{event.title}</h3>
                <p className="text-slate-400 text-sm mt-1 font-mono">{event.description}</p>
              </div>
              
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-sm hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteEvent(event.id)}
                  className="p-1.5 rounded-sm hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center mt-4 text-xs font-mono text-slate-500 pl-3 border-t border-slate-800/50 pt-2">
              <div className="flex items-center mr-6">
                <Calendar className="w-3 h-3 mr-2 text-cyan-500" />
                {formatDate(event.date).toUpperCase()}
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-2 text-cyan-500" />
                {event.time} HRS
              </div>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>
        <Navbar />
        <div className="flex-1 flex items-center justify-center h-screen relative z-10">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono relative overflow-hidden selection:bg-cyan-500/30">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10"></div>

      <div className="relative z-10">
        <Navbar />
        <div className="flex h-screen">
          <div className="hidden md:block h-full">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-56">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl mx-auto mt-24"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold flex items-center text-white uppercase tracking-widest">
                    <Calendar className="w-6 h-6 mr-2 text-cyan-500" />
                    SCHEDULER
                  </h1>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 px-4 rounded-sm flex items-center uppercase tracking-wider transition-all border border-slate-700"
                  >
                    {viewMode === 'calendar' ? (
                      <>
                        <LayoutList className="w-4 h-4 mr-2" />
                        LIST VIEW
                      </>
                    ) : (
                      <>
                        <Grid className="w-4 h-4 mr-2" />
                        CALENDAR VIEW
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowAddEventModal(true)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 px-4 rounded-sm flex items-center uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    ADD EVENT
                  </button>
                </div>
              </div>

              {viewMode === 'calendar' ? (
                <CalendarView events={events} onSelectDate={handleDateSelect} selectedDate={selectedDate} />
              ) : (
                renderEventList(events)
              )}

              {/* Add Event Modal */}
              <AnimatePresence>
                {showAddEventModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-sm shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-widest">Add New Event</h2>
                          <button 
                            onClick={() => setShowAddEventModal(false)}
                            className="text-slate-500 hover:text-white transition-colors"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="event-title" className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                              Event Title
                            </label>
                            <input
                              id="event-title"
                              type="text"
                              value={newEvent.title}
                              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                              placeholder="Enter title"
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono placeholder-slate-700"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="event-type" className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                              Type
                            </label>
                            <select
                              id="event-type"
                              value={newEvent.type}
                              onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono"
                            >
                              <option value="class">Class</option>
                              <option value="exam">Exam</option>
                              <option value="assignment">Assignment</option>
                              <option value="study">Study</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="event-date" className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                              Date
                            </label>
                            <input
                              id="event-date"
                              type="date"
                              value={newEvent.date}
                              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="event-time" className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                              Time
                            </label>
                            <input
                              id="event-time"
                              type="time"
                              value={newEvent.time}
                              onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label htmlFor="event-description" className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                              Description
                            </label>
                            <textarea
                              id="event-description"
                              value={newEvent.description}
                              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                              placeholder="Enter details..."
                              rows={3}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono resize-none placeholder-slate-700"
                            />
                          </div>
                          
                          <div className="md:col-span-2 mt-4">
                            <button
                              onClick={handleAddEvent}
                              disabled={!newEvent.title || !newEvent.date || !newEvent.time}
                              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-sm transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                            >
                              ADD EVENT
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Day Details Modal */}
              <AnimatePresence>
                {showDayDetailsModal && selectedDate && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-sm shadow-2xl relative overflow-hidden max-h-[80vh] flex flex-col"
                    >
                      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
                        <div>
                          <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-cyan-500" />
                            {formatDate(selectedDate)}
                          </h2>
                          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                            {events.filter(e => e.date === selectedDate).length} Events Scheduled
                          </p>
                        </div>
                        <button 
                          onClick={() => setShowDayDetailsModal(false)}
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      
                      <div className="p-6 overflow-y-auto">
                        {renderEventList(events.filter(e => e.date === selectedDate))}
                      </div>
                      
                      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                        <button
                          onClick={() => {
                            setNewEvent({...newEvent, date: selectedDate});
                            setShowDayDetailsModal(false);
                            setShowAddEventModal(true);
                          }}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold py-3 px-4 rounded-sm transition-all uppercase tracking-widest border border-slate-700 hover:border-cyan-500/50"
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          Add Event for this Day
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;