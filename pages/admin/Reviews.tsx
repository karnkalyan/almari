import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, Trash2, XCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import { Review } from '../../types';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const load = async () => setReviews(await apiService.getReviews());

  useEffect(() => {
    load().catch(error => {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    });
  }, []);

  const updateStatus = async (id: string, status: Review['status']) => {
    await apiService.updateReview(id, { status });
    toast.success(`Review ${status}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Review Management</h1>
        <p className="text-sm text-gray-500">Approve, reject, and moderate customer product reviews.</p>
      </div>
      <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Social Proof & Reviews</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Customer Sentiment Analysis</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
              <tr>
                <th className="px-8 py-6">Product & Author</th>
                <th className="px-8 py-6">Rating & Status</th>
                <th className="px-8 py-6">Feedback</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.map(review => (
                <tr key={review.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 p-1 flex items-center justify-center border border-gray-50 shadow-sm overflow-hidden">
                        {review.product?.primaryImage ? <img src={review.product.primaryImage} alt="" className="max-w-full max-h-full object-contain" /> : <div className="text-xs font-bold text-gray-400">N/A</div>}
                      </div>
                      <div>
                        <p className="font-black text-[var(--brand-primary)] text-sm tracking-tight">{review.product?.name || 'Unknown Product'}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">By {review.user?.name || 'Guest User'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                       <div className="flex items-center gap-0.5">
                         {[1,2,3,4,5].map(star => (
                           <div key={star} className={`w-3 h-3 rounded-full ${star <= (review.rating || 0) ? 'bg-[var(--brand-accent)]' : 'bg-gray-200'}`}></div>
                         ))}
                       </div>
                       <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${review.status === 'approved' ? 'bg-green-500/10 text-green-600' : review.status === 'rejected' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'}`}>
                         {review.status}
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{review.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1 font-medium mt-1">{review.comment}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => updateStatus(review.id, 'approved')} className="p-2.5 bg-white border border-gray-100 text-slate-400 hover:text-green-600 hover:border-green-600 hover:bg-green-50 rounded-xl transition shadow-sm">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => updateStatus(review.id, 'rejected')} className="p-2.5 bg-white border border-gray-100 text-slate-400 hover:text-red-600 hover:border-red-600 hover:bg-red-50 rounded-xl transition shadow-sm">
                        <XCircle size={16} />
                      </button>
                      <button onClick={async () => { if(confirm('Delete this review?')) { await apiService.deleteReview(review.id); toast.success('Deleted'); load(); } }} className="p-2.5 bg-white border border-gray-100 text-slate-400 hover:text-gray-600 hover:border-gray-400 rounded-xl transition shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews.length === 0 && <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">No Feedback Recorded</div>}
        </div>
      </section>
    </div>
  );
};
