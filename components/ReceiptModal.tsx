import React, { useRef } from 'react';
import { X, Download, Barcode } from 'lucide-react';
import { ScheduleItem, UserProfile } from '../types';
import html2canvas from 'html2canvas';

interface ReceiptModalProps {
  schedule: ScheduleItem[];
  user: UserProfile;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ schedule, user, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    try {
        const canvas = await html2canvas(receiptRef.current, {
            backgroundColor: null,
            scale: 2
        });
        const link = document.createElement('a');
        link.download = `lockin-receipt-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
    } catch (e) {
        console.error(e);
    }
  };

  const today = new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
       <div className="flex flex-col items-center gap-4">
           {/* The Receipt */}
           <div ref={receiptRef} className="w-[320px] bg-white text-black font-receipt p-6 relative shadow-2xl animate-in slide-in-from-bottom-8 duration-500 rotate-1">
                {/* Jagged Top */}
                <div className="absolute -top-2 left-0 w-full h-3 receipt-edge rotate-180"></div>
                
                <div className="text-center space-y-2 mb-6 border-b-2 border-dashed border-black pb-4">
                    <h2 className="text-3xl font-bold uppercase tracking-widest">LOCK IN</h2>
                    <p className="text-lg uppercase">Daily Manifest</p>
                    <p className="text-sm">{today.toLocaleDateString()} {today.toLocaleTimeString()}</p>
                    <p className="text-sm">USER: {user.name.toUpperCase()}</p>
                    <p className="text-sm">LVL {Math.floor(user.aura / 1000) + 1} // STRK {user.streak}</p>
                </div>

                <div className="space-y-3 mb-6 text-sm uppercase">
                    <div className="flex justify-between font-bold border-b border-black pb-1">
                        <span>ITEM / QTY</span>
                        <span>TIME</span>
                    </div>
                    {schedule.map((item, i) => (
                        <div key={i} className="flex justify-between items-start gap-2 leading-tight">
                            <span className="truncate max-w-[200px]">{item.title}</span>
                            <span className="whitespace-nowrap">{item.timeSlot.split('-')[0]}</span>
                        </div>
                    ))}
                    <div className="flex justify-between items-start gap-2 leading-tight text-zinc-500 pt-2">
                        <span>----------</span>
                        <span>-----</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <span>TOTAL QUESTS</span>
                        <span>{schedule.length}</span>
                    </div>
                </div>

                <div className="text-center space-y-2 border-t-2 border-dashed border-black pt-4">
                    <p className="text-lg font-bold">NO REFUNDS ON TIME SPENT.</p>
                    <div className="flex justify-center py-2">
                        <Barcode className="w-32 h-12" />
                    </div>
                    <p className="text-xs">THANK YOU FOR LOCKING IN</p>
                    <p className="text-xs">lockin.ai</p>
                </div>

                {/* Jagged Bottom */}
                <div className="absolute -bottom-2 left-0 w-full h-3 receipt-edge"></div>
           </div>

           {/* Controls */}
           <div className="flex gap-3">
               <button onClick={onClose} className="bg-zinc-800 text-white p-3 rounded-full hover:bg-zinc-700 transition-colors">
                   <X className="w-6 h-6" />
               </button>
               <button onClick={handleDownload} className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 transition-colors font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.5)]">
                   <Download className="w-5 h-5" /> Save Receipt
               </button>
           </div>
       </div>
    </div>
  );
};