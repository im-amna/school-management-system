// src/app/student/fees/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  IconCircleCheck,
  IconClock,
  IconAlertCircle,
  IconPrinter,
  IconCash,
  IconX,
} from "@tabler/icons-react";

type Fee = {
  id: string;
  amount: number;
  description: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueDate: string;
  paidAt: string | null;
};

const statusConfig = {
  PAID: {
    icon: IconCircleCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Paid",
  },
  PENDING: {
    icon: IconClock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Pending",
  },
  OVERDUE: {
    icon: IconAlertCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    label: "Overdue",
  },
};

function FeeVoucher({
  fee,
  studentName,
  onClose,
  onPaid,
}: {
  fee: Fee;
  studentName: string;
  onClose: () => void;
  onPaid: (id: string) => void;
}) {
  const [paying, setPaying] = useState(false);

  const handlePrint = () => {
    const dueDate = new Date(fee.dueDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const voucherNo = fee.id.slice(0, 8).toUpperCase();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Voucher — ${voucherNo}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: #fff; color: #1e293b; padding: 48px; }
            .wrapper { max-width: 480px; margin: 0 auto; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
            .header { background: #7c3aed; color: #fff; text-align: center; padding: 28px 24px; }
            .header h1 { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
            .header p { font-size: 13px; opacity: 0.85; margin-top: 4px; }
            .body { padding: 28px 24px; }
            .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
            .row:last-of-type { border-bottom: none; }
            .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
            .value { font-size: 14px; font-weight: 600; color: #1e293b; text-align: right; }
            .amount-box { background: #f5f3ff; border: 1.5px dashed #7c3aed; border-radius: 10px; text-align: center; padding: 20px; margin: 20px 0; }
            .amount-label { font-size: 11px; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
            .amount-value { font-size: 28px; font-weight: 800; color: #7c3aed; }
            .status-badge { display: inline-block; background: #fef9c3; color: #92400e; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 100px; border: 1px solid #fde68a; margin-top: 8px; }
            .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; padding: 16px 24px; font-size: 11px; color: #94a3b8; line-height: 1.6; }
            @media print {
              body { padding: 0; }
              .wrapper { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>EduManage</h1>
              <p>Fee Payment Voucher</p>
            </div>
            <div class="body">
              <div class="row">
                <span class="label">Student</span>
                <span class="value">${studentName}</span>
              </div>
              <div class="row">
                <span class="label">Description</span>
                <span class="value">${fee.description}</span>
              </div>
              <div class="row">
                <span class="label">Due Date</span>
                <span class="value">${dueDate}</span>
              </div>
              <div class="row">
                <span class="label">Voucher No.</span>
                <span class="value">${voucherNo}</span>
              </div>
              <div class="amount-box">
                <div class="amount-label">Total Amount Due</div>
                <div class="amount-value">PKR ${fee.amount.toLocaleString()}</div>
                <div class="status-badge">${fee.status}</div>
              </div>
            </div>
            <div class="footer">
              Please present this voucher at the accounts office<br/>
              EduManage School Management System
            </div>
          </div>
        </body>
      </html>
    `;

    const win = window.open("", "_blank", "width=600,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const handleMarkPaid = async () => {
    setPaying(true);
    const res = await fetch("/api/student/fees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feeId: fee.id }),
    });
    setPaying(false);
    if (res.ok) {
      onPaid(fee.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border border-slate-100 shadow-xl w-full max-w-sm p-6">
        {/* Modal header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-base font-semibold text-slate-800">Fee voucher</p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Voucher preview */}
        <div className="border border-slate-100 rounded-lg overflow-hidden mb-5">
          <div className="bg-violet-600 text-white text-center py-4 px-5">
            <p className="font-bold text-base">EduManage</p>
            <p className="text-xs text-white/80 mt-0.5">Fee Payment Voucher</p>
          </div>
          <div className="p-4 space-y-2.5">
            {[
              { label: "Student", value: studentName },
              { label: "Description", value: fee.description },
              {
                label: "Due date",
                value: new Date(fee.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
              },
              { label: "Voucher no.", value: fee.id.slice(0, 8).toUpperCase() },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-slate-400 text-xs">{row.label}</span>
                <span className="font-medium text-slate-800">{row.value}</span>
              </div>
            ))}
            <div className="bg-violet-50 border border-dashed border-violet-300 rounded-lg text-center py-3 mt-3">
              <p className="text-xs text-violet-500 mb-1">Total amount due</p>
              <p className="text-xl font-bold text-violet-700">
                PKR {fee.amount.toLocaleString()}
              </p>
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                {fee.status}
              </span>
            </div>
          </div>
          <div className="bg-slate-50 border-t border-slate-100 text-center py-2.5 px-4">
            <p className="text-[10px] text-slate-400">
              Present this voucher at the accounts office
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5"
          >
            <IconPrinter size={14} />
            Print
          </button>
          <button
            onClick={handleMarkPaid}
            disabled={paying}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            <IconCircleCheck size={14} />
            {paying ? "..." : "Mark paid"}
          </button>
        </div>
      </div>
    </div>
  );
}
// Read-only receipt shown after a fee has been paid
function FeeReceipt({
  fee,
  studentName,
  onClose,
}: {
  fee: Fee;
  studentName: string;
  onClose: () => void;
}) {
  const handlePrint = () => {
    const paidDate = fee.paidAt
      ? new Date(fee.paidAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "—";
    const receiptNo = fee.id.slice(0, 8).toUpperCase();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt — ${receiptNo}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: #fff; color: #1e293b; padding: 48px; }
            .wrapper { max-width: 480px; margin: 0 auto; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
            .header { background: #059669; color: #fff; text-align: center; padding: 28px 24px; }
            .header h1 { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
            .header p { font-size: 13px; opacity: 0.85; margin-top: 4px; }
            .body { padding: 28px 24px; }
            .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
            .row:last-of-type { border-bottom: none; }
            .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
            .value { font-size: 14px; font-weight: 600; color: #1e293b; text-align: right; }
            .amount-box { background: #ecfdf5; border: 1.5px dashed #059669; border-radius: 10px; text-align: center; padding: 20px; margin: 20px 0; }
            .amount-label { font-size: 11px; color: #059669; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
            .amount-value { font-size: 28px; font-weight: 800; color: #059669; }
            .status-badge { display: inline-block; background: #d1fae5; color: #047857; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 100px; border: 1px solid #a7f3d0; margin-top: 8px; }
            .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; padding: 16px 24px; font-size: 11px; color: #94a3b8; line-height: 1.6; }
            @media print {
              body { padding: 0; }
              .wrapper { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>EduManage</h1>
              <p>Payment Receipt</p>
            </div>
            <div class="body">
              <div class="row">
                <span class="label">Student</span>
                <span class="value">${studentName}</span>
              </div>
              <div class="row">
                <span class="label">Description</span>
                <span class="value">${fee.description}</span>
              </div>
              <div class="row">
                <span class="label">Paid On</span>
                <span class="value">${paidDate}</span>
              </div>
              <div class="row">
                <span class="label">Receipt No.</span>
                <span class="value">${receiptNo}</span>
              </div>
              <div class="amount-box">
                <div class="amount-label">Amount Paid</div>
                <div class="amount-value">PKR ${fee.amount.toLocaleString()}</div>
                <div class="status-badge">PAID</div>
              </div>
            </div>
            <div class="footer">
              This is a computer-generated receipt<br/>
              EduManage School Management System
            </div>
          </div>
        </body>
      </html>
    `;

    const win = window.open("", "_blank", "width=600,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border border-slate-100 shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-base font-semibold text-slate-800">
            Payment receipt
          </p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="border border-slate-100 rounded-lg overflow-hidden mb-5">
          <div className="bg-emerald-600 text-white text-center py-4 px-5">
            <p className="font-bold text-base">EduManage</p>
            <p className="text-xs text-white/80 mt-0.5">Payment Receipt</p>
          </div>
          <div className="p-4 space-y-2.5">
            {[
              { label: "Student", value: studentName },
              { label: "Description", value: fee.description },
              {
                label: "Paid on",
                value: fee.paidAt
                  ? new Date(fee.paidAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—",
              },
              { label: "Receipt no.", value: fee.id.slice(0, 8).toUpperCase() },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-slate-400 text-xs">{row.label}</span>
                <span className="font-medium text-slate-800">{row.value}</span>
              </div>
            ))}
            <div className="bg-emerald-50 border border-dashed border-emerald-300 rounded-lg text-center py-3 mt-3">
              <p className="text-xs text-emerald-600 mb-1">Amount paid</p>
              <p className="text-xl font-bold text-emerald-700">
                PKR {fee.amount.toLocaleString()}
              </p>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                PAID
              </span>
            </div>
          </div>
          <div className="bg-slate-50 border-t border-slate-100 text-center py-2.5 px-4">
            <p className="text-[10px] text-slate-400">
              This is a computer-generated receipt
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5"
          >
            <IconPrinter size={14} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentFeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [receiptFee, setReceiptFee] = useState<Fee | null>(null);
  const [studentName, setStudentName] = useState("Student");

  useEffect(() => {
    Promise.all([
      fetch("/api/student/fees").then((r) => r.json()),
      fetch("/api/auth/session").then((r) => r.json()),
    ]).then(([feesData, session]) => {
      setFees(Array.isArray(feesData) ? feesData : []);
      setStudentName(session?.user?.name || "Student");
      setLoading(false);
    });
  }, []);

  const handlePaid = (feeId: string) => {
    setFees((prev) =>
      prev.map((f) =>
        f.id === feeId
          ? { ...f, status: "PAID" as const, paidAt: new Date().toISOString() }
          : f,
      ),
    );
  };

  const totalPaid = fees
    .filter((f) => f.status === "PAID")
    .reduce((s, f) => s + f.amount, 0);
  const totalPending = fees
    .filter((f) => f.status !== "PAID")
    .reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">My fees</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Track your fee payments and dues
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <IconCircleCheck size={18} className="text-emerald-600" />
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              {fees.filter((f) => f.status === "PAID").length} payments
            </span>
          </div>
          <p className="text-xl font-semibold text-slate-800 mb-0.5">
            PKR {totalPaid.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">Total paid</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <IconClock size={18} className="text-amber-600" />
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
              {fees.filter((f) => f.status !== "PAID").length} dues
            </span>
          </div>
          <p className="text-xl font-semibold text-slate-800 mb-0.5">
            PKR {totalPending.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">Pending amount</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
              <IconCash size={18} className="text-violet-600" />
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-50 text-slate-500">
              All time
            </span>
          </div>
          <p className="text-xl font-semibold text-slate-800 mb-0.5">
            {fees.length}
          </p>
          <p className="text-xs text-slate-400">Total records</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Description
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Amount
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Due date
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Status
              </th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-slate-300 text-sm"
                >
                  Loading...
                </td>
              </tr>
            ) : fees.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-slate-300 text-sm"
                >
                  No fee records yet
                </td>
              </tr>
            ) : (
              fees.map((f) => {
                const cfg = statusConfig[f.status];
                const Icon = cfg.icon;
                return (
                  <tr
                    key={f.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {f.description}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      PKR {f.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {new Date(f.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cfg.bg} ${cfg.color}`}
                      >
                        <Icon size={13} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {f.status !== "PAID" ? (
                        <button
                          onClick={() => setSelectedFee(f)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-xs font-medium transition"
                        >
                          <IconPrinter size={13} />
                          Voucher
                        </button>
                      ) : (
                        <button
                          onClick={() => setReceiptFee(f)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium transition"
                        >
                          <IconCircleCheck size={13} />
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedFee && (
        <FeeVoucher
          fee={selectedFee}
          studentName={studentName}
          onClose={() => setSelectedFee(null)}
          onPaid={handlePaid}
        />
      )}
      {receiptFee && (
        <FeeReceipt
          fee={receiptFee}
          studentName={studentName}
          onClose={() => setReceiptFee(null)}
        />
      )}
    </div>
  );
}
