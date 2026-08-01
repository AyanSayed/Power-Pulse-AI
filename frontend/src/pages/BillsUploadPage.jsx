import UploadBill from "./UploadBill";

function BillsUploadPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Bill</h1>
        <p className="text-gray-500 mt-2">Add a new electricity bill to your account.</p>
      </div>

      <UploadBill />
    </div>
  );
}

export default BillsUploadPage;