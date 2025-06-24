import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaSearch, FaCheck, FaTimes, FaEdit, FaTrash, FaUser, FaClock, FaEye, FaEyeSlash, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getAllFaqs, answerFaq, toggleFaqPublish, deleteFaq } from '../../../services/operations/faqAPI';
import { toast } from 'react-hot-toast';

const FaqManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFaq, setEditingFaq] = useState(null);
  const [answer, setAnswer] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 FAQs per page
  const { token } = useSelector((state) => state.auth);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const data = await getAllFaqs(token);
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [token]);

  const handleAnswerSubmit = async (faqId) => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    try {
      const updatedFaq = await answerFaq(faqId, answer, token);
      if (updatedFaq) {
        setFaqs(faqs.map(faq => 
          faq._id === faqId ? updatedFaq : faq
        ));
        setEditingFaq(null);
        setAnswer('');
        toast.success('Answer submitted successfully and email sent to user');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
    }
  };

  const handleTogglePublish = async (faqId) => {
    try {
      const updatedFaq = await toggleFaqPublish(faqId, token);
      if (updatedFaq) {
        setFaqs(faqs.map(faq => 
          faq._id === faqId ? updatedFaq : faq
        ));
        toast.success(`FAQ ${updatedFaq.isPublished ? 'published' : 'unpublished'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling FAQ publish status:', error);
      toast.error('Failed to update FAQ status');
    }
  };

  const handleDeleteFaq = async (faqId) => {
    try {
      const success = await deleteFaq(faqId, token);
      if (success) {
        setFaqs(faqs.filter(faq => faq._id !== faqId));
        setDeleteConfirm(null);
        toast.success('FAQ deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.answer && faq.answer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      faq.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.userId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.userId.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'pending' && faq.status === 'pending') ||
      (filterStatus === 'answered' && faq.status === 'answered') ||
      (filterStatus === 'published' && faq.isPublished) ||
      (filterStatus === 'unpublished' && faq.status === 'answered' && !faq.isPublished);

    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFaqs = filteredFaqs.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of FAQ list
    document.getElementById('faq-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusBadge = (faq) => {
    if (faq.status === 'pending') {
      return <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">Pending</span>;
    }
    if (faq.status === 'answered' && faq.isPublished) {
      return <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">Published</span>;
    }
    if (faq.status === 'answered' && !faq.isPublished) {
      return <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">Answered</span>;
    }
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-richblack-900 p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="bg-richblack-800 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-richblack-5 mb-2">FAQ Management</h1>
              <p className="text-richblack-300">Manage user questions and publish FAQs</p>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-richblack-700 px-4 py-2 rounded-lg">
                <div className="text-sm text-richblack-300">Total FAQs</div>
                <div className="text-xl font-bold text-richblack-5">{faqs.length}</div>
              </div>
              <div className="bg-richblack-700 px-4 py-2 rounded-lg">
                <div className="text-sm text-richblack-300">Pending</div>
                <div className="text-xl font-bold text-yellow-400">{faqs.filter(f => f.status === 'pending').length}</div>
              </div>
              <div className="bg-richblack-700 px-4 py-2 rounded-lg">
                <div className="text-sm text-richblack-300">Published</div>
                <div className="text-xl font-bold text-green-400">{faqs.filter(f => f.isPublished).length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-richblack-800 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <input
                type="text"
                placeholder="Search FAQs, users, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
            </div>

            {/* Filter */}
            <div className="relative min-w-[200px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none bg-richblack-700 border border-richblack-600 rounded-lg px-4 py-3 pr-10 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All FAQs</option>
                <option value="pending">Pending</option>
                <option value="answered">Answered</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
              <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-richblack-400 pointer-events-none" />
            </div>
          </div>

          {/* Results info and pagination info */}
          {filteredFaqs.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-richblack-600">
              <div className="text-sm text-richblack-400 mb-2 sm:mb-0">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredFaqs.length)} of {filteredFaqs.length} FAQs
              </div>
              <div className="text-sm text-richblack-400">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </div>

        {/* FAQ List */}
        {loading ? (
          <div className="bg-richblack-800 rounded-xl p-12 text-center shadow-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-richblack-400 text-lg">Loading FAQs...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-richblack-800 rounded-xl p-12 text-center shadow-lg">
            <div className="text-6xl text-richblack-600 mb-4">🤔</div>
            <h3 className="text-xl font-semibold text-richblack-5 mb-2">No FAQs Found</h3>
            <p className="text-richblack-400">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No FAQs have been submitted yet'}
            </p>
          </div>
        ) : (
          <>
            {/* FAQ List */}
            <div id="faq-list" className="space-y-4 mb-6">
              {currentFaqs.map((faq) => (
                <div key={faq._id} className="bg-richblack-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow relative w-full">
                  {deleteConfirm === faq._id && (
                    <div className="absolute inset-0 bg-richblack-900 bg-opacity-95 flex items-center justify-center z-10">
                      <div className="bg-richblack-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-richblack-5 mb-4">Confirm Delete</h3>
                        <p className="text-richblack-300 mb-6">
                          Are you sure you want to delete this FAQ? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDeleteFaq(faq._id)}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 px-4 py-2 bg-richblack-600 text-white rounded-lg hover:bg-richblack-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6 overflow-hidden">
                    {/* FAQ Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4 w-full">
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusBadge(faq)}
                          <span className="text-sm text-richblack-400 flex items-center gap-1">
                            <FaClock className="text-xs" />
                            {formatDate(faq.createdAt)}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-richblack-5 mb-3 leading-relaxed break-all word-break-break-all overflow-hidden max-w-full">
                          {faq.question}
                        </h3>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {faq.status === 'answered' && (
                          <button
                            onClick={() => handleTogglePublish(faq._id)}
                            className={`p-3 rounded-lg transition-all ${
                              faq.isPublished 
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            }`}
                            title={faq.isPublished ? 'Published - Click to unpublish' : 'Not Published - Click to publish'}
                          >
                            {faq.isPublished ? <FaEye /> : <FaEyeSlash />}
                          </button>
                        )}
                        
                        {!faq.answer && (
                          <button
                            onClick={() => {
                              setEditingFaq(faq._id);
                              setAnswer(faq.answer || '');
                            }}
                            className="p-3 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                            title="Answer Question"
                          >
                            <FaEdit />
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteConfirm(faq._id)}
                          className="p-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                          title="Delete FAQ"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Answer Section */}
                    {editingFaq === faq._id ? (
                      <div className="bg-richblack-700 rounded-lg p-4 mb-4">
                        <label className="block text-sm font-medium text-richblack-300 mb-2">
                          Your Answer
                        </label>
                        <textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Type your detailed answer here..."
                          rows={6}
                          className="w-full px-4 py-3 bg-richblack-600 border border-richblack-500 rounded-lg text-white placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => handleAnswerSubmit(faq._id)}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                          >
                            Submit Answer
                          </button>
                          <button
                            onClick={() => {
                              setEditingFaq(null);
                              setAnswer('');
                            }}
                            className="px-6 py-2 bg-richblack-600 text-white rounded-lg hover:bg-richblack-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      faq.answer && (
                        <div className="bg-richblack-700 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-medium text-richblack-300 mb-2">Answer:</h4>
                          <p className="text-sm sm:text-base text-richblack-100 leading-relaxed break-all word-break-break-all overflow-hidden max-w-full">{faq.answer}</p>
                          {faq.answeredAt && (
                            <p className="text-xs text-richblack-400 mt-2">
                              Answered on {formatDate(faq.answeredAt)}
                            </p>
                          )}
                        </div>
                      )
                    )}

                    {/* User Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-richblack-400 bg-richblack-700 rounded-lg p-3">
                      <FaUser className="text-richblack-500" />
                      <span className="flex flex-wrap gap-1">
                        <span>Asked by:</span> <span className="text-richblack-300 font-medium">
                          {faq.userId.firstName} {faq.userId.lastName}
                        </span> ({faq.userId.email})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-richblack-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all ${
                      currentPage === 1
                        ? 'bg-richblack-700 text-richblack-500 cursor-not-allowed'
                        : 'bg-richblack-700 text-richblack-300 hover:bg-richblack-600'
                    }`}
                  >
                    <FaChevronLeft />
                  </button>

                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage = page === 1 || 
                                      page === totalPages || 
                                      (page >= currentPage - 1 && page <= currentPage + 1);
                      
                      if (!showPage && page === 2 && currentPage > 4) {
                        return <span key={page} className="px-2 text-richblack-500">...</span>;
                      }
                      
                      if (!showPage && page === totalPages - 1 && currentPage < totalPages - 3) {
                        return <span key={page} className="px-2 text-richblack-500">...</span>;
                      }
                      
                      if (!showPage) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg transition-all ${
                            currentPage === page
                              ? 'bg-blue-500 text-white'
                              : 'bg-richblack-700 text-richblack-300 hover:bg-richblack-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all ${
                      currentPage === totalPages
                        ? 'bg-richblack-700 text-richblack-500 cursor-not-allowed'
                        : 'bg-richblack-700 text-richblack-300 hover:bg-richblack-600'
                    }`}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FaqManagement;
