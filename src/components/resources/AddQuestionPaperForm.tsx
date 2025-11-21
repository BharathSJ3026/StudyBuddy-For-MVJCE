import React, { useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AddQuestionPaperFormProps {
  courseId: string;
  onPaperAdded: () => void;
  onClose: () => void;
}

const AddQuestionPaperForm: React.FC<AddQuestionPaperFormProps> = ({
  courseId,
  onPaperAdded,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { supabase } = useSupabase();
  const { user } = useAuth();

  const isFormValid = () => {
    if (!title.trim()) return false;
    if (!year.trim() || isNaN(Number(year))) return false;
    return link.trim() !== '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to add question papers');
      return;
    }

    if (!isFormValid()) {
      toast.error('Please fill in all fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      const paperData = {
        title: title.trim(),
        year: parseInt(year),
        course_id: courseId,
        file_url: link,
      };

      console.log('Attempting to add question paper:', paperData);

      const { data, error } = await supabase
        .from('question_papers')
        .insert(paperData)
        .select();

      if (error) {
        console.error('Error adding question paper:', error);
        throw error;
      }

      toast.success('Question paper added successfully!');
      onPaperAdded();
      onClose();
    } catch (error) {
      console.error('Error adding question paper:', error);
      toast.error(`Failed to add question paper: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonText = () => {
    if (isSubmitting) return 'ADDING...';
    return 'ADD PAPER';
  };

  const isButtonDisabled = isSubmitting || !isFormValid();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-xs font-bold text-slate-500 mb-1 uppercase">
          Paper Title / Exam Name
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono placeholder-slate-700"
          placeholder="E.G. MID-TERM EXAM 2024"
          required
        />
      </div>

      <div>
        <label htmlFor="year" className="block text-xs font-bold text-slate-500 mb-1 uppercase">
          Year
        </label>
        <input
          type="number"
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono placeholder-slate-700"
          placeholder="2024"
          required
        />
      </div>

      <div>
        <label htmlFor="link" className="block text-xs font-bold text-cyan-500 mb-1 uppercase">
          Google Drive Link URL
        </label>
        <input
          type="url"
          id="link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/50 rounded-sm focus:outline-none focus:border-cyan-400 text-cyan-300 text-sm font-mono placeholder-slate-700"
          placeholder="https://drive.google.com/..."
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-sm uppercase tracking-wider transition-all"
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`px-4 py-2 text-xs font-bold text-white border border-transparent rounded-sm uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] ${
            isButtonDisabled 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none' 
              : 'bg-cyan-600 hover:bg-cyan-500'
          }`}
        >
          {getButtonText()}
        </button>
      </div>
    </form>
  );
};

export default AddQuestionPaperForm;
