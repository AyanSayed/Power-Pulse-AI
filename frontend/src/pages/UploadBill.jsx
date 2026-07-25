import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileUpload, FaFilePdf, FaCheckCircle, FaBolt, FaMoneyBillWave, FaCalendarAlt, FaIdCard } from "react-icons/fa";
import { useBill } from "../context/BillContext";
import { useToast } from "../context/ToastContext";

function UploadBill() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const { confirmBill } = useBill();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleFiles = (files) => {
  if (files && files[0]) {
    setFile(files[0]);
    setExtracted(null);
  }
};

  const handleProcess = async () => {
  if (!file) return;

  setProcessing(true);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);

    if (!res.ok) {
      // Backend sent a proper error message (400/422/500) — show it, don't set extracted
      showToast(data.error || "Failed to process bill.", "error");
      setProcessing(false);
      return;
    }

    setExtracted(data);
  } catch (err) {
    console.error(err);
    showToast("Failed to process bill. Please try again.", "error");
  }

  setProcessing(false);
};

  const handleConfirm = () => {
    confirmBill(extracted);
    showToast("Bill uploaded successfully", "success");
    navigate("/");
  };

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl font-semibold text-ink mb-1">Upload Bill</h2>
      <p className="text-slate text-sm mb-6">
        Upload your electricity bill (PDF or image) to extract usage data automatically.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`bg-white rounded-xl border-2 border-dashed p-10 text-center transition ${
          dragOver ? "border-amber bg-amber-soft" : "border-gray-200"
        }`}
      >
        <FaFileUpload className="text-3xl text-amber mx-auto mb-4" />
        <p className="text-ink font-medium mb-1">Drag and drop your bill here</p>
        <p className="text-slate text-sm mb-4">or click below to browse</p>

        <label className="inline-block bg-navy text-white font-medium px-5 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition">
          Choose File
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {file && !extracted && (
        <div className="mt-5 bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <FaFilePdf className="text-coral text-2xl" />
          <div className="flex-1">
            <p className="text-ink font-medium text-sm">{file.name}</p>
            <p className="text-slate text-xs">Ready to process</p>
          </div>
          <FaCheckCircle className="text-teal text-lg" />
        </div>
      )}

      {file && !extracted && (
        <button
          disabled={processing}
          onClick={handleProcess}
          className="mt-6 bg-amber text-navy font-display font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          {processing ? "Reading bill..." : "Process Bill"}
        </button>
      )}

      {extracted && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 border-t-4 border-t-teal p-6">
          <h3 className="font-display text-lg font-semibold text-ink mb-4">Extracted Details</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2.5 text-sm">
              <FaCalendarAlt className="text-slate" />
              <div>
                <p className="text-slate text-xs">Billing Month</p>
                <p className="font-medium text-ink">{extracted.month}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <FaBolt className="text-slate" />
              <div>
                <p className="text-slate text-xs">Units Consumed</p>
                <p className="tabular font-medium text-ink">{extracted.units} kWh</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <FaMoneyBillWave className="text-slate" />
              <div>
                <p className="text-slate text-xs">Bill Amount</p>
                <p className="tabular font-medium text-ink">₹{extracted.bill.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <FaIdCard className="text-slate" />
              <div>
                <p className="text-slate text-xs">Consumer Number</p>
                <p className="font-medium text-ink">{extracted.consumerNumber}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            className="bg-teal text-navy font-display font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition"
          >
            Confirm & Add to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadBill;
