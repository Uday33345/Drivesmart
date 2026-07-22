import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Plus,
  Gift,
  X,
  PlusCircle,
  Check } from
'lucide-react';
import { mockLearner } from '../../data/mockDb';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { supabaseService } from '../../lib/supabaseService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';

const initialSpendData = [
  { month: 'Jan', amount: 1200 },
  { month: 'Feb', amount: 1800 },
  { month: 'Mar', amount: 1500 },
  { month: 'Apr', amount: 2600 },
  { month: 'May', amount: 1300 },
  { month: 'Jun', amount: 800 }
];

export function LearnerWallet() {
  // Safe fallback learner object to prevent runtime import/database resolution issues
  const safeMockLearner = {
    email: 'learner@example.com',
    name: 'Aarav Sharma',
    phone: '+91 9876543210',
    level: 'Intermediate',
    driving_score: 78,
    total_sessions: 12,
    wallet_balance: 1500,
    preferred_vehicle: 'Car',
    goal: "Get Driver's License by next month",
    test_ready: false,
    photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  };

  const { learnerProfile, updateLearnerProfile } = useAuth();
  const learner = learnerProfile || mockLearner || safeMockLearner;

  const [localTransactions, setLocalTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await supabaseService.getLearnerTransactions(learner.email);
      setLocalTransactions(data);
    };
    fetchTransactions();
  }, [learner.email]);

  const [cards, setCards] = useState([
    { id: '1', number: '•••• •••• •••• 4321', type: 'Visa', expiry: '12/28' },
    { id: '2', number: '•••• •••• •••• 8899', type: 'Mastercard', expiry: '09/27' }
  ]);

  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isManageCardsOpen, setIsManageCardsOpen] = useState(false);
  
  const [addAmount, setAddAmount] = useState('1000');
  const [selectedCardId, setSelectedCardId] = useState('1');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardType, setNewCardType] = useState('Visa');

  const [isAddingNewCard, setIsAddingNewCard] = useState(false);

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          await updateLearnerProfile({ wallet_balance: learner.wallet_balance + amount });
          
          const newTx = {
            type: 'credit',
            title: 'Wallet Top-up',
            amount: amount,
            date: 'Just now'
          };
          await supabaseService.addLearnerTransaction(learner.email, newTx);
          
          const data = await supabaseService.getLearnerTransactions(learner.email);
          setLocalTransactions(data);
          setIsAddMoneyOpen(false);
          resolve(true);
        } catch (err) {
          reject(err);
        }
      }),
      {
        loading: 'Processing payment...',
        success: () => `Top-up of ₹${amount} successful!`,
        error: 'Payment failed'
      }
    );
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber.trim() || !newCardExpiry.trim()) {
      toast.error('Please fill in card details');
      return;
    }

    const formattedNumber = `•••• •••• •••• ${newCardNumber.slice(-4)}`;
    const newCard = {
      id: Date.now().toString(),
      number: formattedNumber,
      type: newCardType,
      expiry: newCardExpiry
    };

    setCards([...cards, newCard]);
    setSelectedCardId(newCard.id);
    setNewCardNumber('');
    setNewCardExpiry('');
    setIsAddingNewCard(false);
    toast.success('Card added successfully');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Wallet</h1>
        <p className="text-navy-200 mt-1">
          Manage your balance and view transactions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-8 relative overflow-hidden lg:col-span-2 bg-gradient-to-br from-navy-800 to-navy-900">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-navy-200 font-medium mb-1">
                  Current Balance
                </p>
                <h2 className="text-5xl font-bold font-display text-white">
                  ₹{learner.wallet_balance}
                </h2>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10">
                <WalletIcon size={32} className="text-primary-400" />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setIsAddMoneyOpen(true)}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-glow-sm">
                <Plus size={20} />
                Add Money
              </button>
              <button 
                onClick={() => setIsManageCardsOpen(true)}
                className="flex-1 glass hover:bg-white/10 py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <CreditCard size={20} />
                Manage Cards
              </button>
            </div>
          </div>
        </motion.div>

        {/* Cashback Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-6 flex flex-col justify-center items-center text-center">
          
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
            <Gift size={32} />
          </div>
          <h3 className="text-lg font-medium text-navy-200">
            Total Cashback Earned
          </h3>
          <p className="text-3xl font-bold mt-2 text-green-400">₹1,240</p>
          <p className="text-sm text-navy-300 mt-4">
            Book packages to earn more cashback!
          </p>
        </motion.div>

        {/* Spend Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6 lg:col-span-2 h-[350px]">
          
          <h3 className="text-xl font-semibold mb-6">Spend Analytics</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={initialSpendData}
              margin={{ top: 0, right: 0, bottom: 20, left: -20 }}>
              
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false} />
              
              <XAxis
                dataKey="month"
                stroke="#64748b"
                tick={{ fill: '#64748b' }}
                axisLine={false}
                tickLine={false} />
              
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b' }}
                axisLine={false}
                tickLine={false} />
              
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{
                  backgroundColor: '#0a1628',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }} />
              
              <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-6 lg:col-span-1">
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Recent</h3>
          </div>

          <div className="space-y-4 max-h-[240px] overflow-y-auto pr-1">
            {localTransactions.map((tx) =>
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
              
                <div className="flex items-center gap-3">
                  <div
                  className={`p-2 rounded-lg ${tx.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  
                    {tx.type === 'credit' ?
                      <ArrowDownRight size={20} /> :
                      <ArrowUpRight size={20} />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.title}</p>
                    <p className="text-xs text-navy-300">{tx.date}</p>
                  </div>
                </div>
                <div
                className={`font-semibold ${tx.type === 'credit' ? 'text-green-400' : 'text-white'}`}>
                
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* --- Add Money Modal --- */}
      <AnimatePresence>
        {isAddMoneyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddMoneyOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-strong rounded-3xl p-6 max-w-md w-full border border-white/10 relative z-10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <WalletIcon className="text-primary-400" /> Add Money
                </h3>
                <button onClick={() => setIsAddMoneyOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleTopUpSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-navy-200 mb-2">Enter Amount (₹)</label>
                  <input 
                    type="number" 
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors text-2xl font-bold text-center"
                    required
                    min="100"
                  />
                  <div className="flex gap-2 mt-3">
                    {['500', '1000', '2000', '5000'].map((amt) => (
                      <button 
                        key={amt} 
                        type="button" 
                        onClick={() => setAddAmount(amt)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${addAmount === amt ? 'bg-primary-500 border-primary-500 text-white' : 'glass border-transparent text-navy-200'}`}>
                        +₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-navy-200 mb-2">Select Payment Card</label>
                  <div className="space-y-2">
                    {cards.map((c) => (
                      <div 
                        key={c.id} 
                        onClick={() => setSelectedCardId(c.id)}
                        className={`p-3 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-colors ${selectedCardId === c.id ? 'border-primary-500 bg-primary-500/10' : 'glass border-transparent'}`}>
                        <div className="flex items-center gap-3">
                          <CreditCard size={20} className="text-navy-300" />
                          <div>
                            <p className="text-sm font-semibold">{c.number}</p>
                            <p className="text-xs text-navy-200">{c.type} • Exp {c.expiry}</p>
                          </div>
                        </div>
                        {selectedCardId === c.id && <Check size={18} className="text-primary-500" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddMoneyOpen(false)}
                    className="flex-1 glass py-3 rounded-xl font-medium transition-colors hover:bg-white/10">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold transition-all shadow-glow">
                    Top up Wallet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Manage Cards Modal --- */}
      <AnimatePresence>
        {isManageCardsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsManageCardsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-strong rounded-3xl p-6 max-w-md w-full border border-white/10 relative z-10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <CreditCard className="text-blue-400" /> Payment Cards
                </h3>
                <button onClick={() => setIsManageCardsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {cards.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <CreditCard size={20} className="text-navy-300" />
                        <div>
                          <p className="text-sm font-semibold">{c.number}</p>
                          <p className="text-xs text-navy-200">{c.type} • Exp {c.expiry}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setCards(cards.filter(card => card.id !== c.id));
                          toast.success('Card removed successfully');
                        }}
                        className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1 rounded hover:bg-red-400/10 transition-colors">
                        Remove
                      </button>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <p className="text-center text-navy-300 py-4">No cards added yet.</p>
                  )}
                </div>

                {!isAddingNewCard ? (
                  <button 
                    onClick={() => setIsAddingNewCard(true)}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-white/40 py-3 rounded-xl text-sm text-navy-200 hover:text-white transition-colors">
                    <PlusCircle size={16} /> Add New Card
                  </button>
                ) : (
                  <form onSubmit={handleAddCardSubmit} className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div>
                      <label className="block text-xs text-navy-200 mb-1">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="4111 2222 3333 4444" 
                        maxLength={19}
                        value={newCardNumber}
                        onChange={(e) => setNewCardNumber(e.target.value)}
                        className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-navy-200 mb-1">Expiry (MM/YY)</label>
                        <input 
                          type="text" 
                          placeholder="12/29" 
                          maxLength={5}
                          value={newCardExpiry}
                          onChange={(e) => setNewCardExpiry(e.target.value)}
                          className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-navy-200 mb-1">Card Type</label>
                        <select 
                          value={newCardType}
                          onChange={(e) => setNewCardType(e.target.value)}
                          className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                        >
                          <option value="Visa">Visa</option>
                          <option value="Mastercard">Mastercard</option>
                          <option value="Rupay">Rupay</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setIsAddingNewCard(false)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-xs py-2 rounded-lg font-medium transition-colors">
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 bg-primary-500 hover:bg-primary-600 text-xs text-white py-2 rounded-lg font-semibold transition-all">
                        Save Card
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>);
}